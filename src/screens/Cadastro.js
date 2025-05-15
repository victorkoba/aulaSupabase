// Miguel Francisco da Silva Sales Victor Luiz Koba Batista
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabaseConfig';

export default function CadastroUsuario({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState(null);

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
        .insert({ id_user: userId, nome_user: nome, email_user: email, photoUrl_user: photoURL });

      if (dbError) throw dbError;

      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
      navigation.navigate('Login'); // redirecionar se desejar
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleRegister = () => {
    if (!nome || !email || !password || !imageUri) {
      Alert.alert('Erro', 'Preencha todos os campos e selecione uma imagem.');
      return;
    }
    registerUser(email, password, nome, imageUri);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Selecionar Foto</Text>
      </TouchableOpacity>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRedirect}>
        <Text style={styles.loginRedirectText}>
          Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 15,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  loginRedirect: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginRedirectText: {
    color: '#555',
    fontSize: 15,
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
