import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ENVIRONMENTS = {
  PRODUCTION: 'https://gearbeat.app?app=1',
  PREVIEW: 'https://preview.gearbeat.app?app=1',
  LOCAL: 'http://10.0.2.2:3000?app=1', // Android emulator localhost alias
};

interface EnvSwitcherProps {
  currentEnv: string;
  onEnvChange: (url: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function EnvironmentSwitcher({ currentEnv, onEnvChange, onClose, visible }: EnvSwitcherProps) {
  const handleSelect = async (url: string) => {
    await AsyncStorage.setItem('gearbeat_env', url);
    onEnvChange(url);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Developer Menu</Text>
          <Text style={styles.subtitle}>Select Environment</Text>
          
          {Object.entries(ENVIRONMENTS).map(([key, url]) => {
            const isActive = currentEnv === url;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.button, isActive && styles.buttonActive]}
                onPress={() => handleSelect(url)}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
                  {key}
                </Text>
                <Text style={[styles.urlText, isActive && styles.urlTextActive]}>
                  {url}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 22, 0.9)', // Deep premium overlay
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#0F1621', // Matches web's luxury card background
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)', // Premium gold border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: '#D4AF37', // Brand gold
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#8A99AD', // Muted slate gray
    fontSize: 11,
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#151C29', // Card hover deep dark slate
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  buttonActive: {
    backgroundColor: '#D4AF37', // Brand gold active state
    borderColor: '#D4AF37',
  },
  buttonText: {
    color: '#F8F9FA', // Cream text
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  buttonTextActive: {
    color: '#0B0F16', // Dark text on active gold button
  },
  urlText: {
    color: '#64748B', // Darker text muted
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'System',
  },
  urlTextActive: {
    color: 'rgba(11, 15, 22, 0.8)', // Clear contrast url
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#D4AF37', // Brand gold link
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
