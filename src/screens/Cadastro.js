import React, { useState } from 'react';
import { View, TextInput, Button, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseConfig';

export default function CadastroUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Função para escolher imagem
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para registrar usuário
  const registerUser = async (email, password, nome, imageUri) => {
    try {
      await supabase.auth.signOut();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = signUpData.user.id;
      const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const fileType = 'image/jpeg';

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from('fotos-perfil')
        .upload(
          `users/${userId}/${fileName}`,
          {
            uri: `data:${fileType};base64,${base64}`,
            name: fileName,
            type: fileType,
          },
          {
            contentType: fileType,
            upsert: true,
          }
        );
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('fotos-perfil')
        .getPublicUrl(`users/${userId}/${fileName}`);

      const photoURL = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('users')
        .insert({ id: userId, nome, email, photo_url: photoURL });

      if (dbError) throw dbError;

      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  // Função chamada ao clicar em cadastrar
  const handleRegister = () => {
    if (!nome || !email || !password || !imageUri) {
      Alert.alert('Erro', 'Preencha todos os campos e selecione uma imagem.');
      return;
    }
    registerUser(email, password, nome, imageUri);
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Escolher Imagem" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
    alignSelf: 'center',
  },
});
