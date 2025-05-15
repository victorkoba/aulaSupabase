// Importações necessárias
import { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../../supabaseConfig';
import { Alert } from 'react-native';

export default function ListarImagens() {
    const [imagens, setImagens] = useState([]);
    const [loading, setLoading] = useState(false);

    // Função para buscar imagens
    const fetchImagens = async () => {
        setLoading(true);
        try {
            // Obter o usuário atual
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Erro ao obter usuário:', userError?.message);
                setLoading(false);
                return;
            }

            const userId = user.id;

            // Listar arquivos da pasta 'imagens'
            const { data, error } = await supabase.storage.from('imagens').list('galeria/' + userId + '/', {
                limit: 100,
            });
            if (error) throw error;

            // Obter URLs públicas das imagens
            const urls = await Promise.all(
                data.filter((item) => item.name)
                    .map(async (item) => {
                        const { data: urlData, error: urlError } = await supabase.storage
                            .from('imagens')
                            .getPublicUrl('galeria/' + userId + '/' + item.name);
                        if (urlError) {
                            console.error('Erro ao obter URL:', urlError.message);
                            return null;
                        }
                        return {
                            name: item.name,
                            url: urlData.publicUrl,
                        };
                    })
            );

            setImagens(urls.filter((img) => img !== null));
            console.log('Imagens carregadas:', urls);
        } catch (err) {
            console.error('Erro inesperado:', err);
            Alert.alert('Erro', 'Não foi possível carregar as imagens.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImagens();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                imagens.map((img, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: img.url }} style={styles.image} />
                        <Text style={styles.imageName}>{img.name}</Text>
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
        padding: 10,
    },
    imageContainer: {
        margin: 10,
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
    },
    imageName: {
        marginTop: 5,
        fontSize: 16,
        textAlign: 'center',
    },
});
