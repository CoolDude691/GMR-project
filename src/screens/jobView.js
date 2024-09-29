


import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Switch,
  Alert,
  AppState,
  RefreshControl
} from 'react-native';
import {Appbar} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import {Auth} from '../services/api';
import {zip} from 'react-native-zip-archive';
import RNFS from 'react-native-fs';
import Toast from 'react-native-simple-toast';
import NetInfo from '@react-native-community/netinfo';
import { requestGalleryPermission } from '../permissions/requestGalleryPermission';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Get screen width for responsive design
const {width} = Dimensions.get('window');

const JobView = ({navigation}) => {
  const route = useRoute();
  const { jobID, Job} = route.params;
  const [jobDetails, setJobDetails] = useState(Job || null); 
  const [attachmentTypes, setAttachmentTypes] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [selectedImages, setSelectedImages] = useState([]);
  const [buildPdf, setBuildPdf] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState(null); 
  const [attachmentName, setAttachmentName] = useState('');
  const [description, setDescription] = useState('');
  const [offlineFormData, setOfflineFormData] = useState([]);
  const [isConnected, setIsConnected] = useState(null); 
  const [refreshing, setRefreshing] = useState(false); 
  const apiCalledRef = useRef(false);

  const staticAttachmentTypes = [
    {
      attachment_type: "20",
      visible_name: "Photos",
    },]


  useEffect(() => {
  
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      setIsConnected(state.isConnected); // Update the state with the current network status
      

      if (state.isConnected && !apiCalledRef.current) {
        submitOfflineFormData();  // Submit offline data if back online
        apiCalledRef.current = true;
      }
  
      if (!state.isConnected) {
        // Reset the flag if disconnected
        apiCalledRef.current = false;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [jobID]);
  

  const fetchJobDetails = async () => {
    try {
      const accessToken = await Auth.getPersistingAccessToken();
      setLoading(true);
      const response = await fetch(
        `http://api.goldmedalroofing.com/api/app/job-detail/${jobID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok && data) {
        setJobDetails(data);
        setAttachmentTypes(data.attachmentTypes || []);
      } else {
        setJobDetails(null);
      }
    } catch (err) {
      setError(`Failed to fetch job details: ${err.message}`); // Set detailed error message
      console.error('API Error:', err); // Log full error details
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      console.log('jobID', jobID);
      try {
        const accessToken = await Auth.getPersistingAccessToken();
        console.log('accessToken', accessToken);
        const url = `http://api.goldmedalroofing.com/api/app/job-detail/${jobID}`;
        console.log('url', url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('response', response);
        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        console.log('data online', data);
        if (response.ok && data) {
          setJobDetails(data);
          setAttachmentTypes(data.attachmentTypes || []);
        }else if (!isConnected) {
          // Set job details from offline data and set static attachment types
          setJobDetails({
            jobLabel: `${Job?.office?.office_prefix_for_jobs} - ${Job?.office_record_id}`,
            assignedRepresentative: `${Job?.assigned_user?.first_name} ${Job?.assigned_user?.last_name}`,
            jobStatus: Job?.job_status?.status_name,
            jobValue: 'No Data', // or set from Job if available
            amount: 'No Data' // or set from Job if available
          });
          setAttachmentTypes(staticAttachmentTypes); // Use static attachment types when offline
        }
      
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        fetchJobDetails();
      }else if (!state.isConnected) {
        setJobDetails({
          jobLabel: `${Job?.office?.office_prefix_for_jobs} - ${Job?.office_record_id}`,
          assignedRepresentative: `${Job?.assigned_user?.first_name} ${Job?.assigned_user?.last_name}`,
          jobStatus: Job?.job_status?.status_name,
          jobValue: 'No Data', // or set from Job if available
          amount: 'No Data' // or set from Job if available
        });
           setAttachmentTypes(staticAttachmentTypes);
       }
    });
  }, [jobID]);

  const onRefresh = async () => {
    setRefreshing(true);
    const netInfoState = await NetInfo.fetch();
    setIsConnected(netInfoState.isConnected);
    if (netInfoState.isConnected) {
      await fetchJobDetails(); // Fetch latest job details when connected
    }
    setRefreshing(false);
  };


 
  const job = jobDetails ?? {
    jobLabel: '0',
    assignedRepresentative: 'Null',
    jobValue: '$ 0.00',
    amountDue: '$ 0.00',
    jobStatus: 'U C',
  };

  const handleChooseFiles = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0, // 0 means multiple selection
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      });
  
      if (result.didCancel) {
        // Handle cancellation
      } else if (result.errorMessage) {
        // Handle error
      } else if (result?.assets?.length > 0) {
        console.log('result of file', result.assets);
        setSelectedImages(result?.assets);
        await HandleZip(result.assets);  // Pass the result.assets directly
      }
    } catch (error) {
      console.log('error image upload ', error);
    }
  };
  
  const HandleZip = async (assets) => {
    try {
      const tempDir = `${RNFS.DocumentDirectoryPath}/uploads`;
      const zipFilePath = `${tempDir}/images.zip`;
      const filePaths = assets.map(img => img.uri.replace('file://', '')); 
      console.log('filePaths:', filePaths, 'zipFilePath:', zipFilePath);
  
      const dirExists = await RNFS.exists(tempDir);
      if (!dirExists) {
        await RNFS.mkdir(tempDir);  // Create the directory if it doesn't exist
      }
  
      await zip(filePaths, zipFilePath)
        .then((path) => {
          console.log(`Zip completed at ${path}`);
        })
        .catch((error) => {
          console.error('Zip error:', error);
          throw new Error('Failed to zip the files.');
        });
  
      const zipFileExists = await RNFS.exists(zipFilePath);
      if (!zipFileExists) {
        throw new Error('Zip file creation failed.');
      }
      
      return zipFilePath;  // Return the zip file path after successful creation
    } catch (error) {
      console.log('Error in HandleZip:', error);
      throw error;
    }
  };
  
  const FileUpload = async (formData) => {
    console.log('formData online', formData, );
  
    try {
      setLoading(true);
  
    
  
      const accessToken = await Auth.getPersistingAccessToken();
 
  
      const response = await fetch(
        'http://api.goldmedalroofing.com/api/app/file-upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );
  
      const data = await response.json();
      setLoading(false);
  console.log('data online', data);
      if (data?.message === 'Success.') {
        Alert.alert('File Uploaded Successfully !!');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setLoading(false);
        Alert.alert('Failed to Upload !!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error uploading zipped images:', error);
      Alert.alert('Error', 'An error occurred while uploading files.');
    }
  };
  
  const saveOfflineFormData = async (formData) => {
    try {
      const formDataObject = {
        attachment: formData?._parts[0][1], // Get file path from FormData
        job_id: formData?._parts[1][1],
        build_pdf: formData?._parts[2][1],
        attachment_type: formData?._parts[3][1],
        attachment_name: formData?._parts[4][1],
        description: formData?._parts[5][1],
      };
      const savedForms = await AsyncStorage.getItem('offlineForms');
      const existingForms = savedForms ? JSON.parse(savedForms) : [];
      const updatedForms = [...existingForms, formDataObject];
      await AsyncStorage.setItem('offlineForms', JSON.stringify(updatedForms));
      Alert.alert('Offline', 'Form data saved for later submission.');
    } catch (error) {
      console.error('Error saving form data offline:', error);
    }
  };
  
  const uploadOfflineData = async (savedForm) => {

    const formData = new FormData();
    formData.append('attachment', {
      uri: savedForm?.attachment.uri,
      name: savedForm?.attachment.name,
      type: savedForm?.attachment.type,
    });
    formData.append('job_id', savedForm?.job_id);
    formData.append('build_pdf', savedForm?.build_pdf);
    formData.append('attachment_type', savedForm?.attachment_type);
    formData.append('attachment_name', savedForm?.attachment_name);
    formData.append('description', savedForm?.description);
  
    console.log('formData offline', formData, typeof(formData));
    setTimeout(async () => {
      try {
    
        const accessToken = await Auth.getPersistingAccessToken();
       
    
        const response = await fetch('http://api.goldmedalroofing.com/api/app/file-upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });
    
        const data = await response.json();
     
        console.log('offline submit response 123', data);
        if (data.message === 'Success.') {
          Toast.show('File Uploaded Successfully !!', Toast.LONG);
          await AsyncStorage.removeItem('offlineForms');
          console.log('Offline form uploaded successfully');
        } else {
          Alert.alert('Failed to upload offline form!');
          console.error('Failed to upload offline form:', data);
        }
      } catch (error) {
        console.error('Error uploading offline form:', error);
        
      }
    }, 2000);
   
  };
  
  const submitOfflineFormData = async () => {
   
    try {
      const savedForms = await AsyncStorage.getItem('offlineForms');
      const offlineForms = savedForms ? JSON.parse(savedForms) : [];
  console.log('offlineForms length ',offlineForms.length);
      if (offlineForms?.length > 0) {
        for (const form of offlineForms) {
          // Call FileUpload function with the saved form data
          await uploadOfflineData(form);
        }
  
        // Clear offline forms once submitted
       
       // Alert.alert('Success', 'Offline data submitted successfully.');
      }
    } catch (error) {
      console.error('Error submitting offline form data:', error);
    }
  };

  const handleFormSubmit = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please select images to upload.');
      return;
    }
  
    if (!selectedAttachmentType || !attachmentName || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Ensure the zip file is created before proceeding
      const zipFilePath = await HandleZip(selectedImages);
  
      const accessToken = await Auth.getPersistingAccessToken();
  
      // Create FormData
      const formData = new FormData();
      formData.append('attachment', {
        uri: `file://${zipFilePath}`, // Properly formatted file URI
        name: `${attachmentName}.zip`,
        type: 'application/zip', // MIME type for zip files
      });
  
      formData.append('job_id', jobID);
      formData.append('build_pdf', buildPdf ? '1' : '0');
      formData.append('attachment_type', selectedAttachmentType);
      formData.append('attachment_name', attachmentName);
      formData.append('description', description);
  
      console.log('formData', formData);
  
      // Check the current network status before uploading
      const netInfoState = await NetInfo.fetch();
      console.log('Current Network Status:', netInfoState);
  
      if (netInfoState.isConnected) {
        await FileUpload(formData);  // Upload the form if connected
      } else {
        Toast.show('Data is saved into the local storage !!', Toast.LONG);
        await saveOfflineFormData(formData);  // Save the form for later submission
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
      Toast.show('Something went wrong !!', Toast.LONG);
    }
  };
  

  const LabelWithAsterisk = ({ label }) => (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.asterisk}> *</Text>
    </View>
  );

  const renderConnectionStatus = () => {
    return (
      <View style={styles.statusContainer}>
      <View style={styles.statusBox}>
      <View
    style={[
      styles.statusCircle,
      { backgroundColor: isConnected ? 'green' : 'orange' },
    ]}
  />
  <Text style={styles.statusText}>
    {isConnected ? 'Online' : 'Offline'}
  </Text>
      </View>
 
</View>
    );
  };
  
  return (
    <ScrollView style={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
      {/* App Bar */}
      <Appbar.Header style={styles.appBar}>
  <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
  <View style={styles.appBarTitleContainer}>
    <Text style={styles.appBarTitle}>Job Details</Text>
  </View>
</Appbar.Header>



          {renderConnectionStatus()}
       
      {/* Job Details Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Label:</Text>
          <Text style={styles.summaryValue}>{jobDetails?.jobLabel}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Assigned Representative:</Text>
          <Text style={styles.summaryValue}>
            {jobDetails?.assignedRepresentative}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Value:</Text>
          <Text style={styles.summaryValue}>{jobDetails?.jobValue}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Amount Due:</Text>
          <Text style={styles.summaryValue}>
            {' '}
            {jobDetails?.amountDue != null
              ? Math.abs(parseFloat(jobDetails.amountDue.replace(/,/g, '')))
              : jobDetails?.amount}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Status:</Text>
          <Text style={styles.summaryValue}>{jobDetails?.jobStatus}</Text>
        </View>
      </View>

      {/* Loading or Error State */}
      {loading && <ActivityIndicator size="large" color="#155B63" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Attachments Section */}
      <View style={styles.attachmentsContainer}>
        <Text style={styles.title}>Attachments</Text>

        <View style={styles.inputContainer}>
        <LabelWithAsterisk label="Upload File Attachment" />
          {/* <Text style={styles.label}>Upload File Attachment</Text> */}
          <TouchableOpacity
            style={styles.fileButton}
            onPress={handleChooseFiles}>
            <Text style={styles.fileButtonText}>Choose files</Text>
          </TouchableOpacity>
          <Text style={styles.fileName}>Selected File : {selectedImages.length}</Text>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Build PDF</Text>

          <Switch
            value={buildPdf}
            onValueChange={setBuildPdf}
            trackColor={{false: '#767577', true:'#f4f3f4' }}
            thumbColor={buildPdf ? '#155B63' : '#f4f3f4'}
          />
          
        </View>

        <View style={styles.inputContainer}>
        <LabelWithAsterisk label="Attachment Type" />
          
          <Dropdown
            style={[styles.dropdown]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={attachmentTypes.map(type => ({
              label: type.visible_name,
              value: type.attachment_type,
            }))}
            labelField="label"
            valueField="value"
            search
            maxHeight={300}
            placeholder="Select Attachment Type"
            searchPlaceholder="Search..."
            value={selectedAttachmentType}
            onChange={item => {
              setSelectedAttachmentType(item.value); // Set the selected document type ID
              Toast.show(item.label, Toast.LONG);
            }}
          />
        </View>

       

        <View style={styles.inputContainer}>
        <LabelWithAsterisk label="Attachment Name" />
          {/* <Text style={styles.label}>Attachment Name *</Text> */}
          <Text style={styles.note}>
            (Note: All Files Uploaded Will Get This Name)
          </Text>
          <TextInput style={styles.input} placeholder="Enter attachment name"  placeholderTextColor={'#696969'}  value={attachmentName} onChangeText={(txt) => setAttachmentName(txt)}/>
        </View>

        <View style={styles.inputContainer}>
        <LabelWithAsterisk label="Description" />
          {/* <Text style={styles.label}>Description</Text> */}
          <TextInput
            style={styles.input}
            value={description}
            multiline={true}
            numberOfLines={4}
            placeholder="Enter description"
            placeholderTextColor={'#696969'}
            onChangeText={(txt) => setDescription(txt)}
          />
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={handleFormSubmit}>
          <Text style={styles.uploadButtonText}>File Upload</Text>
        </TouchableOpacity>
      </View>

     
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  appBar: {
    backgroundColor: '#155B63',
  },
  appBarTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
   alignSelf:'center'
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    color: '#555',
  },
  attachmentsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#155B63'
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },
  asterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: 'red',
    marginLeft: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  // label: {
  //   fontSize: 14,
  //   fontWeight: '600',
  //   marginBottom: 8,
  //   color:'black'
  // },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    color: 'black'
  },
  dropdown: {
    marginTop: 10,
    width: '100%',
    // borderWidth: 1,
    // borderColor: 'white',
    color: 'black',
    // height: 45,
    padding: 15,

    alignSelf: 'center',
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 25,
  },

  placeholderStyle: {
    fontSize: 14,
    color: '#808080',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    color: 'black',
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  fileButton: {
    backgroundColor: '#155B63',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  fileName: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    marginLeft: 16,
  },
  uploadButton: {
    backgroundColor: '#155B63',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
 
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
  },
  attachmentTypesContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
  },
  attachmentTypeCard: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  attachmentTypeText: {
    fontSize: 14,
    color: '#333',
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8, // Space between the circle and the text
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'black'
  },
  statusBox:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',  // Light grey background for oval effect
    paddingVertical: 5,          // Adjust for padding inside the box
    paddingHorizontal: 15,       // Adjust horizontal padding
    borderRadius: 25,  
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10, 
   
    
  },
});

export default JobView;