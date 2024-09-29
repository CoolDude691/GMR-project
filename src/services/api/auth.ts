
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPostRequestBody } from '.';

export class Auth {
  static accessToken: string | null = null;
  static fcmToken: string | null = null;
  static userId: string | null = null;

  static get hasToken(): boolean {
    return !!this.accessToken && this.accessToken !== '';
  }

  // static async setAccessToken(token: string): Promise<void> {
  //   this.accessToken = token;
  //   await AsyncStorage.setItem('access_token', token);
  // }


  static async setAccessToken(token: string, expiresIn: number): Promise<void> {
    this.accessToken = token;
   const expirationTime = Date.now() + expiresIn * 1000; // Convert to milliseconds
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('token_expiration', expirationTime.toString());
  }

  static async isTokenValid(): Promise<boolean> {
    const expirationTime = await AsyncStorage.getItem('token_expiration');
    if (!expirationTime) return false;
    return Date.now() < parseInt(expirationTime);
  }

  static async clearToken(): Promise<void> {
    this.accessToken = null;
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('token_expiration');
  }
  
  static async setFcmToken(token: string): Promise<void> {
    this.fcmToken = token;
    await AsyncStorage.setItem('fcm_token', token);
  }

  static async setUserData(userId: string): Promise<void> {
    this.userId = userId;
    await AsyncStorage.setItem('user_id', userId);
  }

  static async removeUserData(): Promise<void> {
    this.accessToken = null;
    this.fcmToken = null;
    this.userId = null;
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('fcm_token');
    await AsyncStorage.removeItem('user_id');
  }

  static getAccessToken(): string | null {
    return this.accessToken;
  }

  static async getPersistingAccessToken(): Promise<string | null> {
    this.accessToken = await AsyncStorage.getItem('access_token');
    return this.accessToken;
  }

  static async getPersistingFcmToken(): Promise<string | null> {
    this.fcmToken = await AsyncStorage.getItem('fcm_token');
    return this.fcmToken;
  }

  static async getPersistingId(): Promise<string | null> {
    this.userId = await AsyncStorage.getItem('user_id');
    return this.userId;
  }
}

export const loginApi = (req: any): Promise<any> => {
  return apiPostRequestBody('mobile/user/login', req);
};




