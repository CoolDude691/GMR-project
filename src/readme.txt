import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';

// Get screen width for responsive design
const { width } = Dimensions.get('window');

const JobView = () => {
  const [activeTab, setActiveTab] = useState('Primary');
  const [jobDetails, setJobDetails] = useState(null); // State to store job details fetched from the API
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
  };

  // Function to fetch job details from the API
  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      // Replace `your_token_here` with your actual API token
      const response = await axios.get('http://api.goldmedalroofing.com/api/app/job-detail/49', {
        headers: {
          Authorization: 'Bearer your_token_here', // Use the correct authorization type and token
        },
      });

      if (response.status === 200 && response.data && response.data.jobDetails) {
        setJobDetails(response.data.jobDetails);
      } else {
        // Explicitly set jobDetails to null if no data is available to trigger the dummy data fallback
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
    fetchJobDetails(); // Fetch job details on component mount
  }, []);

  // Dummy data if jobDetails is null or undefined
  const job = jobDetails ?? {
    jobLabel: '29-12', 
    assignedRepresentative: 'Daniel Jolly',
    jobValue: '$29,000.00',
    amountDue: '$1,000.00',
    jobStatus: 'Under Contract',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      {/* Job Details Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Label:</Text>
          <Text style={styles.summaryValue}>{job.jobLabel}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Assigned Representative:</Text>
          <Text style={styles.summaryValue}>{job.assignedRepresentative}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Value:</Text>
          <Text style={styles.summaryValue}>{job.jobValue}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Amount Due:</Text>
          <Text style={styles.summaryValue}>{job.amountDue}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Job Status:</Text>
          <Text style={styles.summaryValue}>{job.jobStatus}</Text>
        </View>
      </View>

      {/* Loading or Error State */}
      {loading && <ActivityIndicator size="large" color="#155B63" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {['Primary', 'Location', 'Insurance', 'Adjuster', 'Attachments'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'Primary' && (
          <View>
            <Text style={styles.sectionTitle}>Primary Contact</Text>
            <Text style={styles.contactName}>DJsfrwegsfdh Test</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>Primary Phone number:</Text>
              <Text style={styles.contactInfoValue}>(111) 111-1111</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>Primary Email:</Text>
              <Text style={styles.contactInfoValue}>dj@roofit.tech</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>Secondary Email:</Text>
              <Text style={styles.contactInfoValue}>abcde@yopmail.com</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>Installation Address:</Text>
              <Text style={styles.contactInfoValue}>2440 Ben Hogan Circle</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>City/State:</Text>
              <Text style={styles.contactInfoValue}>Florence, SC</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactInfoLabel}>ZIP:</Text>
              <Text style={styles.contactInfoValue}>29506</Text>
            </View>
          </View>
        )}
        {activeTab === 'Location' && <Text>Location Content</Text>}
        {activeTab === 'Insurance' && <Text>Insurance Content</Text>}
        {activeTab === 'Adjuster' && <Text>Adjuster Content</Text>}
        {activeTab === 'Attachments' && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.title}>Attachments</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Upload File Attachment</Text>
              <TouchableOpacity style={styles.fileButton}>
                <Text style={styles.fileButtonText}>Choose files</Text>
              </TouchableOpacity>
              <Text style={styles.fileName}>Selected File</Text>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Build PDF</Text>
              <View style={styles.switch}>
                <TouchableOpacity>
                  <Text>Add document</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Attachment Type</Text>
              <TextInput style={styles.input} placeholder="Enter attachment type" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Attachment Name *</Text>
              <Text style={styles.note}>(Note: All Files Uploaded Will Get This Name)</Text>
              <TextInput style={styles.input} placeholder="Enter attachment name" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput style={styles.input} multiline={true} numberOfLines={4} placeholder="Enter description" />
            </View>

            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>File Upload</Text>
            </TouchableOpacity>
          </View>
        )}
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
  header: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#155B63',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#155B63',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactInfoValue: {
    fontSize: 14,
    color: '#555',
  },
  attachmentsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
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
});

export default JobView;



=====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
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
    borderRadius: 5,
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
  cardinfoText: {
    fontSize: 12,
    color: '#155B63',
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardBodyText: {
    fontSize: 14,
    color: '#777',
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
});