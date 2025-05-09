import React, { useState } from 'react';
import { StyleSheet, View, Image, useColorScheme, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import axios from 'axios';

const baseurl = process.env.EXPO_PUBLIC_API_URL;
const apikey = process.env.EXPO_PUBLIC_API_KEY;

console.log('Base URL:',baseurl)
console.log('API Key:',apikey)

export default function MenstruationScreen() {
  
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = baseurl;
  const API_KEY = apikey;

  // Color Scheme
  const colorScheme = useColorScheme();
  const responseBackgroundColor = colorScheme === 'dark' ? '#402b62' : '#f4e6ff';
  const textColor = colorScheme === 'dark' ? '#f4e6ff' : '#402c63';
  const placeholderTextColor = colorScheme === 'dark' ? '#f4e6ff' : '#402c63';

  const handleChat = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse(''); // Clear previous response
    try {
      const response = await axios.post(
        `${API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo", // Select model
          messages: [{
            role: "user",
            content: `As a women's health expert, answer concisely based on facts, don't make assumptions: ${question}`
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

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }} 
    
    headerImage={
      <Image 
      source={
        colorScheme === 'dark'
          ? require('@/assets/images/icons/dark_history3.png')
          : require('@/assets/images/icons/history3.png')
      }
      style={styles.reactLogo}
      resizeMode="contain"
      />
      }
    >
      
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>MenstruAI 🩸</ThemedText>
        
        <View style={styles.inputContainer}>
          <TextInput style={[styles.input, { color: textColor }]} placeholder="Ask a menstrual health question..." placeholderTextColor={placeholderTextColor + '90'} value={question} onChangeText={setQuestion} editable={!isLoading}/>
          <TouchableOpacity style={styles.button} onPress={handleChat} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#c41e3d" /> : <ThemedText style={styles.buttonText}>Ask 🔍</ThemedText>}
          </TouchableOpacity>
        </View>

        <ScrollView style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}>
          {response ? (<ThemedText style={styles.response}>{response}</ThemedText>) : (
            <ThemedText style={styles.placeholder}>AI assistant will respond here...</ThemedText>
          )}
        </ScrollView>
        
        <ThemedText style={styles.placeholder}>Note: This is not a substitute for professional medical advice.</ThemedText>
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
    maxHeight: 600, // Set a max height for the response area
    padding: 15,
    borderRadius: 25,
    marginBottom: 16,
  },
  inputContainer: {
    marginTop: 10,
  },
  input: {
    height: 60,
    borderColor: '#c41e3d',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#c41e3d',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#F4E6FF',
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