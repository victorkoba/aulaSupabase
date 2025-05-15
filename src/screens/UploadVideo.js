import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../supabaseConfig';
import React, { useState } from 'react';
import { Alert } from 'react-native';

// Estado para armazenar vídeo e categoria
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

        if (result.assets && result.assets.length > 0) {
            const selectedVideo = {
                uri: result.assets[0].uri,
                name: 'video.mp4',
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

// Função para realizar o upload do vídeo
const uploadVideo = async () => {
    if (!video || !category) {
        Alert.alert('Erro', 'Por favor, selecione um vídeo e uma categoria.');
        return;
    }

    setUploading(true);
    try {
        const timestamp = new Date().getTime();
        const filePath = `Category/${timestamp}-${video.name}`;

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
            throw new Error('Usuário não autenticado.');
        }

        const { error: uploadError } = await supabase.storage
            .from('videos')
            .upload(filePath, video.uri, {
                contentType: video.type,
                upsert: true,
            });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        Alert.alert('Sucesso', 'Vídeo enviado com sucesso!');
        console.log('URL pública do vídeo:', urlData.publicUrl);
    } catch (error) {
        console.error('Erro no upload:', error);
        Alert.alert('Erro', error.message || 'Falha ao enviar o vídeo.');
    } finally {
        setUploading(false);
    }
};

export default pickVideo;