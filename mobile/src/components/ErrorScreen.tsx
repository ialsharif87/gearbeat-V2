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
            <View style={[styles.signalBar, { height: 12, opacity: 0.3 }]} />
            <View style={[styles.signalBar, { height: 24, opacity: 0.6 }]} />
            <View style={[styles.signalBar, { height: 36, opacity: 0.1 }]} />
            <View style={styles.warningDot} />
          </View>
        </View>
        
        <Text style={styles.title}>System Offline</Text>
        <Text style={styles.message}>
          {error || 'The GearBeat premium mirror is currently unable to reach the core network. Please verify your connection.'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Establish Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Diagnostic Report</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerNote}>ACTIVE PILOT PHASE V1.0.4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 60,
    padding: 30,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    backgroundColor: 'rgba(255, 215, 0, 0.02)',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    width: 60,
    justifyContent: 'center',
  },
  signalBar: {
    width: 6,
    backgroundColor: '#FFD700',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  warningDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff4444',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 6,
  },
  message: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 60,
    maxWidth: 300,
    letterSpacing: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  secondaryButton: {
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#444444',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    left: 40,
    alignItems: 'center',
  },
  footerNote: {
    color: '#222222',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
