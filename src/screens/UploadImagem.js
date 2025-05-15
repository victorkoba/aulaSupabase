// Importações necessárias
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabaseConfig';
import { Alert } from 'react-native';

// Função para escolher uma imagem
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

        if (!result.canceled && result.assets[0].uri) {
            const selectedUri = result.assets[0].uri;
            await uploadImage(selectedUri); // Realiza o upload para o Supabase
        } else {
            Alert.alert('Erro', 'Nenhuma imagem selecionada.');
        }
    } catch (error) {
        console.error('Erro ao selecionar imagem:', error);
        Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
};

// Função para realizar o upload da imagem
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
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const fileBuffer = new Uint8Array(Buffer.from(base64, 'base64'));

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
