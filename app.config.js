export default {
  "expo": {
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff",
        "foregroundImage": "./assets/SolChatIcon.png"
      },
      "edgeToEdgeEnabled": true,
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      "package": "vn.zsolution.solchat",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "runtimeVersion": {
        "policy": "appVersion"
      }
    },
    "extra": {
      "eas": {
        "projectId": "1f8be7e0-e1c1-4d4a-b0e7-dffb988b3aca"
      }
    },
    "icon": "./assets/SolChatIcon.png",
    "ios": {
      "appleTeamId": "5JDH25G2J5",
      "bundleIdentifier": "vn.zsolution.solchat",
      "entitlements": {
        "aps-environment": "production"
      },
      "googleServicesFile": process.env.GOOGLE_SERVICES_INFO_PLIST ?? "./GoogleService-Info.plist",
      "infoPlist": {
        "CADisableMinimumFrameDurationOnPhone": true,
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "Ứng dụng cần sử dụng camera để chụp ảnh và quay video.",
        "NSLocalNotificationUsageDescription": "Ứng dụng cần sử dụng notification để thông báo.",
        "NSMicrophoneUsageDescription": "Ứng dụng SolChat sử dụng micro khi bạn quay video hoặc gửi tin nhắn thoại trong cuộc trò chuyện.",
        "NSPhotoLibraryAddUsageDescription": "Ứng dụng SolChat cần quyền lưu ảnh hoặc video vào thư viện khi bạn tải xuống nội dung từ cuộc trò chuyện.",
        "NSPhotoLibraryUsageDescription": "Ứng dụng SolChat cần truy cập thư viện ảnh để bạn có thể chọn ảnh hoặc video và chia sẻ trong cuộc trò chuyện.",
      },
      "runtimeVersion": "1.0.0",
      "supportsTablet": true,
      "usesAppleSignIn": true
    },
    "jsEngine": "hermes",
    "name": "SolChat",
    "newArchEnabled": true,
    "orientation": "portrait",
    "owner": "hieutran19",
    "plugins": [
      "@react-native-firebase/app",
      "expo-apple-authentication",
      [
        "expo-video",
      ],
      [
        "expo-web-browser",
        {
          "experimentalLauncherActivity": true
        }
      ],
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Ứng dụng SolChat cần quyền truy cập thư viện ảnh để bạn có thể chọn ảnh hoặc video và chia sẻ trong cuộc trò chuyện."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Ứng dụng cần sử dụng camera để chụp ảnh, quét qr và quay video.",
          "microphonePermission": "Ứng dụng SolChat cần quyền truy cập microphone khi bạn quay video hoặc gửi tin nhắn thoại.",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-media-library",
        {
          "isAccessMediaLocationEnabled": true,
          "photosPermission": "Ứng dụng SolChat cần quyền truy cập thư viện ảnh để bạn có thể chọn ảnh hoặc video và chia sẻ trong cuộc trò chuyện.",
          "savePhotosPermission": "Ứng dụng SolChat cần quyền lưu ảnh hoặc video vào thư viện khi bạn tải xuống nội dung từ cuộc trò chuyện."
        }
      ]
    ],
    "scheme": `fb${process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_ID}`,
    "slug": "soly",
    "splash": {
      "backgroundColor": "#ffffff",
      "image": "./assets/SolChatIcon.png",
      "resizeMode": "contain"
    },
    "updates": {
      "url": "https://u.expo.dev/1f8be7e0-e1c1-4d4a-b0e7-dffb988b3aca"
    },
    "userInterfaceStyle": "light",
    "version": "1.0.2",
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}