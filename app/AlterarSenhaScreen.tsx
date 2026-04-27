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
import { useRouter } from "expo-router";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import { useTranslation } from "react-i18next";

export default function AlterarSenhaScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleAlterarSenha = async () => {
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
      Alert.alert(t("alert_attention"), t("alert_fill_all_fields"));
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert(t("alert_error"), t("alert_passwords_dont_match"));
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert(t("alert_error"), t("alert_password_too_short"));
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert(t("alert_error"), t("alert_unauthenticated"));
        return;
      }

      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      await updatePassword(user, novaSenha)
        .then(() => {
          Alert.alert(t("alert_success"), t("alert_password_changed"));
          router.push("/Home");
        })
        .catch((error) => {
          console.log("Error ao atualizar senha" + error.message);
          Alert.alert(t("alert_error"), t("alert_password_change_failed"));
        });
    } catch (error) {
      console.log("Erro ao reautenticar");
      Alert.alert(t("alert_error"), t("alert_invalid_current_password"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{t("change_password_title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("current_password_placeholder")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senhaAtual}
        onChangeText={setSenhaAtual}
      />

      <TextInput
        style={styles.input}
        placeholder={t("new_password_placeholder")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={styles.input}
        placeholder={t("confirm_new_password_placeholder")}
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={handleAlterarSenha}>
        <Text style={styles.textoBotao}>{t("change_password_button")}</Text>
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
  textoBotao: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
