/* eslint-disable prettier/prettier */
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const JobCard = ({ job }) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>{job.company}</Text>
      <Text style={styles.location}>{job.location}</Text>
      <Text style={styles.salary}>{job.salary}</Text>

      <Text style={styles.sectionTitle}>Job Description</Text>
      <Text style={styles.description}>{job.description}</Text>

      <Text style={styles.sectionTitle}>Requirements</Text>
      {job.requirements.map((requirement, index) => (
        <Text key={index} style={styles.listItem}>
          - {requirement}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Responsibilities</Text>
      {job.responsibilities.map((responsibility, index) => (
        <Text key={index} style={styles.listItem}>
          - {responsibility}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Benefits</Text>
      {job.benefits.map((benefit, index) => (
        <Text key={index} style={styles.listItem}>
          - {benefit}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  company: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  salary: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 5,
  },
});

export default JobCard;
