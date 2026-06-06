import React, { useContext, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import Colors from '../theme/colors';
import { fetchActiveAlerts } from '../services/weatherApi';

const propertyOptions = ['House', 'Apartment', 'Townhome', 'Condo'];

export default function OnboardingScreen({ navigation }) {
  const { userProfile, updateUserProfile, setActiveAlerts } = useContext(AppContext);
  const [propertyType, setPropertyType] = useState(userProfile.propertyType);
  const [location, setLocation] = useState(userProfile.location);
  const [hasFloodDetector, setHasFloodDetector] = useState(userProfile.hasFloodDetector);
  const [hasSmokeAlarms, setHasSmokeAlarms] = useState(userProfile.hasSmokeAlarms);
  const [hasLargeTrees, setHasLargeTrees] = useState(userProfile.hasLargeTrees);
  const [hasSecuritySystem, setHasSecuritySystem] = useState(userProfile.hasSecuritySystem);

  const handleSaveAndContinue = async () => {
    updateUserProfile({
      propertyType,
      location,
      hasFloodDetector,
      hasSmokeAlarms,
      hasLargeTrees,
      hasSecuritySystem,
    });

    const alerts = await fetchActiveAlerts(location);
    setActiveAlerts(alerts);
    navigation.replace('Home');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Welcome to Intact Protect</Text>
      <Text style={styles.subheading}>
        Set up your home profile so we can surface personalized weather alerts and prevention guidance.
      </Text>

      <Text style={styles.label}>Property type</Text>
      <View style={styles.optionRow}>
        {propertyOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionItem, propertyType === option && styles.optionItemSelected]}
            onPress={() => setPropertyType(option)}
          >
            <Text style={[styles.optionText, propertyType === option && styles.optionTextSelected]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Toronto, ON"
        placeholderTextColor="#8c98a4"
      />

      <Text style={styles.label}>Safety checks</Text>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasFloodDetector((value) => !value)}>
        <View style={[styles.checkbox, hasFloodDetector && styles.checkboxActive]} />
        <Text style={styles.checkboxLabel}>Flood detector installed</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasSmokeAlarms((value) => !value)}>
        <View style={[styles.checkbox, hasSmokeAlarms && styles.checkboxActive]} />
        <Text style={styles.checkboxLabel}>Smoke alarms are active</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasLargeTrees((value) => !value)}>
        <View style={[styles.checkbox, hasLargeTrees && styles.checkboxActive]} />
        <Text style={styles.checkboxLabel}>Large trees are nearby</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasSecuritySystem((value) => !value)}>
        <View style={[styles.checkbox, hasSecuritySystem && styles.checkboxActive]} />
        <Text style={styles.checkboxLabel}>Home security system installed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSaveAndContinue}>
        <Text style={styles.primaryButtonText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },
  content: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 12,
  },
  subheading: {
    color: '#334e68',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  label: {
    marginTop: 20,
    marginBottom: 12,
    color: '#102a43',
    fontWeight: '600',
    fontSize: 15,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe3e8',
    marginRight: 10,
    marginBottom: 10,
  },
  optionItemSelected: {
    backgroundColor: Colors.brandRed,
    borderColor: Colors.brandRed,
  },
  optionText: {
    color: '#102a43',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#102a43',
    borderWidth: 1,
    borderColor: '#dfe3e8',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#627d98',
    marginRight: 14,
  },
  checkboxActive: {
    backgroundColor: Colors.brandRed,
    borderColor: Colors.brandRed,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#102a43',
  },
  primaryButton: {
    marginTop: 30,
    backgroundColor: Colors.brandRed,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  toolbar: {
    height: 44,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  backButtonText: {
    color: Colors.brandRed,
    fontSize: 22,
  },
});
