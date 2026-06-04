import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import { sendImageToAI } from '../services/aiService';

const initialMessage = {
  id: 'ai-1',
  role: 'ai',
  text: 'Hi there! Please upload a photo of a preventative step you have taken so I can validate it and give you next guidance.',
};

export default function AiChatScreen() {
  const { userProfile, activeAlerts } = useContext(AppContext);
  const [chatMessages, setChatMessages] = useState([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const appendMessage = (message) => setChatMessages((messages) => [...messages, message]);

  const handleUploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      appendMessage({
        id: `system-${Date.now()}`,
        role: 'system',
        text: 'Photo permissions are required to upload your preventative evidence.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets?.[0]?.uri || result.uri;
    appendMessage({ id: `user-${Date.now()}`, role: 'user', text: 'Uploaded a photo', imageUri });
    setIsLoading(true);

    const responseText = await sendImageToAI(imageUri, userProfile, { activeAlert: activeAlerts[0] });

    appendMessage({ id: `ai-${Date.now()}`, role: 'ai', text: responseText });
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.chatContainer}>
        {chatMessages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.role === 'ai' ? styles.aiBubble : styles.userBubble]}>
            <Text style={[styles.messageText, message.role === 'ai' && styles.aiText]}>{message.text}</Text>
            {message.imageUri ? <Image source={{ uri: message.imageUri }} style={styles.imagePreview} /> : null}
          </View>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#1a73e8" />
          <Text style={styles.loadingText}>Analyzing your image…</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhoto}>
        <Text style={styles.uploadButtonText}>Upload prevention photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4fb',
  },
  chatContainer: {
    padding: 20,
  },
  messageRow: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    maxWidth: '92%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#dfe3e8',
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a73e8',
  },
  messageText: {
    color: '#102a43',
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#102a43',
  },
  imagePreview: {
    width: 220,
    height: 160,
    borderRadius: 14,
    marginTop: 12,
  },
  uploadButton: {
    backgroundColor: '#1a73e8',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingText: {
    color: '#334e68',
    marginLeft: 10,
  },
});
