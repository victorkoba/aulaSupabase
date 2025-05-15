import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseConfig';

export default function UploadImagem() {
  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para trocar a foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const selectedUri = result.assets[0].uri;
        await uploadImage(selectedUri);
      } else {
        Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const timestamp = new Date().getTime();
      const fileExt = uri.split('.').pop().toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!validExtensions.includes(fileExt)) {
        Alert.alert('Erro', 'Formato de arquivo não suportado.');
        return;
      }

      const filename = `${authData.user.id}/${timestamp}.${fileExt}`;
      const filePath = `galeria/${filename}`;
      
      // Lê o arquivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Converte para buffer
      const fileBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

      // Faz upload no Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(filePath);

      const finalUrl = `${urlData.publicUrl}?t=${timestamp}`;
      Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
      console.log('URL pública da imagem:', finalUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', error.message || 'Falha ao enviar imagem.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Selecionar Imagem" onPress={selectImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 20,
  },
});
