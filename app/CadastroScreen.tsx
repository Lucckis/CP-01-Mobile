import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { criarUsuario } from "../src/services/userDataService";

import { useTranslation } from "react-i18next";

export default function CadastroScreen() {
  const { t, i18n } = useTranslation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const router = useRouter();

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleCadastro = () => {
    if (!nome || !email || !senha) {
      Alert.alert(t("alert_attention"), t("alert_fill_all_fields"));
      return;
    }
    createUserWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;

        await criarUsuario({
          uid: user.uid,
          email: user.email,
          nome,
        });

        await AsyncStorage.setItem("@user", JSON.stringify(user));
        router.replace("/Home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + " " + errorMessage);
        Alert.alert(t("alert_error"), t("alert_registration_failed"));
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{t("register_title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("full_name_placeholder")}
        placeholderTextColor="#aaa"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder={t("email_placeholder")}
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder={t("password_placeholder")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
        <Text style={styles.textoBotao}>{t("register_button")}</Text>
      </TouchableOpacity>

      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Text style={{ color: "white", fontSize: 16, marginBottom: 15 }}>
          {t("choose_language")}
        </Text>

        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 30 }}
        >
          <TouchableOpacity onPress={() => mudarIdioma("en")}>
            <Image
              source={require("../assets/eua.png")}
              style={{ width: 45, height: 45 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => mudarIdioma("pt")}>
            <Image
              source={require("../assets/brasil.png")}
              style={{ width: 45, height: 45 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  botao: {
    backgroundColor: "#00B37E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
