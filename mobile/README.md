# React Native Mobile App - English Learning Platform

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update API URL in `App.tsx`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:8000/api';
```

3. Run the app:
```bash
npm start
# or
npm run android
npm run ios
```

## Notes

- Make sure your device/emulator can reach the Django backend
- Update `API_BASE_URL` with your computer's local IP for physical devices
- The app uses Expo for easy development and deployment
