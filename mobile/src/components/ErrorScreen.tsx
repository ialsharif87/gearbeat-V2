import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorScreenProps {
  onRetry: () => void;
  error?: string;
}

export function ErrorScreen({ onRetry, error }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={[styles.signalBar, { height: 10 }]} />
        <View style={[styles.signalBar, { height: 20 }]} />
        <View style={[styles.signalBar, { height: 30, backgroundColor: '#333' }]} />
        <View style={styles.crossLine} />
      </View>
      
      <Text style={styles.title}>Offline Mode</Text>
      <Text style={styles.message}>
        {error || 'Unable to sync with GearBeat servers. Please check your network and try again.'}
      </Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 40,
    height: 40,
  },
  signalBar: {
    width: 6,
    backgroundColor: '#FFD700',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  crossLine: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: '#ff4444',
    transform: [{ rotate: '-45deg' }],
    bottom: 15,
  },
  title: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    color: '#888888',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
