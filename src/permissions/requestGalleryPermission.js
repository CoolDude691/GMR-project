// PermissionsHandler.js
import React from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';

const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'App Gallery Permission',
            message: 'App needs access to your gallery',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted 
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      const statuses = await requestMultiple([PERMISSIONS.IOS.PHOTO_LIBRARY]);
      return statuses;
    }
  };
  
  export { requestGalleryPermission };