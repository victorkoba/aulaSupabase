// Importações necessárias
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../supabaseConfig';
import { useState } from 'react';
import { View, TextInput, Button, Image, Alert, StyleSheet } from 'react-native';

export default function CadastroUsuario() {
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
    const registerUser = async () => {
        if (email && password && nome && imageUri) {
            try {
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

                Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
            } catch (error) {
                Alert.alert('Erro', error.message);
            }
        } else {
            Alert.alert('Erro', 'Preencha todos os campos.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={styles.input} />
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            <Button title="Escolher Imagem" onPress={pickImage} />
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
            <Button title="Cadastrar" onPress={registerUser} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginVertical: 10,
    },
});
