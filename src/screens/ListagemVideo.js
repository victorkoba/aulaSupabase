import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../../supabaseConfig';
import { Picker } from '@react-native-picker/picker';

const bucketName = 'videos';

export default function ListarVideos() {
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Carrega as categorias (pastas do bucket)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) throw error;

      const categoryList = data
        .filter(item => item.name && !item.name.includes('.')) // ignora arquivos soltos
        .map(item => item.name);

      setCategories(categoryList);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Carrega vídeos da categoria selecionada
  const fetchVideos = async () => {
    if (!category) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(`${category}/`, {
        limit: 50,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) throw error;

      const videoList = data
        .filter(file => !file.name.endsWith('/')) // ignora subpastas
        .map(file => ({
          name: file.name,
          url: supabase.storage.from(bucketName).getPublicUrl(`${category}/${file.name}`).data.publicUrl,
        }));

      setVideos(videoList);
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
    } else {
      setVideos([]);
    }
  }, [category]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Listagem de Vídeos</Text>

      {loadingCategories ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma categoria" value="" />
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : videos.length > 0 ? (
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
      ) : (
        category !== '' && (
          <Text style={styles.noVideoText}>Nenhum vídeo encontrado nesta categoria.</Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    marginBottom: 25,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  videoContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  videoName: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  video: {
    width: 300,
    height: 200,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  noVideoText: {
    marginTop: 30,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
});
