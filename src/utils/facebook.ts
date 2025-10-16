import { CommonPlatform } from '@/models/common';
import UserService from '@/services/UserService';
import * as WebBrowser from 'expo-web-browser';

type FacebookUserInfo = {
  email: string;
  id: string;
  name: string;
  picture: {
    data: any;
    height: number;
    url: string;
    width: number;
  };
};

export async function getFacebookUserInfo(
  accessToken: string,
  justAddPage?: boolean,
): Promise<FacebookUserInfo> {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me?access_token=${accessToken}&fields=id,name,email,picture`,
  );
  const data = (await response.json()) as FacebookUserInfo;
  if (justAddPage && data.id) {
    const result = await UserService.loginFacebook({
      ...data,
      accessToken: accessToken,
      image: data.picture.data.url,
      platform: CommonPlatform.facebook,
    });
    if (result) {
      return result;
    }
  }
  return data;
}

export async function loginWithFacebook(): Promise<string | undefined> {
  try {
    const facebookRedirectUri = `fb${process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID}://authorize`;
    const fbLoginUrl = `https://m.facebook.com/v21.0/dialog/oauth?auth_type=rerequest&client_id=${process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID}&redirect_uri=${facebookRedirectUri}&response_type=token&scope=${process.env.EXPO_PUBLIC_FACEBOOK_LIST_PERMISSIONS}&config_id=${process.env.EXPO_PUBLIC_FACEBOOK_CONFIG_ID}`;

    const result = await WebBrowser.openAuthSessionAsync(
      fbLoginUrl,
      facebookRedirectUri,
    );

    if (result.type === 'success' && result.url) {
      // Extract access token from URL
      const match = /access_token=([^&]+)/.exec(result.url);
      if (match) {
        return match[1];
      }
    } else {
      console.warn('InAppBrowser is not available');
    }
  } catch (error) {
    console.error('Facebook login error:', error);
  }

  return undefined;
}
