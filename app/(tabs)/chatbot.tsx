import React, { useMemo, useCallback, useRef } from 'react';
import { StyleSheet, View, Image, useColorScheme, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Share, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useChatbot } from '@/hooks/useChatbot'; // Expo automatically resolves .web.ts or .native.ts
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/ui/EmptyState';

// Optimization: Move static data outside component to prevent re-allocation on every render
const suggestedQuestions = [
  'Explain the menstrual cycle',
  'How to relieve cramps?',
  'Signs of ovulation',
  'What is PMS?'
];

export default function MenstruationScreen() {
  const {
    response,
    isLoading,
    isModelDownloaded,
    isDownloading,
    downloadProgress,
    downloadModel,
    isInitializing,
    initializeLlama,
    isReady,
    handleChat
  } = useChatbot();

  // Color Scheme
  const colorScheme = useColorScheme();
  const responseBackgroundColor = colorScheme === 'dark' ? '#457B9D' : '#A8DADC';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const placeholderTextColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  // Optimization: Memoize suggestions list to prevent re-rendering chips on every keystroke
  // handleChat is now stable from the hook, so this will only re-render if theme colors change
  const suggestionsList = useMemo(() => (
    <View style={styles.suggestionsContainer}>
      {suggestedQuestions.map((q, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.suggestionChip, { borderColor: textColor }]}
          onPress={() => handleChat(q)}
          accessibilityLabel={`Ask: ${q}`}
          accessibilityRole="button"
        >
          <ThemedText style={styles.suggestionText}>{q}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  ), [textColor, handleChat]);

  const handleShare = useCallback(async () => {
    if (!response) return;
    try {
      await Share.share({
        message: response,
      });
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert('Sharing is not supported on this browser.');
      } else {
        Alert.alert('Error', 'Could not share response.');
      }
      console.error(error.message);
    }
  }, [response]);

  // Optimization: Memoize header props to prevent re-rendering ParallaxScrollView header
  const headerBackgroundColor = useMemo(() => ({
    light: '#ffdde2',
    dark: '#151718'
  }), []);

  const headerImage = useMemo(() => (
    <Image
      source={require('@/assets/images/history2.png')}
      style={styles.reactLogo}
      resizeMode="contain"
    />
  ), []);

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
      headerImage={headerImage}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MenstruAI 🩸 {Platform.OS === 'web' ? '(Web Lite)' : '(Local)'}</ThemedText>

        {!isModelDownloaded ? (
          <View style={styles.setupContainer}>
            <ThemedText style={styles.setupText}>
              To use the offline AI assistant, you need to download the model (~800MB). This only needs to be done once.
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, isDownloading && styles.buttonDisabled]}
              onPress={downloadModel}
              disabled={isDownloading}
              accessibilityRole="button"
              accessibilityLabel={isDownloading ? `Downloading AI Model, ${Math.round(downloadProgress * 100)}% complete` : "Download AI Model"}
              accessibilityState={{ disabled: isDownloading, busy: isDownloading }}
            >
              {isDownloading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>
                    Downloading... {Math.round(downloadProgress * 100)}%
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.buttonText}>Download Model</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        ) : !isReady ? (
           <View style={styles.setupContainer}>
            <ThemedText style={styles.setupText}>
              Model downloaded. Load it to start chatting.
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, isInitializing && styles.buttonDisabled]}
              onPress={initializeLlama}
              disabled={isInitializing}
              accessibilityRole="button"
              accessibilityLabel={isInitializing ? "Loading AI Model" : "Load AI Model"}
              accessibilityState={{ disabled: isInitializing, busy: isInitializing }}
            >
              {isInitializing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <ThemedText style={styles.buttonText}>Loading...</ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.buttonText}>Load AI</ThemedText>
              )}
            </TouchableOpacity>
           </View>
        ) : (
          <>
            <ScrollView
              ref={scrollViewRef}
              style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}
              accessibilityLiveRegion="polite"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={textColor} />
                  <ThemedText style={styles.loadingText}>Generating response...</ThemedText>
                </View>
              ) : response ? (
                <View>
                  <ThemedText style={styles.response}>{response}</ThemedText>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    accessibilityLabel="Share response"
                    accessibilityRole="button"
                  >
                    <IconSymbol name="share" size={20} color={textColor} />
                    <ThemedText style={[styles.shareButtonText, { color: textColor }]}>Share</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <EmptyState
                    title="MenstruAI Assistant"
                    message="I'm here to help with your menstrual health questions."
                    icon="chat.fill"
                    style={{ marginTop: 20 }}
                  />
                  {suggestionsList}
                </View>
              )}
            </ScrollView>

            <ChatInput
              onSubmit={handleChat}
              isLoading={isLoading}
              textColor={textColor}
              placeholderTextColor={placeholderTextColor + '90'}
            />
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  setupContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    borderRadius: 10,
    gap: 15,
  },
  setupText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 5,
  },
  suggestionText: {
    fontSize: 14,
  },
  reactLogo: {
    height: 380,
    width: 500,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
    marginLeft: 6,
  },
  responseContainer: {
    flex: 1,
    maxHeight: 400, // Set a max height for the response area
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E63946',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
    padding: 8,
  },
  shareButtonText: {
    fontWeight: '600',
  },
});
