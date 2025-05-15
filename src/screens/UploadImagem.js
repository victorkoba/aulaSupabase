import React, { useState } from 'react';
import {
  View,
  Button,
  Alert,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../supabaseConfig';

export default function UploadImagem() {
  const [imageUri, setImageUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const selecionarImagem = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao abrir galeria.');
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    setIsUploading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const timestamp = new Date().getTime();
      const fileExt = imageUri.split('.').pop().toLowerCase();
      const filename = `${authData.user.id}/${timestamp}.${fileExt}`;
      const filePath = `fotos-perfil/${filename}`;

      const file = await fetch(imageUri);
      const fileBlob = await file.blob();

      const { error: uploadError } = await supabase.storage
        .from('fotos-perfil')
        .upload(filePath, fileBlob, {
          contentType: fileBlob.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('fotos-perfil')
        .getPublicUrl(filePath);

      const finalUrl = `${urlData.publicUrl}?t=${timestamp}`;
      Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
      console.log('URL pública da imagem:', finalUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', error.message || 'Falha ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload de Imagem</Text>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.button} onPress={selecionarImagem}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#28a745' }]}
        onPress={uploadImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar Imagem</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#222',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
