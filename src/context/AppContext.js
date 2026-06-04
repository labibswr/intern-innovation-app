import React, { createContext, useState } from 'react';

export const AppContext = createContext({
  userProfile: {},
  activeAlerts: [],
  updateUserProfile: () => {},
  setActiveAlerts: () => {},
});

const defaultProfile = {
  propertyType: 'House',
  location: 'Toronto, ON',
  hasFloodDetector: false,
  hasSmokeAlarms: false,
  hasLargeTrees: false,
  hasSecuritySystem: false,
};

const defaultAlerts = [
  {
    id: 'weather-001',
    title: 'Severe Rainstorm Approaching',
    level: 'High',
    summary: 'Heavy rain and localized flooding are expected in your area today.',
    details:
      'Stay indoors, secure loose outdoor items, and keep gutters clear. Watch for localized flooding and roof leaks.',
  },
];

export function AppProvider({ children }) {
  const [userProfile, setUserProfile] = useState(defaultProfile);
  const [activeAlerts, setActiveAlerts] = useState(defaultAlerts);

  const updateUserProfile = (profileUpdates) =>
    setUserProfile((current) => ({ ...current, ...profileUpdates }));

  return (
    <AppContext.Provider value={{ userProfile, activeAlerts, updateUserProfile, setActiveAlerts }}>
      {children}
    </AppContext.Provider>
  );
}
