// Victor Luiz Koba Batista
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";


const PaginaInicial = ({ navigation }) => {
  const sair = () => {
    alert('Você está saindo da conta');
    navigation.navigate("Login")
  };
  return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>

          <Text style={styles.titulo}>Navegações</Text>

          <View style={styles.cartao}>

            <Pressable 
            style={styles.botaoPress}
            onPress={() => navigation.navigate("EditarUsuário")}
            >
              <Text style={styles.botao}> Editar Perfil </Text>
            </Pressable>

            <Pressable 
            style={styles.botaoPress}
            onPress={() => navigation.navigate("ListagemImagem")}
            >
              <Text style={styles.botao}> Listar Imagens </Text>
            </Pressable>
            <Pressable 
            style={styles.botaoPress}
            onPress={() => navigation.navigate("ListagemVideo")}
            >
              <Text style={styles.botao}> Listar Vídeos </Text>
            </Pressable>
            <Pressable 
            style={styles.botaoPress}
            onPress={() => navigation.navigate("UploadImagem")}
            >
              <Text style={styles.botao}> Upload Imagens </Text>
            </Pressable>
            <Pressable 
            style={styles.botaoPress}
            onPress={() => navigation.navigate("UploadVideo")}
            >
              <Text style={styles.botao}> Upload Vídeos </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    backgroundColor: "#fff", 
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  cartao: {
    backgroundColor: "#e3e3e3",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  botaoPress: {
    width: "100%",
    backgroundColor: "#00a3ff",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  botao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default PaginaInicial;