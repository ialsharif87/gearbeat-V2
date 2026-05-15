import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Animated } from 'react-native';

export function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.text}>GEARBEAT</Text>
        <Text style={styles.subtext}>Initializing Premium Experience</Text>
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
  },
  text: {
    marginTop: 24,
    color: '#FFD700',
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  subtext: {
    marginTop: 8,
    color: '#666666',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
