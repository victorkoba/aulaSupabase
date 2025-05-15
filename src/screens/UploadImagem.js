import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseConfig';

export default function UploadImagem() {
  const uploadImage = async (uri) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    const timestamp = new Date().getTime();
    const fileExt = uri.split('.').pop().toLowerCase();
    const filename = `${authData.user.id}/${timestamp}.${fileExt}`;
    const filePath = `fotos-perfil/${filename}`;

    // Faz upload passando o arquivo pelo URI
    const file = await fetch(uri);
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
  }
};
}