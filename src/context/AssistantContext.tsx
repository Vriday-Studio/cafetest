import React, { createContext, useState, useContext } from 'react';
import { ref, set} from 'firebase/database';
import { database } from '../firebase/config';
import { storage } from '../firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
interface AssistantContextType {
  instructionAssistant: string;
  setInstructionAssistant: (instruction: string) => void;
  sendAssistantMessage: () => Promise<string>;
  response: string;
  setResponse: (response: string) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [instructionAssistant, setInstructionAssistant] = useState("apa rekomendasi menu makanan dan minuman di restoran untuk orang yang baru pertama kali datang kesini?");
  const [response, setResponse] = useState("");
  let webhookUrl = 'https://n8n.srv954455.hstgr.cloud/webhook/postchat';

  const updateAIResponse = async (responseText: string) => {
    try {
      const aiResponseRef = ref(database, 'airesponse');
      await set(aiResponseRef, {
        respon: responseText,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating AI response:', error);
    }
  };
  const elevenlabs = new ElevenLabsClient({
    apiKey: "e2fa3e637d2c2eedd0a8f2bc8ad4bb4454fd33953ee5b14814b3508c1b557e16", // Defaults to process.env.ELEVENLABS_API_KEY
});
  const sendAssistantMessage = async () => {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: `user${Math.random().toString(36).substr(2, 9)}`,
          message: instructionAssistant
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const text = await res.text();
      // Store response in Firebase
      await updateAIResponse(text);
      setResponse(text);
     
      // Generate and play audio using ElevenLabs
      try {
        const audio = await elevenlabs.textToSpeech.convert('MF3mGyEYCl7XYWbV9V6O', {
       
       
          text: text,
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
          voiceSettings: {
            stability: 0.4, // Example stability setting
            similarityBoost: 0.75, // Example similarity boost setting
            // The key setting for speed:
            speed: 1.2, // Set the desired speed here (0.7-1.2 range)
          },
        });
        
        // Convert stream to blob and play
        const chunks: Uint8Array[] = [];
        const reader = audio.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const audioBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio(audioUrl);
        
        await audioElement.play();
        
        // Upload audio to Firebase Storage
        const fileName = `assistant_audio.mp3`;
        const audioStorageRef = storageRef(storage, `audio/${fileName}`);
        await uploadBytes(audioStorageRef, audioBlob);
        const downloadUrl = await getDownloadURL(audioStorageRef);
        console.log('Audio uploaded to Firebase Storage:', downloadUrl);

        // Clean up URL after playing
        audioElement.onended = () => URL.revokeObjectURL(audioUrl);
      } catch (audioError) {
        console.error('Error playing or uploading audio:', audioError);
        // Continue without audio if there's an error
      }
      
      return text;
    } catch (error) {
      console.error('Error:', error);
      return 'Failed to get a response';
    }
  };

  return (
    <AssistantContext.Provider value={{ 
      instructionAssistant, 
      setInstructionAssistant,
      sendAssistantMessage,
      response,
      setResponse
    }}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};