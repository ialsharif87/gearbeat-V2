import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated, Easing, Image } from 'react-native';

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

    // Premium slow pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
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
            <Image 
              source={require('../../assets/logo-mark.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.text}>GEARBEAT</Text>
            <View style={styles.goldLine} />
          </View>
        </Animated.View>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#D4AF37" />
          <Text style={styles.subtext}>Initializing Premium Experience</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>STUDIO · SOUND · CONNECTED.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0F16', // Core brand luxurious deep slate background
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  text: {
    color: '#F8F9FA', // Cream color for brand text
    fontSize: 32,
    letterSpacing: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System', // Avoid crash if custom fonts aren't loaded in React Native
  },
  goldLine: {
    width: 50,
    height: 2,
    backgroundColor: '#D4AF37', // True metallic gold
    opacity: 0.6,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)', // Subtle gold border
  },
  subtext: {
    marginLeft: 12,
    color: '#8A99AD', // Muted slate gray
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    color: '#3A4659', // Beautiful dark copper tone for subtle branding
    fontSize: 9,
    letterSpacing: 4,
    fontWeight: '800',
  },
});
