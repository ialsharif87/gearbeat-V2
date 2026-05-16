import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, BackHandler, RefreshControl, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from './src/components/LoadingScreen';
import { ErrorScreen } from './src/components/ErrorScreen';
import { EnvironmentSwitcher, ENVIRONMENTS } from './src/components/EnvironmentSwitcher';
import { isExternalUrl, handleExternalUrl } from './src/utils/urlHandlers';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(ENVIRONMENTS.PRODUCTION);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [envSwitcherVisible, setEnvSwitcherVisible] = useState(false);
  const [devTapCount, setDevTapCount] = useState(0);

  // Load saved environment on startup
  useEffect(() => {
    const loadEnv = async () => {
      try {
        const saved = await AsyncStorage.getItem('gearbeat_env');
        if (saved) setCurrentUrl(saved);
      } catch (e) {
        console.error('Failed to load environment', e);
      }
    };
    loadEnv();
  }, []);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false; // Exit app if cannot go back
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  const onRefresh = () => {
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    if (!navState.loading) {
      setIsLoading(false);
    }
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    if (isExternalUrl(request.url, currentUrl)) {
      handleExternalUrl(request.url);
      return false; // Stop WebView from loading external URL
    }
    return true; // Let WebView load internal URL
  };

  const handleDevTap = () => {
    setDevTapCount((prev) => prev + 1);
    if (devTapCount >= 4) {
      setEnvSwitcherVisible(true);
      setDevTapCount(0);
    }
    // Reset tap count after 2 seconds of inactivity
    setTimeout(() => setDevTapCount(0), 2000);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0B0F16" />
        
        {hasError ? (
          <ErrorScreen 
            onRetry={() => {
              setHasError(false);
              setIsLoading(true);
              webViewRef.current?.reload();
            }} 
          />
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#D4AF37" 
                colors={['#D4AF37']} 
              />
            }
          >
            <WebView
              ref={webViewRef}
              source={{ uri: currentUrl }}
              style={styles.webview}
              onNavigationStateChange={handleNavigationStateChange}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onError={() => {
                setHasError(true);
                setIsLoading(false);
              }}
              startInLoadingState={true}
              renderLoading={() => <View />} // Disable default loading, custom loading is absolute above
              allowsBackForwardNavigationGestures
              bounces={false}
            />
          </ScrollView>
        )}

        {isLoading && !hasError && (
          <View style={StyleSheet.absoluteFill}>
            <LoadingScreen />
          </View>
        )}

        {/* Hidden tap area for Environment Switcher (top right corner, 5 taps) */}
        <TouchableOpacity 
          style={styles.devMenuTrigger} 
          activeOpacity={1}
          onPress={handleDevTap}
        />

        <EnvironmentSwitcher 
          visible={envSwitcherVisible}
          currentEnv={currentUrl}
          onEnvChange={(url) => {
            setCurrentUrl(url);
            setIsLoading(true);
            setHasError(false);
          }}
          onClose={() => setEnvSwitcherVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F16', // Core brand luxurious background
  },
  scrollContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0B0F16', // Core brand luxurious background
  },
  devMenuTrigger: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
    zIndex: 999,
  }
});
