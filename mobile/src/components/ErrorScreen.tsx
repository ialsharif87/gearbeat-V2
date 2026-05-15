import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorScreenProps {
  onRetry: () => void;
  error?: string;
}

export function ErrorScreen({ onRetry, error }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            <View style={[styles.signalBar, { height: 12 }]} />
            <View style={[styles.signalBar, { height: 24 }]} />
            <View style={[styles.signalBar, { height: 36, opacity: 0.2 }]} />
            <View style={styles.warningDot} />
          </View>
        </View>
        
        <Text style={styles.title}>Connection Lost</Text>
        <Text style={styles.message}>
          {error || 'Unable to sync with GearBeat premium servers. Please check your connection and try again.'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Reconnect</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>Limited access available in offline mode</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 48,
    padding: 24,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.03)',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    width: 60,
    justifyContent: 'center',
  },
  signalBar: {
    width: 8,
    backgroundColor: '#FFD700',
    marginHorizontal: 3,
    borderRadius: 4,
  },
  warningDot: {
    position: 'absolute',
    top: -4,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4444',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  message: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 56,
    maxWidth: 280,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerNote: {
    marginTop: 24,
    color: '#333333',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
