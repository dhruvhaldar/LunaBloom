import React, { useState } from 'react';
import { StyleSheet, View, Image, useColorScheme, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { AI_MODELS, DEFAULT_MODEL_ID, AIModel } from '@/constants/AIModels';
import { generateChatResponse } from '@/services/aiService';

const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_API_KEY;
const huggingfaceKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
const baseurl = process.env.EXPO_PUBLIC_API_URL;

export default function MenstruationScreen() {
  
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isModelModalVisible, setIsModelModalVisible] = useState(false);

  // Color Scheme
  const colorScheme = useColorScheme();
  const responseBackgroundColor = colorScheme === 'dark' ? '#402b62' : '#f4e6ff';
  const textColor = colorScheme === 'dark' ? '#f4e6ff' : '#402c63';
  const placeholderTextColor = colorScheme === 'dark' ? '#f4e6ff' : '#402c63';
  const modalBackgroundColor = colorScheme === 'dark' ? '#2e1f47' : '#ffffff';

  const selectedModel = AI_MODELS.find(m => m.id === selectedModelId) || AI_MODELS[0];

  const handleChat = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse(''); // Clear previous response

    try {
      const messages = [{
        role: "user" as const,
        content: `As a women's health expert, answer concisely based on facts, don't make assumptions: ${question}`
      }];

      // Select the correct key based on provider
      let apiKey = '';
      if (selectedModel.provider === 'OpenAI') {
        apiKey = openaiKey || '';
      } else if (selectedModel.provider === 'Hugging Face') {
        apiKey = huggingfaceKey || '';
      }

      // Check if key is available
      if (!apiKey && !selectedModel.isFree) {
         // Note: Some "free" models on HF still require a token for higher rate limits or access.
         // But purely free/public ones might not strictly need it, though usually recommended.
         // For OpenAI it's mandatory.
         if (selectedModel.provider === 'OpenAI') {
             setResponse('Error: OpenAI API Key is missing. Please configure EXPO_PUBLIC_OPENAI_API_KEY.');
             setIsLoading(false);
             return;
         }
      }

      const answer = await generateChatResponse(selectedModel, messages, apiKey, baseurl);
      setResponse(answer || "Couldn't generate a response");
    } catch (error) {
      console.error('API Error:', error);
      setResponse('Error connecting to the assistant. Please try again or switch models.');
    } finally {
      setIsLoading(false);
    }
  };  

  const renderModelItem = ({ item }: { item: AIModel }) => (
    <Pressable
      style={[
        styles.modelItem,
        selectedModelId === item.id && styles.selectedModelItem,
        { borderBottomColor: textColor + '20' }
      ]}
      onPress={() => {
        setSelectedModelId(item.id);
        setIsModelModalVisible(false);
      }}
    >
      <ThemedText style={styles.modelName}>{item.name}</ThemedText>
      <ThemedText style={styles.modelProvider}>{item.provider} {item.isFree ? '(Free)' : ''}</ThemedText>
    </Pressable>
  );

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#f4e6ff', dark: '#402c63' }} 
    
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
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>MenstruAi 🩸</ThemedText>
        
        {/* Model Selector */}
        <TouchableOpacity
          style={[styles.modelSelector, { borderColor: textColor + '40' }]}
          onPress={() => setIsModelModalVisible(true)}
        >
          <ThemedText style={styles.modelSelectorText}>Model: {selectedModel.name}</ThemedText>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: '#c41e3d' }]}
            placeholder="Ask a menstrual health question..."
            placeholderTextColor={placeholderTextColor + '90'}
            value={question}
            onChangeText={setQuestion}
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.button} onPress={handleChat} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#F4E6FF" /> : <ThemedText style={styles.buttonText}>Ask 🔍</ThemedText>}
          </TouchableOpacity>
        </View>

        <ScrollView style={[styles.responseContainer, { backgroundColor: responseBackgroundColor }]}>
          {response ? (<ThemedText style={styles.response}>{response}</ThemedText>) : (
            <ThemedText style={styles.placeholder}>AI assistant will respond here...</ThemedText>
          )}
        </ScrollView>
        
        <ThemedText style={styles.placeholder}>Note: This is not a substitute for professional medical advice.</ThemedText>

        {/* Model Selection Modal */}
        <Modal
          visible={isModelModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Select AI Model</ThemedText>
              <FlatList
                data={AI_MODELS}
                renderItem={renderModelItem}
                keyExtractor={item => item.id}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModelModalVisible(false)}
              >
                <ThemedText style={styles.closeButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: -30,
    marginBottom: 10,
    textAlign: 'center',
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
    opacity: 0.7,
  },
  modelSelector: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  modelSelectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modelItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  selectedModelItem: {
    backgroundColor: 'rgba(196, 30, 61, 0.1)',
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelProvider: {
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#c41e3d',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#F4E6FF',
    fontWeight: 'bold',
  },
});
