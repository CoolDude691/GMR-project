/* eslint-disable prettier/prettier */
import { SafeAreaView, StyleSheet, View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Auth } from '../services/api';

const Splash = ({ navigation }) => {
 

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const isValid = await Auth.isTokenValid();
        console.log('isValid',isValid);
        if (isValid) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        navigation.replace('Login');
      }
    };
    const timer = setTimeout(checkTokenAndNavigate, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 75,
  },
});

export default Splash;
