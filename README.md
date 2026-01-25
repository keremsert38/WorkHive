# WorkHive Mobile App

A React Native + Expo mobile application for freelancer marketplace.

## Features

- **Freelancer Mode**: Dashboard, job management, listing management, messages
- **Client Mode**: Home, orders, favorites, messages, profile
- **Modern UI**: Beautiful design with smooth animations
- **EAS Build Ready**: Configured for iOS and Android builds

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
cd WorkHive
npm install
```

### Run Development Server

```bash
npx expo start
```

This will start the Expo development server. You can then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (macOS only)
- Scan the QR code with Expo Go app on your phone

### Build for Production

#### Android (APK/AAB)
```bash
eas build --platform android
```

#### iOS (IPA)
```bash
eas build --platform ios
```

## Project Structure

```
WorkHive/
├── App.tsx                    # Main app entry
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
├── src/
│   ├── components/            # Reusable components
│   ├── screens/
│   │   ├── auth/              # Authentication screens
│   │   ├── freelancer/        # Freelancer-specific screens
│   │   └── client/            # Client-specific screens
│   ├── theme/                 # Colors, typography, spacing
│   └── types/                 # TypeScript types
└── assets/                    # Images and icons
```

## Technologies

- React Native + Expo SDK 52
- TypeScript
- React Navigation
- Lucide React Native (icons)
- React Native Chart Kit
