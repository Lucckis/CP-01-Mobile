import { Link } from "expo-router";
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
import { auth } from "../src/services/firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registrarUltimoLogin } from "../src/services/userDataService";

import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert(t("alert_attention"), t("alert_fill_all_fields"));
      return;
    }
    signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await registrarUltimoLogin(user.uid, user.email);
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        router.replace("/Home");
      })
      .catch((error) => {
        Alert.alert(t("alert_attention"), t("alert_invalid_credentials"), [
          { text: t("ok") },
        ]);
      });
  };

  const esqueceuSenha = () => {
    if (!email) {
      Alert.alert(t("alert_error"), t("alert_enter_email_recovery"));
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(t("alert_success"), t("alert_recovery_email_sent"));
      })
      .catch((error) => {
        Alert.alert(t("alert_error"), t("alert_recovery_email_failed"));
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{t("welcome")}</Text>

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

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>{t("login_button")}</Text>
      </TouchableOpacity>

      <View style={{ alignItems: "center" }}>
        <Link href="CadastroScreen" style={{ marginTop: 20, color: "white" }}>
          {t("register_link")}
        </Link>

        <TouchableOpacity onPress={esqueceuSenha}>
          <Text style={{ marginTop: 20, color: "white" }}>
            {t("forgot_password_link")}
          </Text>
        </TouchableOpacity>
      </View>

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
  textoBotao: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
