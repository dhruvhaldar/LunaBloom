import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Image, useColorScheme, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import axios from 'axios';

const baseurl = process.env.EXPO_PUBLIC_API_URL;
const apikey = process.env.EXPO_PUBLIC_API_KEY;

// ⚡ Bolt: Move static data outside component to avoid recreation on every render
const suggestedQuestions = [
  'Explain the menstrual cycle',
  'How to relieve cramps?',
  'Signs of ovulation',
  'What is PMS?'
];

export default function MenstruationScreen() {
  
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = baseurl;
  const API_KEY = apikey;

  // Color Scheme
  const colorScheme = useColorScheme();
  const responseBackgroundColor = colorScheme === 'dark' ? '#457B9D' : '#A8DADC';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const placeholderTextColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  // ⚡ Bolt: Extract API logic to stable callback
  const submitQuestion = useCallback(async (textToAsk: string) => {
    setIsLoading(true);
    setResponse(''); // Clear previous response
    try {
      const response = await axios.post(
        `${API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo", // Select model
          messages: [{
            role: "user",
            content: `As a women's health expert, answer concisely based on facts, don't make assumptions: ${textToAsk}`
          }],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.choices[0]?.message?.content?.trim();
      setResponse(answer || "Couldn't generate a response");
    } catch (error: any) {
      // Sentinel: Prevent logging of full error object which may contain secrets in headers
      console.error('API Error:', error.message);
      setResponse('Error connecting to the assistant');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, API_KEY]);

  const handleChat = async () => {
    if (!question.trim()) return;
    submitQuestion(question);
  };

  // ⚡ Bolt: Stable handler for chips
  const onSuggestionPress = useCallback((q: string) => {
    setQuestion(q);
    submitQuestion(q);
  }, [submitQuestion]);

  // ⚡ Bolt: Memoize suggestions list to prevent re-renders while typing
  const suggestionsList = useMemo(() => suggestedQuestions.map((q, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.suggestionChip, { borderColor: textColor }]}
      onPress={() => onSuggestionPress(q)}
      accessibilityLabel={`Ask: ${q}`}
      accessibilityRole="button"
    >
      <ThemedText style={styles.suggestionText}>{q}</ThemedText>
    </TouchableOpacity>
  )), [textColor, onSuggestionPress]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }} headerImage={<Image source={require('@/assets/images/history2.png')} style={styles.reactLogo} resizeMode="contain"/>}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MenstruAI 🩸</ThemedText>

        <ScrollView
          style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}
          accessibilityLiveRegion="polite"
        >
          {response ? (<ThemedText style={styles.response}>{response}</ThemedText>) : (
            <View>
              <ThemedText style={styles.placeholder}>AI assistant will respond here...</ThemedText>
              <View style={styles.suggestionsContainer}>
                {suggestionsList}
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
            onSubmitEditing={handleChat}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleChat}
            disabled={isLoading}
            accessibilityLabel="Send question to AI assistant"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? <ActivityIndicator color="#F1FAEE" /> : <ThemedText style={styles.buttonText}>Ask 🔍</ThemedText>}
          </TouchableOpacity>
        </View>
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
});