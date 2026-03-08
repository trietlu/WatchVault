# WatchVault Native

React Native implementation of WatchVault in the monorepo under `native/`.

## Stack
- Expo + TypeScript
- React Navigation (native stack)
- Axios
- Zustand (persisted with Expo SecureStore)
- Expo Image Picker
- QR rendering via `react-native-qrcode-svg`

## Environment
Copy `.env.example` to `.env` and set values:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
EXPO_PUBLIC_APP_BASE_URL=http://192.168.1.100:3000
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

## Run
```bash
cd native
npm install
npm run dev
```

Then launch iOS simulator, Android emulator, or Expo Go.

## API Parity
This app uses the same backend endpoints as the web app:
- `/auth/*`
- `/watches/*`
- `/passports/:publicId`

## Notes
- On a physical device, do not use `localhost`; use your computer's LAN IP.
- For Android emulator, you may need `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001`.
- Google sign-in uses Expo Auth Session and the backend `/auth/google` endpoint.
- Google sign-in is not supported in Expo Go for local development. Use a development build (`npm run ios` / `npm run android`).
