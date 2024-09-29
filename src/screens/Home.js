

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Button,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import { Auth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import NetInfo from '@react-native-community/netinfo';
const { width } = Dimensions.get('window');

const sampleJobs = [
  { id: '43-256', assigned_office: 'Harper Nelson', office_record_id: 'harper', assigned_user_id: '122', status: 'Under Contract', created_at: '6/29/24 10:00', updated_at: '6/29/24 10:00', insurance_company_id: '12345', office: { office_prefix_for_jobs: 'werty' } },
];

const sampleFilterCategories = ['Under Contract', 'Lead', 'Completed', 'Pending', 'Finished'];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [allJobs, setAllJobs] = useState([]);
  const [displayedJobsCount, setDisplayedJobsCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [advancedSearchModalVisible, setAdvancedSearchModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isApiFailed, setIsApiFailed] = useState(false);
  const [filterCategories, setFilterCategories] = useState(sampleFilterCategories);
  const [isConnected, setIsConnected] = useState(null);
  const apiCalledRef = useRef(false);

  useEffect(() => {
    fetchJobData();
    fetchFilterCategories();
    fetchOfflineJobData();
    fetchOfflineFilterCategories();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected && !apiCalledRef.current) {
        fetchJobData();
        fetchFilterCategories();
        apiCalledRef.current = true;
      } else if (!state.isConnected) {
        // Load jobs and filter categories from AsyncStorage when offline
        loadJobsFromStorage(); 
        loadFilterCategoriesFromStorage();
      }
      if (!state.isConnected) {
        apiCalledRef.current = false; // Reset the flag if disconnected
      }
    });
  
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        console.log('useFocuseffect running');
        fetchJobData();
        fetchFilterCategories();
      } else {
        loadJobsFromStorage();
        loadFilterCategoriesFromStorage();
      }
    }, [isConnected])
  );


  const fetchJobData = async (status = '') => {
    console.log('status on fetchJobData ', status);
    try {
      const accessToken = await Auth.getPersistingAccessToken();
      setLoading(true);
      const url = status ? `http://api.goldmedalroofing.com/api/jobs?status=${status}` : 'http://api.goldmedalroofing.com/api/jobs';
    
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    
      if (!response.ok) {
        throw new Error('Failed to fetch job data');
      }
    
      const result = await response.json();
      // Check if the data contains a key like 'data' that holds the job entries
      if (result && result?.data && Array.isArray(result?.data)) {
        setAllJobs(result?.data);
      } else {
        console.warn('Unexpected data format:', result);
        setAllJobs(sampleJobs); // Fallback to sample data
      }
    
      setIsApiFailed(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setAllJobs(sampleJobs); // Fallback to sample data
      setIsApiFailed(true);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOfflineJobData = async () => {
    try {
      const accessToken = await Auth.getPersistingAccessToken();
      setLoading(true);
      const url =  'http://api.goldmedalroofing.com/api/jobs';
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    
      if (!response.ok) {
        throw new Error('Failed to fetch job data');
      }
    
      const result = await response.json();
      // Check if the data contains a key like 'data' that holds the job entries
      if (result && result?.data && Array.isArray(result?.data)) {
        console.log('storing offline data job');
        await AsyncStorage.setItem('jobs', JSON.stringify(result.data));
     
      } else {
        console.warn('Unexpected data format:', result);
      }
    
      setIsApiFailed(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setAllJobs(sampleJobs); // Fallback to sample data
      setIsApiFailed(true);
    } finally {
      setLoading(false);
    }
  };


  const fetchFilterCategories = async () => {
    try {
      const accessToken = await Auth.getPersistingAccessToken();
      const response = await fetch('http://api.goldmedalroofing.com/api/job-stages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch filter categories');
      }
      const data = await response.json();
      console.log('result stages',data);
      const statusNames = data?.map((status) => status?.status_name);
      const categoriesWithIds = data?.map((status) => ({
        id: status?.id,        
        name: status?.status_name
      }));
      setFilterCategories(categoriesWithIds);
    } catch (error) {
      console.error('Error fetching filter categories:', error);
      setFilterCategories(sampleFilterCategories.map(name => ({ id: name, name })));
     // setFilterCategories(sampleFilterCategories);
    }
  };

  const fetchOfflineFilterCategories = async () => {
    try {
      const accessToken = await Auth.getPersistingAccessToken();
      const response = await fetch('http://api.goldmedalroofing.com/api/job-stages', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch filter categories');
      }
      const data = await response.json();
      console.log('result stages',data);
      const statusNames = data.map((status) => status?.status_name);
      const categoriesWithIds = data?.map((status) => ({
        id: status?.id,         // Assuming 'id' is the correct field
        name: status?.status_name
      }));
      console.log('storing filterCategories');
      await AsyncStorage.setItem('filterCategories', JSON.stringify(categoriesWithIds));
    } catch (error) {
      console.error('Error fetching filter categories:', error);
    }
  };

  const loadJobsFromStorage = async () => {
    try {
      const storedJobs = await AsyncStorage.getItem('jobs');
      console.log('storedJobs',storedJobs);
      if (storedJobs) {
        setAllJobs(JSON.parse(storedJobs));
      } else {
        setAllJobs(sampleJobs); // Fallback to sample data
      }
      setIsApiFailed(false);
    } catch (error) {
      console.error('Error loading jobs from storage:', error);
      setAllJobs(sampleJobs); // Fallback to sample data
      setIsApiFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterCategoriesFromStorage = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('filterCategories');
      if (storedCategories) {
        setFilterCategories(JSON.parse(storedCategories));
      } else {
        setFilterCategories(sampleFilterCategories?.map(name => ({ id: name, name })));
      }
    } catch (error) {
      console.error('Error loading filter categories from storage:', error);
      setFilterCategories(sampleFilterCategories.map(name => ({ id: name, name })));
    }
  };

  const handleSearch = useCallback(
    debounce((text) => setSearchQuery(text), 300),
    []
  );

  

  const handleFilterPress = (filterId) => {
    setSelectedFilters((prevFilters) => {
      if (prevFilters.includes(filterId)) {
        if (isConnected) {
         
          fetchJobData();
         
        } else {
          loadJobsFromStorage();
         
        }
        fetchJobData()
        return []; // Deselect if already selected
       
      } else {
        fetchJobData(filterId);
        return [filterId]; // Select only the new filter
       
      }
    });
  
  };
  

  // const handleFilterPress = (filter) => {
  //   console.log('filter',filter);
  //   const updatedFilters = selectedFilters.includes(filter)
  //     ? selectedFilters.filter((item) => item !== filter)
  //     : [...selectedFilters, filter];
  //   setSelectedFilters(updatedFilters);
  //   fetchJobData(filter);
  // };

  const handleAdvancedSearchPress = () => setAdvancedSearchModalVisible(true);
  const handleAdvancedSearchClose = () => setAdvancedSearchModalVisible(false);

  const handleJobPress = (Job) => navigation.navigate('JobView',{ jobID: Job?.primary_contact?.job_id, Job} );

  const filteredJobs = useMemo(() => {
    return  allJobs.filter((job) => {
      if (searchQuery && !job.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedFilters.length > 0 && !selectedFilters.includes(job.status)) return false;
      return true;
    });
  }, [allJobs, searchQuery, selectedFilters]);

  const visibleJobs = useMemo(() => filteredJobs?.slice(0, displayedJobsCount), [filteredJobs, displayedJobsCount]);

  const handleLoadMore = () => {
    if (displayedJobsCount < allJobs?.length) {
      setDisplayedJobsCount((prevCount) => prevCount + 10);
    }
  };

  const handleRefresh = () => {
    if (isConnected) {
      setDisplayedJobsCount(10);
      fetchJobData();
      fetchFilterCategories();
      fetchOfflineJobData();
      fetchOfflineFilterCategories();
    } else {
      setDisplayedJobsCount(10);
      loadJobsFromStorage();
      loadFilterCategoriesFromStorage();
    }
   
  };

  return (
    <View style={styles.container}>
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

      <Header />
      <PageHeader />

      <View style={styles.filterButtonsContainer}>
        <FilterButtons filterCategories={filterCategories} selectedFilters={selectedFilters} onPress={handleFilterPress} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#155B63" style={styles.loadingIndicator} />
      ) : (
        <>
          <FlatList
           // ListHeaderComponent={<FilterButtons filterCategories={filterCategories} selectedFilters={selectedFilters} onPress={handleFilterPress} />}
            data={visibleJobs}
            keyExtractor={(item) => item?.id}
            renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={false}
            onRefresh={handleRefresh}
          />
         

          {isApiFailed && (
            <Text style={styles.errorMessage}>Failed to load real data, showing sample data instead.</Text>
          )}

          <AdvancedSearchModal
            visible={advancedSearchModalVisible}
            onClose={handleAdvancedSearchClose}
          />
        </>
      )}
    </View>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Image style={styles.logo} source={require('../assets/images/logo.png')} />
  </View>
);

const PageHeader = () => (
  <View style={styles.pageHeader}>
    <Text style={styles.pageTitle}>All Jobs</Text>
    <Text style={styles.pageDescription}>View and manage all your job entries here.</Text>
  </View>
);

const FilterButtons = ({ filterCategories, selectedFilters, onPress }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
    {filterCategories.map(({ id, name }) => (
      <TouchableOpacity
        key={id}
        style={[
          styles.filterButton,
          selectedFilters.includes(id) && styles.filterButtonSelected,
        ]}
        onPress={() => onPress(id)}
      >
        <Text style={styles.filterButtonText}>
          {selectedFilters.includes(id) ? name : name?.slice(0, 2)}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const JobCard = ({ job, onPress }) => {
  const formatDate = (dateString) => {
   
    if (!dateString) return '';
   
    const date = new Date(dateString);
    if (isNaN(date)) return ''; // Return empty if the date is invalid

    const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);

    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

    return `${formattedDate} ${formattedTime}`;
  };
  
  return( <View style={styles.card}>
    <View style={styles.cardHeader}>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.rowCardDetail}>
      <Text style={styles.cardIdText}>{job?.id}</Text>
      <Text style={styles.createdAtText}>{job?.created_at ? formatDate(job?.created_at) : ''}</Text>
      </View>
      <Text style={styles.cardBodyStatusText}>{job?.job_status?.status_name || 'N/A'}</Text>
      <Text style={styles.cardBodyText}>{job?.primary_contact?.first_name || 'N/A'} {job.primary_contact?.last_name || 'N/A'}</Text>
     
      <Text style={styles.cardBodyEmailText}>{job?.primary_contact?.email_primary}</Text>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity onPress={() => onPress(job)} style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>)
}
 


const AdvancedSearchModal = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Advanced Search</Text>
        {/* Advanced search fields go here */}
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
    paddingBottom:20
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 75,
    resizeMode: 'cover',
    marginVertical: 10,
  },
  pageHeader: {
    marginBottom: 10,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#155B63',
  },
  pageDescription: {
    fontSize: 14,
    color: '#155B63',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterButton: {
    margin: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000',
  },
  filterButtonSelected: {
    borderColor: '#155B63',
    
  },
  filterButtonText: {
    color: '#155B63',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation:3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#155B63',
  },
  cardBody: {
    marginTop: 10,
  },
  cardIdText:{
fontSize:12,
color: '#155B63'
  },
  createdAtText:{
fontSize:12,
color: '#696969'
  },
  rowCardDetail:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
marginBottom:10
  },
  cardinfoText: {
    fontSize: 12,
    color: '#155B63',
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardBodyStatusText:{
    fontSize: 14,
    color: '#ff0000',
    fontWeight: '500'
  },
  cardBodyText: {
    fontSize: 14,
    color: '#3944BC',
    fontWeight:'bold'
  },
  cardBodyEmailText:{
    fontWeight:'bold',
    fontSize: 14,
    color: '#155B63',
  },
  viewButton: {
    marginTop: 10,
    backgroundColor: '#155B63',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 10, 
    position: 'absolute',
    right:10
   
    
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8, 
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'black'
  },
  statusBox:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', 
    paddingVertical: 5,          
    paddingHorizontal: 15,      
    borderRadius: 25,  
  }
});

export default HomeScreen;