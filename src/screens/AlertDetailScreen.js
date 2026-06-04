import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function AlertDetailScreen({ navigation, route }) {
  const { userProfile, activeAlerts } = useContext(AppContext);
  const alert = route.params?.alert || (activeAlerts.length > 0 ? activeAlerts[0] : null);

  const preventionSteps = [
    'Check roof drains and gutters for debris.',
    'Secure outdoor furniture and any loose materials.',
    'Keep entryways clear of water routes.',
  ];

  if (userProfile.hasFloodDetector) {
    preventionSteps.unshift('Your flood detector gives you an early warning before water reaches your home.');
  }

  if (userProfile.hasLargeTrees) {
    preventionSteps.push('Trim any large branches that could fall during severe weather.');
  }

  if (userProfile.hasSmokeAlarms) {
    preventionSteps.push('Smoke alarms are active, which helps protect against secondary hazards.');
  }

  if (!alert) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No alert selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.subtitle}>{alert.details}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Why it matters</Text>
        <Text style={styles.sectionText}>
          This weather event can increase the risk of water intrusion, structural damage, and property loss. The prevention steps below are tailored to your home profile and current safety measures.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Recommended prevention steps</Text>
        {preventionSteps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.stepBullet}>•</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AiChat')}>
        <Text style={styles.primaryButtonText}>Start Prevention Verification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 10,
  },
  subtitle: {
    color: '#334e68',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    color: '#334e68',
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepBullet: {
    color: '#1a73e8',
    fontSize: 18,
    lineHeight: 24,
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    color: '#102a43',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
