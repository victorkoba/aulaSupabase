// Importações necessárias
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../supabaseConfig';
import { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';

export default function LoginUsuario() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Função para fazer login
    const loginUser = async () => {
        if (email && password) {
            try {
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (loginError) throw loginError;

                Alert.alert('Sucesso', 'Login realizado com sucesso!');
            } catch (error) {
                Alert.alert('Erro', error.message);
            }
        } else {
            Alert.alert('Erro', 'Preencha todos os campos.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            <Button title="Login" onPress={loginUser} />
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
});
