// Miguel Francisco da Silva Sales Victor Luiz Koba Batista
import * as Notifications from "expo-notifications"
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PaginaInical from "./src/screens/PaginaInicial";
import Login from "./src/screens/Login";
import Cadastro from "./src/screens/Cadastro";
import EditarUsuario from "./src/screens/EditarUsuario";
import ListarImagem from "./src/screens/ListagemImagem";
import ListarVideo from "./src/screens/ListagemVideo";
import UploadImagem from "./src/screens/UploadImagem";
import UploadVideo from "./src/screens/UploadVideo";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={Cadastro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaginaInicial"
          component={PaginaInical}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditarUsuario"
          component={EditarUsuario}
          options={{
            title: "Editar Usuário",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ListarImagem"
          component={ListarImagem}
          options={{
            title: "Listagem Imagens",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="ListarVideo"
          component={ListarVideo}
          options={{
            title: "Listagem Vídeos",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="UploadImagem"
          component={UploadImagem}
          options={{
            title: "Upload Imagens",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="UploadVideo"
          component={UploadVideo}
          options={{
            title: "Upload Vídeos",
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
