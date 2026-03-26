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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../src/services/firebaseConfig";
import { deleteUser, onAuthStateChanged } from "firebase/auth";
import ItemNota from "./components/ItemNota";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { salvarNotaUsuario } from "../src/services/userDataService";
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

type Nota = {
  id: string;
  valor: string;
};

export default function Home() {
  const [valorNota, setValorNota] = useState("");

  const [notas, setNotas] = useState<Nota[]>([]);

  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [notaSelecionadaId, setNotaSelecionadaId] = useState("");
  const [novoValorNota, setNovoValorNota] = useState("");

  const router = useRouter();

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
      if (unsubscribeNotas) {
        unsubscribeNotas();
      }
    };
  }, []);

  const realizarLogoff = async () => {
    await AsyncStorage.removeItem("@user");
    router.replace("/");
  };

  const salvarNota = async () => {
    if (!valorNota.trim()) {
      Alert.alert("Atenção", "Digite o valor da nota.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Nenhum usuário autenticado.");
      return;
    }

    try {
      await addDoc(collection(db, "notes"), {
        valor: valorNota.trim(),
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Nota salva!");
      setValorNota("");
    } catch (error) {
      console.log("Erro ao salvar nota:", error);
    }
  };

  const excluirNota = async (nota: Nota) => {
    const user = auth.currentUser;

    if (!user) {
      console.log("Nenhum usuário autenticado");
      return;
    }

    try {
      const notaRef = doc(db, "notes", nota.id);

      await deleteDoc(notaRef);

      console.log("Nota excluída com sucesso!");
    } catch (error) {
      console.log("Erro ao excluir nota:", error);
    }
  };

  const abrirModalEdicao = (nota?: Nota) => {
    if (nota) {
      setNotaSelecionadaId(nota.id);
      setNovoValorNota(nota.valor);
    } else {
      setNotaSelecionadaId("");
      setNovoValorNota("");
    }

    setModalEditarVisivel(true);
  };

  const fecharModalEdicao = () => {
    setModalEditarVisivel(false);
    setNotaSelecionadaId("");
    setNovoValorNota("");
  };

  const atualizarNota = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Erro", "Nenhum usuário autenticado.");
      return;
    }

    if (!novoValorNota.trim()) {
      Alert.alert("Atenção", "Digite um valor válido para a nota.");
      return;
    }

    try {
      const notaRef = doc(db, "notes", notaSelecionadaId);

      await updateDoc(notaRef, {
        valor: novoValorNota.trim(),
      });

      fecharModalEdicao();
      Alert.alert("Sucesso", "Nota editada com sucesso.");
    } catch (error) {
      console.log("Erro ao atualizar nota", error);
      Alert.alert("Erro", "Não foi possível atualizar a nota.");
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        <Text>Tela Home</Text>
        <Button title="Realizar logoff" onPress={realizarLogoff} />

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
            <Text style={styles.emptyText}>Nenhuma nota cadastrada.</Text>
          }
        />

        <Modal
          visible={modalEditarVisivel}
          transparent
          animationType="slide"
          onRequestClose={fecharModalEdicao}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Atualizar Nota</Text>

              <TextInput
                style={styles.modalInput}
                value={novoValorNota}
                onChangeText={(value) => setNovoValorNota(value)}
                placeholder="Digite o novo valor da nota."
              />

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={fecharModalEdicao}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButtonSave}
                  onPress={atualizarNota}
                >
                  <Text style={styles.modalButtonSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TextInput
          placeholder="Digite o valor da nota"
          style={styles.input}
          value={valorNota}
          onChangeText={(value) => setValorNota(value)}
          onSubmitEditing={salvarNota}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  input: {
    backgroundColor: "lightgrey",
    padding: 10,
    fontSize: 15,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: "auto",
  },
  lista: {
    width: "100%",
    marginTop: 16,
    flex: 1,
  },
  listaConteudo: {
    gap: 8,
    paddingBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 22,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgb(0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "lightgrey",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButtonCancel: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "lightgrey",
  },
  modalButtonSave: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "green",
  },
  modalButtonSaveText: {
    color: "white",
    fontWeight: "600",
  },
});
