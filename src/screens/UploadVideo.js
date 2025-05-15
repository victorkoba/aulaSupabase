import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../supabaseConfig';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';

export default function UploadVideo() {
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState(null);
  const [isUploading, setUploading] = useState(false);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const selectedVideo = {
          uri: result.uri,
          name: result.name || 'video.mp4',
          type: 'video/mp4',
        };
        setVideo(selectedVideo);
      } else {
        Alert.alert('Erro', 'Nenhum vídeo selecionado.');
      }
    } catch (error) {
      console.error('Erro ao selecionar vídeo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o vídeo.');
    }
  };

  const uploadVideo = async () => {
    if (!video || !category) {
      Alert.alert('Erro', 'Por favor, selecione um vídeo e uma categoria.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = new Date().getTime();
      const filePath = `${category}/${timestamp}-${video.name}`;

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }

      const response = await fetch(video.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, blob, {
          contentType: video.type,
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(filePath);

      Alert.alert('Sucesso', 'Vídeo enviado com sucesso!');
      console.log('URL pública do vídeo:', urlData.publicUrl);

      setVideo(null);
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', error.message || 'Falha ao enviar o vídeo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload de Vídeo</Text>

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Text style={styles.buttonText}>Selecionar Vídeo</Text>
      </TouchableOpacity>

      {video && <Text style={styles.videoName}>🎬 {video.name}</Text>}

      <Text style={styles.label}>Categoria:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma categoria" value={null} />
          <Picker.Item label="Matemática" value="matematica" />
          <Picker.Item label="Física" value="fisica" />
          <Picker.Item label="Química" value="quimica" />
        </Picker>
      </View>

      {isUploading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28a745' }]}
          onPress={uploadVideo}
        >
          <Text style={styles.buttonText}>Enviar Vídeo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 25,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#444',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 25,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
