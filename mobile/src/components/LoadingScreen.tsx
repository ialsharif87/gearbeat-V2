import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Easing } from 'react-native';

export function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, pulseAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle} />
            <Text style={styles.text}>GEARBEAT</Text>
            <View style={styles.goldLine} />
          </View>
        </Animated.View>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#FFD700" />
          <Text style={styles.subtext}>Initializing Premium Experience</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>STUDIO . SOUND . CONNECTED</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 34,
    letterSpacing: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  goldLine: {
    width: 40,
    height: 1,
    backgroundColor: '#FFD700',
    opacity: 0.5,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subtext: {
    marginLeft: 12,
    color: '#666666',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    color: '#222222',
    fontSize: 8,
    letterSpacing: 4,
    fontWeight: '800',
  },
});
