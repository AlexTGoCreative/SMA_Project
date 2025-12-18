# 🏠 Property Rental & Bidding App

A full-stack mobile application for renting properties with an integrated bidding system. Built with React Native (Expo), Node.js, and MongoDB.

![Status](https://img.shields.io/badge/Status-Bidding%20System%20Complete-success)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Backend](https://img.shields.io/badge/Backend-Live-success)

---

## ✨ Features

### Authentication & User Management
- 🔐 **Secure Authentication** - JWT-based login and registration
- 👤 **User Profiles** - Manage your account and preferences
- 💾 **Persistent Login** - Stay logged in across app restarts

### Property Listings
- 🏡 **Add Listings** - Post properties with photos and details
- 📸 **Image Upload** - Camera & gallery integration
- 🗺️ **Location Picker** - Interactive map with geocoding
- 🔍 **Search & Filter** - Find properties easily
- 📍 **Map View** - See all properties on a map

### Bidding System
- 💰 **Make Offers** - Bid on properties (min. 60% of asking price)
- 📊 **Track Bids** - Monitor all your offers
- ✅ **Accept/Reject** - Owners manage received bids
- 💬 **Messages** - Add notes with your bids
- 🔔 **Status Updates** - Real-time bid status tracking

### Technical
- ☁️ **Cloud Backend** - Deployed on Render.com
- 🗄️ **MongoDB Atlas** - Cloud database
- 📱 **Expo Go Compatible** - Test instantly on your phone
- 🎨 **Modern UI** - Clean, iOS-style interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the app**
```bash
npx expo start --tunnel
```

4. **Scan QR code** with your phone camera (iOS) or Expo Go app (Android)

That's it! The backend is already deployed and ready to use. 🎉

---

## 📸 Screenshots

### Login Screen
- Clean, simple login form
- Email and password validation
- Error handling

### Register Screen
- User registration with name, email, password
- Password confirmation
- Real-time validation

### Dashboard
- User avatar with initials
- Account statistics
- User information cards
- Quick actions menu
- Pull-to-refresh

---

## 🏗️ Tech Stack

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Deployment
- **Render.com** - Backend hosting (free tier)
- **MongoDB Atlas** - Database hosting (free tier)
- **Expo Go** - Mobile testing

---

## 📁 Project Structure

```
├── App.js                    # Main app entry point
├── screens/
│   ├── LoginScreen.js        # Login page
│   ├── RegisterScreen.js     # Registration page
│   └── HomeScreen.js         # Dashboard
├── utils/
│   ├── api.js               # API client
│   └── config.js            # Configuration
├── backend/                 # Backend (submodule)
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
├── PROJECT_STATUS.md       # Development tracking
└── README.md              # This file
```

---

## 🔌 API Endpoints

### Base URL
```
https://sma-backend-sf9h.onrender.com/api
```

### Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```http
GET /api/profile
Authorization: Bearer {token}
```

---

## 🔐 Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens for authentication
- ✅ Secure token storage with AsyncStorage
- ✅ Input validation on frontend and backend
- ✅ CORS configured
- ✅ Protected API routes

---

## 🎨 UI Components

### Screens
- **LoginScreen** - User login with validation
- **RegisterScreen** - User registration with password confirmation
- **HomeScreen** - Enhanced dashboard with user info and stats

### Features
- Avatar with user initials
- Statistics cards
- Information cards with icons
- Quick action buttons
- Pull-to-refresh
- Loading states
- Error handling

---

## 🛠️ Development

### Run Locally

1. **Install dependencies**
```bash
npm install
```

2. **Start Expo**
```bash
npx expo start --tunnel
```

3. **Open in Expo Go**
- Scan QR code with your phone

### Backend Development

The backend is deployed, but if you want to run it locally:

```bash
cd backend
npm install
node server.js
```

Update `utils/config.js` to point to `http://localhost:3000/api`

---

## 📊 Project Status

**Phase 1: Authentication & Foundation** ✅ **COMPLETE**

- [x] Backend API with MongoDB
- [x] User authentication (JWT)
- [x] Login/Register screens
- [x] Enhanced dashboard
- [x] Cloud deployment

**Phase 2: User Profile Management** 🚧 **NEXT**

- [ ] Edit profile
- [ ] Change password
- [ ] Profile picture upload
- [ ] Settings screen

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed roadmap.

---

## 🐛 Known Issues

None currently! Phase 1 is stable. ✅

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - For making React Native development easier
- [Render.com](https://render.com/) - For free backend hosting
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For free cloud database
- [React Navigation](https://reactnavigation.org/) - For smooth navigation

---

## 📞 Support

- **Backend Repository**: [SMA_Backend](https://github.com/AlexTGoCreative/SMA_Backend)
- **Issues**: Open an issue on GitHub
- **Questions**: Create a discussion

---

## 🎯 Roadmap

- [x] Phase 1: Authentication & Foundation
- [ ] Phase 2: User Profile Management
- [ ] Phase 3: Listings Management
- [ ] Phase 4: Geolocation & Maps
- [ ] Phase 5: Bidding System
- [ ] Phase 6: Messaging
- [ ] Phase 7: Polish & Additional Features

---

**Built with ❤️ using React Native and Expo**

⭐ Star this repo if you find it helpful!

