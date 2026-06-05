import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../context/AppContext';
import { sendImageToAI } from '../services/aiService';

const { width, height } = Dimensions.get('window');

const AI_PROMPTS = [
  "Hi! Point your camera at any preventative step you've taken and upload a photo — I'll verify it.",
  "Based on your location, there's active flood risk. Show me your basement area.",
  "Check your eavestroughs and downspouts — upload a photo so I can verify proper drainage.",
  "Your flood risk profile is moderate. I'd love to see your sump pump setup.",
  "Great preparation so far. Keep valuables at least 30 cm above floor level.",
];

export default function AiCallScreen({ navigation }) {
  const { userProfile, activeAlerts } = useContext(AppContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  // Animations
  const aiPulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const messageTranslateY = useRef(new Animated.Value(12)).current;
  const waveAnims = useRef([
    new Animated.Value(0.25),
    new Animated.Value(0.6),
    new Animated.Value(0.4),
    new Animated.Value(0.85),
    new Animated.Value(0.5),
    new Animated.Value(0.7),
    new Animated.Value(0.35),
  ]).current;

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => setCallSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // Show initial AI greeting
  useEffect(() => {
    const id = setTimeout(() => showAIMessage(AI_PROMPTS[0]), 1800);
    return () => clearTimeout(id);
  }, []);

  // AI avatar pulse + glow
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, { toValue: 1.1, duration: 950, useNativeDriver: true }),
        Animated.timing(aiPulse, { toValue: 1, duration: 950, useNativeDriver: true }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.9, duration: 1100, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();
    glowLoop.start();
    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, []);

  // Waveform animation when AI is speaking
  useEffect(() => {
    if (!isAISpeaking) return;

    const loops = waveAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(anim, { toValue: 1, duration: 220 + i * 30, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.15, duration: 220 + i * 30, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [isAISpeaking]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showAIMessage = (message) => {
    messageOpacity.stopAnimation();
    messageTranslateY.stopAnimation();
    setCurrentMessage(message);
    setIsAISpeaking(true);
    setShowMessage(true);

    Animated.parallel([
      Animated.timing(messageOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(messageTranslateY, { toValue: 0, useNativeDriver: true, tension: 80 }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(messageOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(messageTranslateY, { toValue: 8, duration: 500, useNativeDriver: true }),
      ]).start(() => {
        setShowMessage(false);
        setIsAISpeaking(false);
        messageTranslateY.setValue(12);
      });
    }, 5500);
  };

  const handleUploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets?.[0]?.uri || result.uri;
    setIsAnalyzing(true);
    showAIMessage('📸 Received your photo — analyzing it now...');

    const response = await sendImageToAI(imageUri, userProfile, { activeAlert: activeAlerts[0] });
    setIsAnalyzing(false);

    // Pull the first meaningful sentence from the AI response
    const firstLine = response.split('\n').find(l => l.replace(/[#*•✅\s]/g, '').length > 20) || response;
    showAIMessage(firstLine.replace(/[#*•✅]/g, '').trim());
  };

  const handleFlipCamera = () => {
    setFacing(f => (f === 'back' ? 'front' : 'back'));
  };

  const handleEndCall = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Live camera or dark fallback ── */}
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.cameraFallback]} />
      )}

      {/* Scrim gradients */}
      <View style={styles.topScrim} pointerEvents="none" />
      <View style={styles.bottomScrim} pointerEvents="none" />

      {/* ── Header bar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.signalRow}>
            {[1, 1, 1, 0].map((active, i) => (
              <View
                key={i}
                style={[
                  styles.signalBar,
                  { height: 6 + i * 3, opacity: active ? 1 : 0.3 },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.callerName}>BirdyAI</Text>
          <View style={styles.durationRow}>
            <View style={styles.liveDot} />
            <Text style={styles.callDuration}>{formatDuration(callSeconds)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.hdTag}>
            <Text style={styles.hdTagText}>HD</Text>
          </View>
        </View>
      </View>

      {/* ── AI avatar PiP (top-right) ── */}
      <View style={styles.aiPipContainer}>
        {/* Glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            { opacity: glowOpacity, transform: [{ scale: aiPulse }] },
          ]}
        />
        {/* Avatar card */}
        <View style={styles.aiPipCard}>
          <Text style={styles.aiPipEmoji}>🤖</Text>
          {/* Name label */}
          <Text style={styles.aiPipLabel}>AI</Text>
        </View>

        {/* Waveform under avatar when speaking */}
        {isAISpeaking && (
          <View style={styles.waveformRow}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: anim }] },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── AI speech bubble ── */}
      {showMessage && (
        <Animated.View
          style={[
            styles.speechBubble,
            {
              opacity: messageOpacity,
              transform: [{ translateY: messageTranslateY }],
            },
          ]}
        >
          <View style={styles.speechBubbleInner}>
            <View style={styles.speechDot} />
            <Text style={styles.speechText} numberOfLines={4}>
              {currentMessage}
            </Text>
          </View>
          {isAnalyzing && (
            <View style={styles.typingRow}>
              <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
              <View style={[styles.typingDot, { animationDelay: '160ms' }]} />
              <View style={[styles.typingDot, { animationDelay: '320ms' }]} />
            </View>
          )}
        </Animated.View>
      )}

      {/* ── Control bar ── */}
      <View style={styles.controlsBar}>
        {/* Row 1 — main actions */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnOn]}
            onPress={() => setIsMuted(m => !m)}
            activeOpacity={0.75}
          >
            <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
            <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* End call — centre, red, larger */}
          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall} activeOpacity={0.8}>
            <Text style={styles.endCallIcon}>📵</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnOn]}
            onPress={() => setIsSpeakerOn(s => !s)}
            activeOpacity={0.75}
          >
            <Text style={styles.controlIcon}>{isSpeakerOn ? '🔊' : '🔈'}</Text>
            <Text style={styles.controlLabel}>Speaker</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 — secondary actions */}
        <View style={[styles.controlsRow, styles.controlsRowSecondary]}>
          <TouchableOpacity style={styles.controlBtnSmall} onPress={handleFlipCamera} activeOpacity={0.75}>
            <Text style={styles.controlIconSmall}>🔄</Text>
            <Text style={styles.controlLabelSmall}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBtnPill} onPress={handleUploadPhoto} activeOpacity={0.8}>
            <Text style={styles.uploadBtnIcon}>📷</Text>
            <Text style={styles.uploadBtnText}>Upload photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtnSmall} activeOpacity={0.75}>
            <Text style={styles.controlIconSmall}>⋯</Text>
            <Text style={styles.controlLabelSmall}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const CTRL_BTN_SIZE = 62;
const END_BTN_SIZE = 76;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraFallback: {
    backgroundColor: '#0d1520',
  },

  // Scrim overlays
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    // simulate top-down gradient with opacity layers
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: { flex: 1, alignItems: 'flex-start' },
  headerCenter: { flex: 2, alignItems: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  callerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34c759',
    marginRight: 5,
  },
  callDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontVariant: ['tabular-nums'],
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  signalBar: {
    width: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  hdTag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  hdTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // AI PiP
  aiPipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 110,
    right: 18,
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(26, 115, 232, 0.35)',
    top: -8,
  },
  aiPipCard: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#1a2540',
    borderWidth: 2,
    borderColor: 'rgba(26,115,232,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a73e8',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  aiPipEmoji: {
    fontSize: 30,
  },
  aiPipLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 3,
    height: 16,
  },
  waveBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#1a73e8',
  },

  // Speech bubble
  speechBubble: {
    position: 'absolute',
    bottom: 230,
    left: 18,
    right: 110,
  },
  speechBubbleInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(10, 20, 40, 0.82)',
    borderRadius: 18,
    borderTopLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(26,115,232,0.4)',
  },
  speechDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a73e8',
    marginTop: 5,
    marginRight: 10,
  },
  speechText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 8,
    paddingLeft: 16,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // Controls
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlsRowSecondary: {
    marginTop: 4,
  },
  controlBtn: {
    width: CTRL_BTN_SIZE,
    height: CTRL_BTN_SIZE,
    borderRadius: CTRL_BTN_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlBtnOn: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  controlIcon: {
    fontSize: 22,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  endCallBtn: {
    width: END_BTN_SIZE,
    height: END_BTN_SIZE,
    borderRadius: END_BTN_SIZE / 2,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e53935',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  endCallIcon: {
    fontSize: 28,
  },
  controlBtnSmall: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconSmall: {
    fontSize: 19,
  },
  controlLabelSmall: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  uploadBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 115, 232, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#1a73e8',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  uploadBtnIcon: {
    fontSize: 17,
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
