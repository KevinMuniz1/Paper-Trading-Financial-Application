# Mobile App Setup Guide

This document explains how to set up and run the Flutter mobile app for the Paper Trading Financial Application.

## Prerequisites

### For Your Partner to Install:

1. **Flutter SDK**
   - Download: https://docs.flutter.dev/get-started/install/windows
   - Add to PATH environment variable
   - Verify: `flutter --version`

2. **Android Studio** (for mobile emulator)
   - Download: https://developer.android.com/studio
   - Install Android SDK through setup wizard
   - Create an Android Virtual Device (AVD)

3. **Git** (if not already installed)
   - Download: https://git-scm.com/download/win

## Setup Steps for Your Partner

### 1. Clone the Repository
```bash
git clone https://github.com/KevinMuniz1/Paper-Trading-Financial-Application.git
cd Paper-Trading-Financial-Application
```

### 2. Set Up Flutter Dependencies
```bash
cd mobile
flutter pub get
```

### 3. Verify Flutter Installation
```bash
flutter doctor
```
- Fix any issues Flutter doctor reports
- Ensure Android SDK is installed and configured

### 4. Create Android Emulator (if using emulator)
1. Open Android Studio
2. Tools → AVD Manager
3. Create Device → Choose Pixel 7
4. Download API 34 (Android 14) system image
5. Start the emulator

### 5. Run the Mobile App
```bash
# Check available devices
flutter devices

# Run on emulator
flutter run -d emulator-5554

# OR run on connected Android phone
flutter run
```

## Project Structure

```
Paper-Trading-Financial-Application/
├── backend/           # Node.js API server
├── frontend/          # React web app
└── mobile/            # Flutter mobile app
    ├── lib/
    │   └── main.dart  # Entry point - Hello screen
    ├── android/       # Android-specific files
    ├── ios/          # iOS-specific files (future)
    └── pubspec.yaml  # Flutter dependencies
```

## Development Workflow

### Hot Reload
- Save files in VS Code for instant updates
- Or press `r` in terminal while `flutter run` is active

### Available Commands (during `flutter run`)
- `r` - Hot reload
- `R` - Hot restart
- `q` - Quit app
- `d` - Detach (keep app running)

## Troubleshooting

### Common Issues:

1. **Flutter command not found**
   - Ensure Flutter is added to PATH
   - Restart terminal after installation

2. **No Android devices found**
   - Start Android emulator first
   - Or connect Android phone with USB debugging enabled

3. **Build failures**
   - Run `flutter clean` then `flutter pub get`
   - Ensure Android SDK is properly installed

### Getting Help:
- Run `flutter doctor -v` for detailed setup information
- Check Flutter documentation: https://docs.flutter.dev/

## Current Features

The mobile app currently displays:
- Blue app bar with "Paper Trading App" title
- Green money icon
- "Hello from Flutter!" welcome message
- "Paper Trading Financial App" subtitle

## Next Steps for Development

1. Connect to existing backend API (Node.js server)
2. Implement login screen
3. Add trading functionality
4. Integrate with MongoDB database
5. Add user authentication

## Getting Started with Flutter Development

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
