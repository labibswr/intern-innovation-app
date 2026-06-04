# 🛡️ Intact Protect — Proactive Home Protection App

> **Don't wait for the storm to pass. Prepare before it arrives.**

Intact Protect is a mobile application that fundamentally reimagines the insurance experience — shifting from reactive payouts to proactive prevention. By profiling a user's home, monitoring localized weather threats, and guiding them through AI-verified safety steps, the app helps homeowners protect what matters most before disaster ever strikes.

---

## 💡 The Problem We're Solving

Traditional insurance is built around a painful cycle:

**Disaster strikes → Damage occurs → Claim filed → Payout received**

The homeowner still loses time, belongings, and peace of mind. Intact Protect breaks this cycle entirely by intervening *before* the damage happens.

---

## ✨ Core Features

### 🏠 Smart Home Onboarding
A guided setup wizard that builds a digital profile of the user's property — home type, location, and existing safety infrastructure (sump pumps, flood detectors, smoke alarms, nearby large trees, and more). This profile becomes the intelligence layer that personalizes every alert and recommendation.

### 🌩️ Early Warning Dashboard
A clean, stress-free home screen that displays real-time weather status for the user's area. When a severe event is approaching, the dashboard shifts into **Preparation Mode** — surfacing a high-visibility alert banner that tells the user exactly what's coming and how serious it is.

### 📋 Personalized Action Plans
No generic checklists here. When an alert fires, the app generates a customized action plan based on the user's specific home profile. A condo owner on the 5th floor gets wind-prep tips. A detached homeowner with a basement gets drainage and flood barrier instructions. The right advice for the right home, every time.

### 🤖 AI Safety Verifier *(The Crown Jewel)*
An interactive photo-chat assistant that replaces static instruction manuals with a real-time verification loop. The AI walks the user through preventative steps one by one, asks them to take a photo of each completed action, and confirms whether it's done correctly — then guides them to the next step. Think of it as having a home safety expert in your pocket during the worst moments.

---

## 🏗️ Architecture Overview

```
InternInnovationApp/
├── App.js                          # Root entry point
├── index.js                        # App registry
├── src/
│   ├── context/
│   │   └── AppContext.js           # Global state (user profile + active alerts)
│   ├── navigation/
│   │   └── AppNavigator.js         # Stack navigator (Onboarding → Home → Alert → AI Chat)
│   ├── screens/
│   │   ├── OnboardingScreen.js     # Home profile setup wizard
│   │   ├── HomeScreen.js           # Weather dashboard + alert banner
│   │   ├── AlertDetailScreen.js    # Personalized action plan article
│   │   └── AiChatScreen.js        # Photo-verification AI chat
│   └── services/
│       ├── weatherApi.js           # 🔌 Weather data socket (mock → real API)
│       └── aiService.js            # 🔌 AI vision socket (mock → real model)
```

### Integration Sockets

The app is architected with clear **plug-in points** so teammates can drop in real services without touching the UI layer:

| Socket | File | Current State | Replace With |
|--------|------|--------------|--------------|
| Weather Data | `services/weatherApi.js` | Mock JSON alerts | Real weather API |
| AI Vision | `services/aiService.js` | Simulated responses | Custom AI model |
| Home Profile | `context/AppContext.js` | Local state | Backend persistence |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 22.11.0`
- Xcode (for iOS simulator)
- Expo CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/intern-innovation-app.git
cd intern-innovation-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on iOS

```bash
# From the Expo menu, press 'i' to open iOS simulator
npx expo start
# → press i
```

### Installing New Expo Packages

Always use `npx expo install` instead of `npm install` for Expo-compatible packages:

```bash
npx expo install expo-image-picker
```

---

## 🧩 Team Roles

| Role | Responsibility |
|------|---------------|
| **Frontend / Architect** | App shell, all screens, navigation, global state, mock services |
| **AI Teammate** | Replace `aiService.js` with real vision model endpoint |
| **Weather Teammate** | Replace `weatherApi.js` with real localized weather data |

---

## 🔌 Plugging In Real Services

### Replacing the Weather API

Open `src/services/weatherApi.js` and replace the mock return with your real API call:

```js
export async function fetchActiveAlerts(location) {
  // Replace this with your real weather API call
  const response = await fetch(`https://your-weather-api.com/alerts?location=${location}`);
  return response.json();
}
```

### Replacing the AI Service

Open `src/services/aiService.js` and replace the mock response with your model endpoint:

```js
export async function sendImageToAI(imageUri, userProfile, context) {
  // Replace this with your real AI model call
  const response = await fetch('https://your-ai-model.com/verify', {
    method: 'POST',
    body: JSON.stringify({ imageUri, userProfile, context }),
  });
  return response.json();
}
```

---

## 🎨 Design Principles

- **Calm under pressure** — the UI uses deep blues, crisp whites, and subtle grays to reduce anxiety during stressful weather events
- **Legibility first** — large buttons and high-contrast text, designed for use in poor conditions
- **Personalization at the core** — every screen is aware of the user's home profile and adapts accordingly
- **Plug-and-play architecture** — the frontend is fully functional with mock data so any teammate can test the full user flow independently

---

## 📱 Screen Flow

```
App Launch
    │
    ▼
Onboarding (first launch only)
    │  Enter home type, location, safety features
    ▼
Home Dashboard
    │  View weather status + active alerts
    ├──────────────────────┐
    ▼                      ▼
Alert Detail           AI Chat (direct)
    │  Personalized        │
    │  action plan         │
    ▼                      │
AI Safety Verifier ◄───────┘
    │  Photo verification loop
    ▼
✅ Home Protected
```

---

## 🏢 Built For

**Intact Financial Corporation** — Intern Innovation Challenge

> *Protecting what matters, before it's too late.*
