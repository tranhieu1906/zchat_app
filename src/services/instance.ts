import { loadAuth } from '@/utils/auth';
import ky, { HTTPError, Options } from 'ky';
import Toast from 'react-native-toast-message';

const prefixUrl = `${process.env.EXPO_PUBLIC_API_URL ?? ''}/`;
const reportPrefixUrl = `${process.env.EXPO_PUBLIC_REPORT_URL ?? ''}/`;

const api = ky.create({
  headers: {
    Accept: 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = loadAuth().token;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
  prefixUrl,
  retry: { limit: 0 },
  timeout: 1000 * 60 * 10, // 10 minutes timeout
});

const apiWithReport = api.extend({ prefixUrl: reportPrefixUrl });

function handleError(error: unknown) {
  if (error instanceof HTTPError) {
    void error.response.json().then((data: { message?: string }) => {
      Toast.show({
        position: 'bottom',
        text1: 'Thất bại',
        text2: data.message ?? error.message,
        type: 'error',
      });
    });
  } else {
    Toast.show({
      position: 'bottom',
      text1: 'Lỗi không xác định',
      type: 'error',
    });
  }
  throw error;
}

export const ApiClient = {
  async DELETE<T = any>(url: string, options?: Options) {
    try {
      return await api.delete(url, options).json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  async GET<T = any>(
    url: string,
    parameters?: Record<string, any>,
    options?: Options,
  ) {
    try {
      return await api
        .get(url, { searchParams: parameters, ...options })
        .json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  async GET_REPORT<T = any>(
    url: string,
    parameters?: Record<string, any>,
    options?: Options,
  ) {
    try {
      return await apiWithReport
        .get(url, { searchParams: parameters, ...options })
        .json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  async POST<T = any>(url: string, data?: any, options?: Options) {
    try {
      return await api.post(url, { json: data, ...options }).json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  async POST_REPORT<T = any>(url: string, data?: any, options?: Options) {
    try {
      return await apiWithReport
        .post(url, { json: data, ...options })
        .json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  async PUT<T = any>(url: string, data: any, options?: Options) {
    try {
      return await api.put(url, { json: data, ...options }).json<T>();
    } catch (error) {
      handleError(error);
    }
  },

  setHeaders(headers: Record<string, string>) {
    return api.extend({ headers });
  },

  async UPLOAD<T = any>(url: string, data?: any, options?: Options) {
    try {
      return await api
        .post(url, {
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          ...options,
        })
        .json<T>();
    } catch (error) {
      handleError(error);
    }
  },
};
