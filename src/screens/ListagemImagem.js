// Miguel Francisco da Silva Sales Victor Luiz Koba Batista
import { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../supabaseConfig';

export default function ListarImagens() {
    const [imagens, setImagens] = useState([]);
    const [loading, setLoading] = useState(false);

    // Função para buscar imagens
    const fetchImagens = async () => {
        setLoading(true);
        try {
            // Obter o usuário atual
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error('Erro ao obter usuário:', userError?.message);
                Alert.alert('Erro', 'Usuário não autenticado.');
                setLoading(false);
                return;
            }

            const userId = user.id;
            console.log('Usuário autenticado:', userId);

            // Listar arquivos da pasta 'fotos-perfil'
            const { data: listData, error: listError } = await supabase.storage
                .from('fotos-perfil')
                .list(`${userId}/`, { limit: 100 });

            if (listError) {
                console.error('Erro ao listar imagens:', listError.message);
                Alert.alert('Erro', 'Falha ao listar imagens.');
                setLoading(false);
                return;
            }

            console.log('Lista de arquivos:', listData);

            // Obter URLs públicas das imagens
            const urls = await Promise.all(
                listData
                    .filter((item) => item.name) // Garantir que o item tenha um nome
                    .map(async (item) => {
                        const { data: urlData, error: urlError } = await supabase.storage
                            .from('fotos-perfil')
                            .getPublicUrl(`${userId}/${item.name}`);

                        if (urlError) {
                            console.error('Erro ao obter URL:', urlError.message);
                            return null;
                        }

                        console.log('URL obtida:', urlData.publicUrl);

                        return {
                            name: item.name,
                            url: urlData.publicUrl,
                        };
                    })
            );

            const imagensFiltradas = urls.filter((img) => img && img.url);
            setImagens(imagensFiltradas);
            console.log('Imagens carregadas:', imagensFiltradas);
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

    // Renderizar cada item da lista
    const renderItem = ({ item }) => (
        <View style={styles.imageContainer}>
            <Image source={{ uri: item.url }} style={styles.image} />
            <Text style={styles.imageName}>{item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={imagens}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={() => (
                        <Text style={styles.noImagesText}>Nenhuma imagem encontrada.</Text>
                    )}
                />
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
        backgroundColor: '#f8f9fa',
    },
    list: {
        paddingHorizontal: 10,
    },
    imageContainer: {
        marginVertical: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 2,
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
        color: '#333',
    },
    noImagesText: {
        fontSize: 18,
        color: '#555',
        marginTop: 20,
        textAlign: 'center',
    },
});
