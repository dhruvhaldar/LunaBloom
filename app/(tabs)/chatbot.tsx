import React, { useState } from 'react';
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

const baseurl = ''; // Add your base URL here
const apikey = '';  // Add your API key here

export default function MenstruationScreen() {
  const colorScheme = useColorScheme();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
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
          model: "gpt-3.5-turbo",
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
      console.error('API Error:', error);
      setResponse('Error connecting to the assistant');
    } finally {
      setIsLoading(false);
    }
  };

  // Set background color based on the color scheme
  const responseBackgroundColor = colorScheme === 'dark' ? '#2c2c2c' : '#ffffff'; // Dark mode: dark gray; Light mode: white

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
        <ThemedText type="title" style={styles.title}>AI Menstrual Health Assistant 🩸</ThemedText>

        <ScrollView style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}>
          {response ? (
            <ThemedText style={styles.response}>{response}</ThemedText>
          ) : (
            <ThemedText style={styles.placeholder}>Your assistant will respond here...</ThemedText>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
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
    borderRadius: 10,
    marginBottom: 16,
  },
  inputContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingBottom: 16,
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
    color: '#888', // Placeholder color
    textAlign: 'center', // Center the placeholder text
  },
});