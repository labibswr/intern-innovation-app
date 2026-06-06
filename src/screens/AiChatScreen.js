import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import Colors from '../theme/colors';
import { sendImageToAI, getOpeningPrompt } from '../services/aiService';

// ─── Typewriter Component ────────────────────────────────────────────────────
// Streams text character by character so AI responses feel live and dynamic.
function TypewriterText({ text, style, onComplete, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return <Text style={style}>{displayed}</Text>;
}

// ─── Pulsing Dot Indicator ────────────────────────────────────────────────────
// Shows a gentle pulse while the AI is "thinking" — avoids a dead loading state.
function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulsingRow}>
      <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />
      <Text style={styles.analyzingText}>Analyzing your photo…</Text>
    </View>
  );
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ message, onTypingComplete }) {
  const isAI = message.role === 'ai';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <View style={styles.systemBubble}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleWrapper, isAI ? styles.aiWrapper : styles.userWrapper]}>
      {isAI && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>AI</Text>
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        {message.imageUri && (
          <Image source={{ uri: message.imageUri }} style={styles.imagePreview} />
        )}
        {message.animate ? (
          <TypewriterText
            text={message.text}
            style={[styles.bubbleText, isAI && styles.aiText]}
            onComplete={onTypingComplete}
            speed={16}
          />
        ) : (
          <Text style={[styles.bubbleText, isAI && styles.aiText]}>{message.text}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AiChatScreen({ navigation }) {
  const { userProfile, activeAlerts } = useContext(AppContext);
  const activeAlert = activeAlerts?.[0] || null;
  const alertType = activeAlert?.type || 'default';

  const openingPrompt = getOpeningPrompt(alertType);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'ai-intro',
      role: 'ai',
      text: `Hi! I'm your Intact Shield AI assistant.\n\nI'll guide you through ${activeAlert?.title || 'storm'} preparation step by step. After each step, take a photo and I'll verify you're on track.\n\n${openingPrompt}`,
      animate: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const appendMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
    scrollToBottom();
  };

  const handleUploadPhoto = async () => {
    if (isAnalyzing || isTyping) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      appendMessage({
        id: `system-${Date.now()}`,
        role: 'system',
        text: '⚠️ Camera access is required to verify your prevention steps.',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets?.[0]?.uri || result.uri;

    // 1. Append user photo bubble immediately
    appendMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      text: "Here's my photo.",
      imageUri,
      animate: false,
    });

    // 2. Show pulsing "analyzing" state
    setIsAnalyzing(true);

    // 3. Call AI service (mock or real)
    const aiResult = await sendImageToAI(imageUri, userProfile, {
      activeAlert,
      currentStep,
    });

    setIsAnalyzing(false);
    setIsTyping(true);

    // 4. Stream AI response with typewriter effect
    const nextStep = currentStep + 1;
    const fullText = aiResult.nextPrompt
      ? `${aiResult.responseText}\n\n—\n\n${aiResult.nextPrompt}`
      : aiResult.responseText;

    appendMessage({
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: fullText,
      animate: true,
    });

    setCurrentStep(nextStep);
    if (aiResult.isComplete) setIsComplete(true);
  };

  const handleTypingComplete = () => {
    setIsTyping(false);
    scrollToBottom();
  };

  // ─── Step Progress Bar ───────────────────────────────────────────────────
  const totalSteps = 3; // matches mock steps; update when AI is integrated
  const progress = Math.min(currentStep / totalSteps, 1);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">AI Safety Verifier</Text>

          <View style={{ width: 44 }} />
        </View>

        {activeAlert && (
          <View style={styles.alertRow}>
            <View style={styles.alertBadgeFull}>
              <Text style={styles.alertBadgeText} numberOfLines={2} ellipsizeMode="tail">⚡ {activeAlert.title}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {isComplete ? '✅ All steps complete' : `Step ${Math.min(currentStep + 1, totalSteps)} of ${totalSteps}`}
        </Text>
      </View>

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={scrollToBottom}
      >
        {chatMessages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onTypingComplete={message.animate ? handleTypingComplete : undefined}
          />
        ))}

        {isAnalyzing && <PulsingDot />}
      </ScrollView>

      {/* Action Button */}
      {!isComplete ? (
        <TouchableOpacity
          style={[styles.photoButton, (isAnalyzing || isTyping) && styles.photoButtonDisabled]}
          onPress={handleUploadPhoto}
          disabled={isAnalyzing || isTyping}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.photoButtonIcon}>📷</Text>
              <Text style={styles.photoButtonText}>
                {isTyping ? 'AI is responding…' : 'Take Prevention Photo'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.completeCard}>
          <Text style={styles.completeIcon}>🛡️</Text>
          <Text style={styles.completeTitle}>Home Protected</Text>
          <Text style={styles.completeSubtitle}>
            All prevention steps verified. Stay safe and monitor for updates.
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4fb',
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: Colors.brandRed,
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'left',
    paddingLeft: 8,
  },
  alertBadge: {
    backgroundColor: '#e8a020',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertRow: {
    width: '100%',
    marginTop: 6,
    alignItems: 'flex-end',
  },
  alertBadgeFull: {
    backgroundColor: '#e8a020',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },

  // Progress
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#dde3ed',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brandRed,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Chat
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // Bubbles
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  aiAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dfe3e8',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#1a73e8',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#ffffff',
  },
  aiText: {
    color: '#102a43',
  },
  imagePreview: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
  },

  // System message
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  systemText: {
    color: '#92400e',
    fontSize: 13,
    textAlign: 'center',
  },

  // Pulsing dot
  pulsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 48,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brandRed,
    marginRight: 10,
  },
  analyzingText: {
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Photo button
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandRed,
    margin: 16,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: Colors.brandRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  photoButtonDisabled: {
    backgroundColor: '#f4b8b9',
    shadowOpacity: 0,
  },
  photoButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  photoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Completion card
  completeCard: {
    margin: 16,
    backgroundColor: Colors.brandRed,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  completeIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  completeTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  completeSubtitle: {
    color: '#fde7e8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: Colors.brandRed,
    fontSize: 22,
  },
});
