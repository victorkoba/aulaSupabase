import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabaseConfig';
import { useState } from 'react';
import { Alert } from 'react-native';

// Estados para armazenar dados do usuário
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [nome, setNome] = useState("");
const [imageUri, setImageUri] = useState(null);

// Função para escolher a imagem de perfil
const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
    });

    if (!result.canceled) {
        setImageUri(result.assets[0].uri);
    }
};

// Função para registrar o usuário
const registerUser = async (email, password, nome, imageUri) => {
    try {
        await supabase.auth.signOut(); // Desloga usuário atual

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (signUpError) throw signUpError;

        const userId = signUpData.user.id;
        const fileName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
        const fileType = 'image/jpeg';

        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fotos-perfil')
            .upload(`users/${userId}/${fileName}`, base64, {
                upsert: true,
                contentType: fileType,
            });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('fotos-perfil')
            .getPublicUrl(`users/${userId}/${fileName}`);
        const photoURL = publicUrlData.publicUrl;

        const { error: dbError } = await supabase
            .from('users')
            .insert({
                id_user: userId,
                nome_user: nome,
                email_user: email,
                photoUrl_user: photoURL
            });

        if (dbError) throw dbError;

        console.log('Usuário registrado com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar usuário:', error.message);
        Alert.alert('Erro', error.message);
    }
};

// Função para lidar com o cadastro
const handleRegister = async () => {
    if (email && password && nome && imageUri) {
        await registerUser(email, password, nome, imageUri);
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
    } else {
        Alert.alert('Erro', 'Preencha todos os campos.');
    }
};