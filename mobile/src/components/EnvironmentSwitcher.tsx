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
          {Object.entries(ENVIRONMENTS).map(([key, url]) => (
            <TouchableOpacity
              key={key}
              style={[styles.button, currentEnv === url && styles.buttonActive]}
              onPress={() => handleSelect(url)}
            >
              <Text style={[styles.buttonText, currentEnv === url && styles.buttonTextActive]}>
                {key}
              </Text>
              <Text style={styles.urlText}>{url}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    marginBottom: 10,
  },
  buttonActive: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: '#000000',
  },
  urlText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFD700',
    fontSize: 16,
  },
});
