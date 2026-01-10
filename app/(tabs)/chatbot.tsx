import React from 'react';
import { StyleSheet, View, Image, useColorScheme, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useChatbot } from '@/hooks/useChatbot'; // Expo automatically resolves .web.ts or .native.ts

// Optimization: Move static data outside component to prevent re-allocation on every render
const suggestedQuestions = [
  'Explain the menstrual cycle',
  'How to relieve cramps?',
  'Signs of ovulation',
  'What is PMS?'
];

export default function MenstruationScreen() {
  const {
    question,
    setQuestion,
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

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }} headerImage={<Image source={require('@/assets/images/history2.png')} style={styles.reactLogo} resizeMode="contain"/>}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MenstruAI 🩸 {Platform.OS === 'web' ? '(Web Lite)' : '(Local)'}</ThemedText>

        {!isModelDownloaded ? (
          <View style={styles.setupContainer}>
            <ThemedText style={styles.setupText}>
              To use the offline AI assistant, you need to download the model (~800MB). This only needs to be done once.
            </ThemedText>
            {isDownloading ? (
              <View>
                <ActivityIndicator size="large" color="#E63946" />
                <ThemedText style={styles.progressText}>
                  Downloading... {Math.round(downloadProgress * 100)}%
                </ThemedText>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={downloadModel}>
                <ThemedText style={styles.buttonText}>Download Model</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : !isReady ? (
           <View style={styles.setupContainer}>
            <ThemedText style={styles.setupText}>
              Model downloaded. Load it to start chatting.
            </ThemedText>
             {isInitializing ? (
               <ActivityIndicator size="large" color="#E63946" />
             ) : (
              <TouchableOpacity style={styles.button} onPress={initializeLlama}>
                <ThemedText style={styles.buttonText}>Load AI</ThemedText>
              </TouchableOpacity>
             )}
           </View>
        ) : (
          <>
            <ScrollView
              style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}
              accessibilityLiveRegion="polite"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={textColor} />
                  <ThemedText style={styles.loadingText}>Generating response...</ThemedText>
                </View>
              ) : response ? (
                <ThemedText style={styles.response}>{response}</ThemedText>
              ) : (
                <View>
                  <ThemedText style={styles.placeholder}>AI assistant ready. Ask me anything!</ThemedText>
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
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Ask a menstrual health question..."
                placeholderTextColor={placeholderTextColor + '90'}
                value={question}
                onChangeText={setQuestion}
                editable={!isLoading}
                accessibilityLabel="Ask a menstrual health question"
                returnKeyType="send"
                onSubmitEditing={() => handleChat()}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleChat()}
                disabled={isLoading}
                accessibilityLabel="Send question to AI assistant"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
              >
                {isLoading ? <ActivityIndicator color="#F1FAEE" /> : <ThemedText style={styles.buttonText}>Ask 🔍</ThemedText>}
              </TouchableOpacity>
            </View>
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
  inputContainer: {
    marginTop: 10,
  },
  input: {
    height: 60,
    borderColor: '#E63946',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
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
  placeholder: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
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
});
