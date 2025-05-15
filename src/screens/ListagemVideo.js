// Importações necessárias
import { Video } from 'expo-av';
import { supabase } from '../../supabaseConfig';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';

const bucketName = 'videos';

export default function ListarVideos() {
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Função para buscar categorias
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const { data, error } = await supabase.storage.from(bucketName).list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });
            if (error) throw error;

            const categoryList = data.map((item) => item.name);
            setCategories(categoryList);
            console.log('Categorias carregadas:', categoryList);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            Alert.alert('Erro', 'Não foi possível carregar as categorias.');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Função para buscar vídeos de uma categoria
    const fetchVideos = async () => {
        if (!category) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.storage.from(bucketName).list(category + '/', {
                limit: 50,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });
            if (error) throw error;

            const videoList = data.map((file) => ({
                name: file.name,
                url: supabase.storage.from(bucketName).getPublicUrl(category + '/' + file.name).data.publicUrl,
            }));
            setVideos(videoList);
            console.log('Vídeos carregados:', videoList);
        } catch (error) {
            console.error('Erro ao carregar vídeos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os vídeos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (category) {
            fetchVideos();
        }
    }, [category]);

    return (
        <View style={styles.container}>
            {loadingCategories ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value)}
                    style={styles.picker}
                >
                    {categories.map((cat, index) => (
                        <Picker.Item key={index} label={cat} value={cat} />
                    ))}
                </Picker>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                videos.map((video, index) => (
                    <View key={index} style={styles.videoContainer}>
                        <Text style={styles.videoName}>{video.name}</Text>
                        <Video
                            source={{ uri: video.url }}
                            style={styles.video}
                            useNativeControls
                            resizeMode="contain"
                        />
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    picker: {
        height: 50,
        width: 300,
        marginBottom: 20,
    },
    videoContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    videoName: {
        fontSize: 16,
        marginBottom: 5,
    },
    video: {
        width: 300,
        height: 200,
    },
});
