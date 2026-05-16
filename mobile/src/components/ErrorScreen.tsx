import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ErrorScreenProps {
  onRetry: () => void;
  error?: string;
}

export function ErrorScreen({ onRetry, error }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../../assets/logo-mark.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.warningDot} />
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
    backgroundColor: '#0B0F16', // Core brand luxurious deep slate background
    justifyContent: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 50,
    padding: 24,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    backgroundColor: 'rgba(212, 175, 55, 0.02)',
    position: 'relative',
  },
  logoImage: {
    width: 80,
    height: 80,
    opacity: 0.65,
  },
  warningDot: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    borderWidth: 3,
    borderColor: '#0B0F16',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: '#F8F9FA', // Cream color
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 6,
    textAlign: 'center',
  },
  message: {
    color: '#8A99AD', // Muted slate gray
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 50,
    maxWidth: 300,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#D4AF37', // True metallic gold
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#0B0F16', // Core dark contrast color
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  secondaryButton: {
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)', // Subtle gold border
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  secondaryButtonText: {
    color: '#D4AF37', // Gold text
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
    color: '#3A4659', // Elegant dark copper tone
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
