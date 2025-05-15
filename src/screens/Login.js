import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("https://hxyftzsadtarnmobdkdh.supabase.co/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "SUA_CHAVE_ANON",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.description || "Erro ao fazer login.");
      }

      // Login bem-sucedido
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      navigation.navigate("PaginaInicial"); // vá para sua página inicial

    } catch (error) {
      console.error("Erro ao fazer login:", error.message);
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Entrar" onPress={loginUser} />

      <TouchableOpacity
        onPress={() => navigation.navigate("Cadastro")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "blue" }}>Criar nova conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 5,
    marginBottom: 15,
    padding: 10,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: "center",
  },
});
