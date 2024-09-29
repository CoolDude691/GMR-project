/* eslint-disable prettier/prettier */
import * as React from 'react';
import { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import JobView from './src/screens/jobView';

const Stack = createNativeStackNavigator();

function App() {
  // State to manage the theme
  const [theme, setTheme] = useState('light');

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };`s`

  // Define custom themes
  const themes = {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      headerColor: '#f8f9fa',
    },
    dark: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      headerColor: '#333333',
    },
  };

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={theme === 'light' ? '#f6f6f6' : '#333333'} // Change background color based on theme
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} // Change text/icons color based on theme
      />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home">
          {(props) => (
            <Home
              {...props}
              theme={themes[theme]}
              toggleTheme={toggleTheme}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="JobView" component={JobView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
