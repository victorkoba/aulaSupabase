// Miguel Francisco da Silva Sales Victor Luiz Koba Batista
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

export default function PaginaInicial({ navigation }) {
  const sair = () => {
    Alert.alert('Sair', 'Você está saindo da conta.');
    navigation.navigate("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Bem-vindo!</Text>

      <View style={styles.card}>

        <Pressable
          style={styles.botaoPress}
          onPress={() => navigation.navigate("EditarUsuario")}
        >
          <Text style={styles.botaoText}>Editar Perfil</Text>
        </Pressable>

        <Pressable
          style={styles.botaoPress}
          onPress={() => navigation.navigate("ListarImagem")}
        >
          <Text style={styles.botaoText}>Listar Imagens</Text>
        </Pressable>

        <Pressable
          style={styles.botaoPress}
          onPress={() => navigation.navigate("ListarVideo")}
        >
          <Text style={styles.botaoText}>Listar Vídeos</Text>
        </Pressable>

        <Pressable
          style={styles.botaoPress}
          onPress={() => navigation.navigate("UploadImagem")}
        >
          <Text style={styles.botaoText}>Upload Imagens</Text>
        </Pressable>

        <Pressable
          style={styles.botaoPress}
          onPress={() => navigation.navigate("UploadVideo")}
        >
          <Text style={styles.botaoText}>Upload Vídeos</Text>
        </Pressable>

        <Pressable
          style={[styles.botaoPress, styles.botaoSair]}
          onPress={sair}
        >
          <Text style={styles.botaoText}>Sair</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fa",
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 25,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoPress: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center",
  },
  botaoSair: {
    backgroundColor: "#dc3545", // vermelho para sair
  },
  botaoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
