# Paper Trading Financial Application - Mobile Setup

## 📱 Mobile App Development

This repository now includes a Flutter mobile app in addition to the web application.

### Quick Start for Mobile Development:

1. **Install Flutter**: https://docs.flutter.dev/get-started/install
2. **Install Android Studio**: https://developer.android.com/studio  
3. **Navigate to mobile folder**: `cd mobile`
4. **Install dependencies**: `flutter pub get`
5. **Run the app**: `flutter run`

📋 **Detailed setup instructions**: See `mobile/README.md`

### Repository Structure:

```
Paper-Trading-Financial-Application/
├── backend/              # Node.js Express API server
├── frontend/             # React TypeScript web app
├── mobile/              # Flutter mobile app (NEW!)
│   ├── lib/main.dart    # Mobile app entry point
│   └── README.md        # Detailed mobile setup guide
├── mobile-preview.html  # Mobile UI preview (HTML mockup)
└── mobile-template/     # Flutter template files
```

### Development Platforms:

| Platform | Technology | Status | Port |
|----------|------------|---------|------|
| **Web** | React + Vite | ✅ Active | 5173 |
| **API** | Node.js + Express | ✅ Active | 5000 |
| **Mobile** | Flutter | ✅ Active | Emulator |
| **Database** | MongoDB Atlas | ✅ Active | Cloud |

### Getting Started:

#### For Web Development:
```bash
# Backend
npm install
npm start              # Port 5000

# Frontend  
cd frontend
npm install
npm run dev            # Port 5173
```

#### For Mobile Development:
```bash
cd mobile
flutter pub get
flutter run            # Android emulator or device
```

#### For Full Stack Development:
- **Backend**: `npm start` (API server)
- **Frontend**: `npm run dev` (web app)  
- **Mobile**: `flutter run` (mobile app)
- All three can run simultaneously and share the same backend API!

### Next Steps:
1. Connect mobile app to existing backend API
2. Implement shared authentication system
3. Add mobile-specific trading features
4. Deploy mobile app to app stores