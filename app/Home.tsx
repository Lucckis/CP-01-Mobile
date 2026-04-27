import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  View,
  Button,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../src/services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ItemNota from "./components/ItemNota";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import { useTranslation } from "react-i18next";

type Nota = {
  id: string;
  valor: string;
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [valorNota, setValorNota] = useState("");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [notaSelecionadaId, setNotaSelecionadaId] = useState("");
  const [novoValorNota, setNovoValorNota] = useState("");

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    let unsubscribeNotas: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeNotas) {
        unsubscribeNotas();
        unsubscribeNotas = undefined;
      }

      if (!user) {
        setNotas([]);
        return;
      }

      const notasRef = collection(db, "notes");
      const notasQuery = query(
        notasRef,
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc"),
      );

      unsubscribeNotas = onSnapshot(
        notasQuery,
        (snapshot) => {
          const dados = snapshot.docs.map((doc) => ({
            id: doc.id,
            valor: doc.data().valor ?? "",
          }));
          setNotas(dados);
        },
        (error) => {
          console.log("Erro ao buscar notas:", error);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeNotas) unsubscribeNotas();
    };
  }, []);

  const realizarLogoff = async () => {
    await AsyncStorage.removeItem("@user");
    router.replace("/");
  };

  const salvarNota = async () => {
    if (!valorNota.trim()) {
      Alert.alert(t("alert_attention"), t("alert_enter_note_value"));
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert(t("alert_error"), t("alert_unauthenticated"));
      return;
    }

    try {
      await addDoc(collection(db, "notes"), {
        valor: valorNota.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      setValorNota("");
    } catch (error) {
      console.log("Erro ao salvar nota:", error);
    }
  };

  const excluirNota = async (nota: Nota) => {
    try {
      const notaRef = doc(db, "notes", nota.id);
      await deleteDoc(notaRef);
    } catch (error) {
      console.log("Erro ao excluir nota:", error);
    }
  };

  const abrirModalEdicao = (nota: Nota) => {
    setNotaSelecionadaId(nota.id);
    setNovoValorNota(nota.valor);
    setModalEditarVisivel(true);
  };

  const fecharModalEdicao = () => {
    setModalEditarVisivel(false);
    setNotaSelecionadaId("");
    setNovoValorNota("");
  };

  const atualizarNota = async () => {
    if (!novoValorNota.trim()) {
      Alert.alert(t("alert_attention"), t("alert_enter_valid_note"));
      return;
    }

    try {
      const notaRef = doc(db, "notes", notaSelecionadaId);
      await updateDoc(notaRef, { valor: novoValorNota.trim() });
      fecharModalEdicao();
      Alert.alert(t("alert_success"), t("alert_note_updated"));
    } catch (error) {
      Alert.alert(t("alert_error"), t("alert_update_failed"));
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t("home_title")}</Text>
            <TouchableOpacity onPress={realizarLogoff}>
              <Text style={styles.logoutText}>{t("logout_button")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.languageContainer}>
            <TouchableOpacity onPress={() => mudarIdioma("en")}>
              <Image
                source={require("../assets/eua.png")}
                style={styles.flagIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => mudarIdioma("pt")}>
              <Image
                source={require("../assets/brasil.png")}
                style={styles.flagIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notas}
          style={styles.lista}
          contentContainerStyle={styles.listaConteudo}
          renderItem={({ item }) => (
            <ItemNota
              valor={item.valor}
              onDeletePress={() => excluirNota(item)}
              onEditPress={() => abrirModalEdicao(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("no_notes_found")}</Text>
          }
        />

        <Modal
          visible={modalEditarVisivel}
          transparent
          animationType="fade"
          onRequestClose={fecharModalEdicao}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>{t("modal_update_title")}</Text>
              <TextInput
                style={styles.modalInput}
                value={novoValorNota}
                onChangeText={setNovoValorNota}
                placeholder={t("modal_input_placeholder")}
                placeholderTextColor="#aaa"
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={fecharModalEdicao}
                >
                  <Text style={{ color: "#fff" }}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonSave}
                  onPress={atualizarNota}
                >
                  <Text style={styles.modalButtonSaveText}>{t("save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder={t("input_note_placeholder")}
            placeholderTextColor="#aaa"
            style={styles.input}
            value={valorNota}
            onChangeText={setValorNota}
            onSubmitEditing={salvarNota}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  logoutText: { color: "#ff4444", fontSize: 14, fontWeight: "600" },
  languageContainer: { flexDirection: "row", gap: 15 },
  flagIcon: { width: 35, height: 35, borderRadius: 17.5 },
  lista: { flex: 1 },
  listaConteudo: { padding: 20, gap: 10 },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 18,
    marginTop: 40,
  },
  inputContainer: { padding: 20, backgroundColor: "#121212" },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: "#444",
  },
  modalTitulo: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  modalButtonsContainer: { flexDirection: "row", gap: 10 },
  modalButtonCancel: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#444",
    borderRadius: 8,
  },
  modalButtonSave: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#00B37E",
    borderRadius: 8,
  },
  modalButtonSaveText: { color: "#fff", fontWeight: "bold" },
});
