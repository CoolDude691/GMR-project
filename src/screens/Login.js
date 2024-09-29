/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet, 
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Auth } from '../services/api';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onPasswordIconPress = () => {
    setPasswordVisible(!passwordVisible);
  };

  const login = () => {
    if (loading) return;

    // Define the specific email and password that are allowed
    const allowedEmail = 'mathew@yopmail.com';
    const allowedPassword = 'GoldMedal';

    if (email !== allowedEmail || password !== allowedPassword) {
      showAlert('Error', 'Invalid credentials. Please try again.');
      return;
    }

    if (email === '') {
      showAlert('Error', 'Please enter a valid email address or username');
      return;
    }

    if (password === '') {
      showAlert('Error', 'Please enter your password');
      return;
    }

    // Prepare the form data
    const formData = {
      email: email,
      password: password,
    };

    setLoading(true);
    fetch('http://api.goldmedalroofing.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(async (res) => {
        console.log('response on Login', res);
        if (res.success === '0') {
          showAlert('Error', res.error);
        } else {
          await Auth.setAccessToken(res.access_token, res.expires_in);
         // await Auth.setAccessToken(res.access_token);
          navigation.navigate('Home'); // Navigate to Home on successful login
        }
      })
      .catch((error) => showAlert('Error', error.message))
      .finally(() => setLoading(false));
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.box}>
              <View style={styles.headerContainer}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.headingText}>Log In</Text>
              <View style={styles.divider} />
              <Text style={styles.labelText}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={'#696969'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.labelText}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor={'#696969'}
                  value={password}
                  secureTextEntry={!passwordVisible}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={onPasswordIconPress} style={styles.icon}>
                  <Text style={styles.iconText}>
                    {passwordVisible ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.signInButton} onPress={login}>
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '40%',
    height: undefined,
    aspectRatio: 1,
  },
  box: {
    backgroundColor: '#dddddd',
    flex: 1,
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  divider: {
    borderBottomWidth: 3,
    borderColor: '#155B63',
    width: 45,
    paddingTop: '3%',
  },
  input: {
    backgroundColor: '#e5e5e5',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 16,
    fontSize: 16,
    color: 'black'
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40, // Space for the icon
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '63%',
    transform: [{ translateY: -12 }],
  },
  iconText: {
    fontSize: 18,
  },
  signInButton: {
    marginTop: 30,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#155B63',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  labelText: {
    color: '#155B63',
    fontSize: 16,
    fontWeight: '500',
    paddingTop: '5%',
  },
  headingText: {
    color: '#155B63',
    fontSize: 26,
    fontWeight: '600',
  },
});

export default Login;
