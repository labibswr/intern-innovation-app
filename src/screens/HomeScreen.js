import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { fetchActiveAlerts } from '../services/weatherApi';

export default function HomeScreen({ navigation }) {
  const { userProfile, activeAlerts, setActiveAlerts } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      const alerts = await fetchActiveAlerts(userProfile.location);
      setActiveAlerts(alerts);
      setIsLoading(false);
    };

    if (!activeAlerts || activeAlerts.length === 0) {
      loadAlerts();
    }
  }, [activeAlerts, setActiveAlerts, userProfile.location]);

  const activeAlert = activeAlerts && activeAlerts.length > 0 ? activeAlerts[0] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Home risk dashboard</Text>
      <Text style={styles.subtitle}>Personalized weather alerts and home risk guidance for {userProfile.location}.</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Current weather warning</Text>
        <Text style={styles.cardTitle}>{activeAlert ? activeAlert.title : 'No active alerts'}</Text>
        <Text style={styles.cardBody}>{activeAlert ? activeAlert.summary : 'Your home is currently not in the path of an active event.'}</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('AlertDetail', { alert: activeAlert })}
          disabled={!activeAlert}
        >
          <Text style={[styles.detailButtonText, !activeAlert && styles.disabledText]}>View alert details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.cardLabel}>Your property profile</Text>
        <Text style={styles.profileText}>Property type: {userProfile.propertyType}</Text>
        <Text style={styles.profileText}>Flood detector: {userProfile.hasFloodDetector ? 'Installed' : 'Not installed'}</Text>
        <Text style={styles.profileText}>Smoke alarms: {userProfile.hasSmokeAlarms ? 'Active' : 'Inactive'}</Text>
        <Text style={styles.profileText}>Large trees nearby: {userProfile.hasLargeTrees ? 'Yes' : 'No'}</Text>
      </View>

      <TouchableOpacity style={styles.aiCard} onPress={() => navigation.navigate('AiChat')}>
        <Text style={styles.aiTitle}>AI Prevention Assistant</Text>
        <Text style={styles.aiBody}>Upload a photo of a preventative action and get instant validation from your assistant.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('AiChat')}>
        <Text style={styles.secondaryButtonText}>Open AI Assistant</Text>
      </TouchableOpacity>

      {isLoading && <Text style={styles.loadingText}>Refreshing active alerts…</Text>}
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#334e68',
    fontSize: 16,
    marginBottom: 22,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  cardLabel: {
    color: '#1f4d7a',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 8,
  },
  cardBody: {
    color: '#334e68',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  detailButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledText: {
    opacity: 0.6,
  },
  profileCard: {
    backgroundColor: '#f7fbff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  profileText: {
    color: '#102a43',
    fontSize: 15,
    marginBottom: 10,
  },
  aiCard: {
    backgroundColor: '#1a73e8',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  aiTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  aiBody: {
    color: '#dbe9ff',
    fontSize: 15,
    lineHeight: 22,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dfe3e8',
  },
  secondaryButtonText: {
    color: '#1a73e8',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 14,
    color: '#627d98',
    fontSize: 14,
    textAlign: 'center',
  },
});
