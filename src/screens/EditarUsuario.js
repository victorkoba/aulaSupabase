import React, { useState, useEffect } from "react";
import {Buffer} from 'buffer';
import {
  View,
  TextInput,
  Button,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../supabaseConfig";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const EditarUsuario = ({ navigation }) => {
  const [nome, setNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [fotoAtual, setFotoAtual] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;

      if (authError || !user) {
        console.error("Erro ao obter usuário:", authError);
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      setUserId(user.id);
      setNovoEmail(user.email);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("nome_user, email_user, photoUrl_user")
        .eq("id_user", user.id)
        .single();

      if (userError) {
        console.error("Erro ao carregar dados do usuário:", userError);
      } else {
        setNome(userData.nome_user || "");
        setFotoAtual(userData.photoUrl_user || "");
      }
    };

    fetchUserData();
  }, []);

  const selecionarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFotoAtual(result.assets[0].uri);
    }
  };

  const uploadFoto = async () => {
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = fotoAtual;
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage
      .from("fotos-perfil")
      .upload(fileName, Buffer.from(fileContent, "base64"), {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error("Erro ao enviar imagem");
    }

    const { data: publicUrl } = supabase.storage.from("fotos-perfil").getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const salvarAlteracoes = async () => {
    setIsLoading(true);

    try {
      let photoUrl = fotoAtual;

      if (!fotoAtual.startsWith("http")) {
        photoUrl = await uploadFoto();
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ nome_user: nome, photoUrl_user: photoUrl })
        .eq("id_user", userId);

      if (updateError) throw updateError;

      if (novoEmail) {
        const { error: emailError } = await supabase.auth.updateUser({ email: novoEmail });
        if (emailError) throw emailError;
      }

      if (novaSenha && senhaAtual) {
        const { error: passError } = await supabase.auth.updateUser({ password: novaSenha });
        if (passError) throw passError;
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Editar Perfil</Text>

      {fotoAtual && (
        <Image source={{ uri: fotoAtual }} style={styles.foto} />
      )}

      <TouchableOpacity style={styles.fotoBtn} onPress={selecionarFoto}>
        <Text style={styles.fotoBtnText}>Selecionar Nova Foto</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Novo E-mail"
        value={novoEmail}
        onChangeText={setNovoEmail}
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Senha Atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />
      <TextInput
        placeholder="Nova Senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.btnSalvar} onPress={salvarAlteracoes}>
          <Text style={styles.btnText}>Salvar Alterações</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#222",
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  fotoBtn: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  fotoBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  btnSalvar: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    elevation: 5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});

export default EditarUsuario;
