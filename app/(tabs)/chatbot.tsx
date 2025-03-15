import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  useColorScheme, 
  Dimensions, 
  TextInput, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const API_URL = 'https://api.chatanywhere.tech/v1/chat/completions';

export default function MenstruationScreen() {
  const colorScheme = useColorScheme();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sectionHeadingtextColor = '#ee2d60';
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

  const handleChat = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Answer concisely about women's menstrual health: ${question}`
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
      setResponse(answer || "Sorry, I couldn't understand that question.");
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('Sorry, there was an error processing your question.');
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
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Processing...' : 'Ask'}
            </ThemedText>
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
    padding: 16,
    paddingBottom: 90,
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
    height: 40,
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
    maxHeight: 200,
    padding: 10,
    borderRadius: 10,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
  },
});