import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  useColorScheme, 
  Dimensions, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const baseurl = '';
const apikey = '';

export default function MenstruationScreen() {
  const colorScheme = useColorScheme();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = baseurl;
  const API_KEY = apikey;

  const sectionHeadingtextColor = '#ee2d60';
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

  const handleChat = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse(''); // Clear previous response
    try {
      const response = await axios.post(
        `${API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo-ca",
          messages: [{
            role: "user",
            content: `As a women's health expert, answer concisely: ${question}`
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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.message);
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request data:', error.request);
        }
      } else {
        console.error('Unexpected Error:', error);
      }
      setResponse('Error connecting to the assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }}
      headerImage={
        <Image 
          source={require('@/assets/images/history2.png')}
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Menstrual Health Assistant 🩸</ThemedText>

        <ThemedView style={styles.chatContainer}>
          <TextInput 
            style={[styles.input, { color: textColor }]}
            placeholder="Ask a menstrual health question..."
            placeholderTextColor={textColor + '88'}
            value={question}
            onChangeText={setQuestion}
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleChat}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Ask</ThemedText>}
          </TouchableOpacity>

          {response ? (
            <ScrollView style={styles.responseContainer}>
              <ThemedText style={styles.response}>{response}</ThemedText>
            </ScrollView>
          ) : null}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  reactLogo: {
    height: 380,
    width: 500,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
    marginLeft: 6,
  },
  chatContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
  },
  input: {
    height: 60,
    borderColor: '#ee2d60',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ee2d60',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  responseContainer: {
    maxHeight: 800,
    padding: 10,
    borderRadius: 10,
    paddingBottom: 16,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
  },
});