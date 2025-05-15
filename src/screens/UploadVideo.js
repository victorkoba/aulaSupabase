import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../supabaseConfig';
import { View, Button, Alert, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function UploadVideo() {
  const [video, setVideo] = useState(null);
  const [category, setCategory] = useState('matematica');
  const [isUploading, setUploading] = useState(false);

  // Função para selecionar vídeo
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        // Ajustando dados do vídeo selecionado
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

  // Função para fazer upload do vídeo
  const uploadVideo = async () => {
    if (!video || !category) {
      Alert.alert('Erro', 'Por favor, selecione um vídeo e uma categoria.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = new Date().getTime();
      const filePath = `${category}/${timestamp}-${video.name}`;

      // Pega a sessão atual do usuário (autenticado)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error('Usuário não autenticado.');
      }

      // Converte URI em blob para upload
      const response = await fetch(video.uri);
      const blob = await response.blob();

      // Faz o upload para o Supabase Storage
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

      // Limpa estado após upload
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
      <Button title="Selecionar Vídeo" onPress={pickVideo} />
      {video && <Text style={styles.videoName}>Vídeo selecionado: {video.name}</Text>}

      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
      >
        <Picker.Item label="Matemática" value="matematica" />
        <Picker.Item label="Física" value="fisica" />
        <Picker.Item label="Química" value="quimica" />
        {/* Adicione mais categorias aqui */}
      </Picker>

      {isUploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Enviar Vídeo" onPress={uploadVideo} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  picker: {
    marginVertical: 20,
  },
  videoName: {
    marginVertical: 10,
    fontWeight: 'bold',
  },
});
