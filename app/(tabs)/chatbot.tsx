import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, useColorScheme, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system';

const MODEL_URL = 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_FILENAME = 'llama-3.2-1b-instruct-q4_k_m.gguf';
const MODEL_PATH = `${FileSystem.documentDirectory}${MODEL_FILENAME}`;

export default function MenstruationScreen() {
  
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Local Model State
  const [isModelDownloaded, setIsModelDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [llamaContext, setLlamaContext] = useState<LlamaContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Color Scheme
  const colorScheme = useColorScheme();
  const responseBackgroundColor = colorScheme === 'dark' ? '#457B9D' : '#A8DADC';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const placeholderTextColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  useEffect(() => {
    checkModelExists();
  }, []);

  const checkModelExists = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
      if (fileInfo.exists) {
        setIsModelDownloaded(true);
      }
    } catch (error) {
      console.error('Error checking model existence:', error instanceof Error ? error.message : String(error));
    }
  };

  const downloadModel = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      };

      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_URL,
        MODEL_PATH,
        {},
        callback
      );

      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setIsModelDownloaded(true);
        Alert.alert("Success", "Model downloaded successfully!");
      }
    } catch (error) {
      console.error('Error downloading model:', error instanceof Error ? error.message : String(error));
      Alert.alert("Error", "Failed to download the model. Please check your internet connection.");
    } finally {
      setIsDownloading(false);
    }
  };

  const initializeLlama = async () => {
    if (!isModelDownloaded) return;
    setIsInitializing(true);
    try {
      const context = await initLlama({
        model: MODEL_PATH,
        use_mlock: true,
        n_gpu_layers: 0, // Set to 0 for maximum compatibility, adjust if needed
      });
      setLlamaContext(context);
    } catch (error) {
      console.error('Error initializing Llama:', error instanceof Error ? error.message : String(error));
      Alert.alert("Error", "Failed to initialize the AI model.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleChat = async (questionText?: string) => {
    Keyboard.dismiss();
    const textToAsk = typeof questionText === 'string' ? questionText : question;
    if (!textToAsk.trim()) return;
    
    if (typeof questionText === 'string') {
      setQuestion(questionText);
    }

    if (!llamaContext) {
      Alert.alert("AI Not Ready", "Please load the AI model first.");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const systemPrompt = "System: You are a helpful women's health expert assistant. Answer concisely in 3 lines or less. Focus on period-based advice.";
      const prompt = `${systemPrompt}\nUser: ${textToAsk}\nAssistant:`;

      const result = await llamaContext.completion(
        {
          prompt,
          n_predict: 100, // Limit tokens for speed
          stop: ["User:", "System:"],
        },
        (data) => {
          // Real-time streaming callback could go here if we wanted to stream
        }
      );

      setResponse(result.text.trim());
    } catch (error) {
      console.error('Llama Error:', error instanceof Error ? error.message : String(error));
      setResponse('Error generating response.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Explain the menstrual cycle',
    'How to relieve cramps?',
    'Signs of ovulation',
    'What is PMS?'
  ];

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }} headerImage={<Image source={require('@/assets/images/history2.png')} style={styles.reactLogo} resizeMode="contain"/>}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MenstruAI 🩸 (Local)</ThemedText>

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
        ) : !llamaContext ? (
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
                  <ThemedText style={styles.placeholder}>AI assistant ready (Offline). Ask me anything!</ThemedText>
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
