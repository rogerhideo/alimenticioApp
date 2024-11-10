import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 45000,
});

instance.interceptors.request.use(
  async config => {
    let userToken: string | null = await AsyncStorage.getItem('@userToken');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  },
);

export default instance;
