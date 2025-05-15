import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Image, Alert, ActivityIndicator } from "react-native";
import { supabase } from "../supabaseConfig";
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
        .select("nome, photo_url")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Erro ao carregar dados do usuário:", userError);
      } else {
        setNome(userData.nome || "");
        setFotoAtual(userData.photo_url || "");
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

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, Buffer.from(fileContent, "base64"), {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error("Erro ao enviar imagem");
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const salvarAlteracoes = async () => {
    setIsLoading(true);

    try {
      let photoUrl = fotoAtual;

      // Se for uma nova imagem local, envia para o Supabase Storage
      if (!fotoAtual.startsWith("http")) {
        photoUrl = await uploadFoto();
      }

      // Atualizar tabela users
      const { error: updateError } = await supabase
        .from("users")
        .update({ nome, photo_url: photoUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Atualizar e-mail
      if (novoEmail) {
        const { error: emailError } = await supabase.auth.updateUser({ email: novoEmail });
        if (emailError) throw emailError;
      }

      // Atualizar senha
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
    <View style={{ padding: 20 }}>
      {fotoAtual ? (
        <Image source={{ uri: fotoAtual }} style={{ width: 100, height: 100, borderRadius: 50 }} />
      ) : null}
      <Button title="Selecionar Foto" onPress={selecionarFoto} />

      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput placeholder="Novo E-mail" value={novoEmail} onChangeText={setNovoEmail} keyboardType="email-address" />
      <TextInput placeholder="Senha Atual" value={senhaAtual} onChangeText={setSenhaAtual} secureTextEntry />
      <TextInput placeholder="Nova Senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Salvar Alterações" onPress={salvarAlteracoes} />
      )}
    </View>
  );
};

export default EditarUsuario;