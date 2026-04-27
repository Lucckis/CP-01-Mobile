import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

let MapView, Marker;
if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

export default function ItemNota({
  valor,
  latitude,
  longitude,
  endereco,
  onDeletePress,
  onEditPress,
}) {
  const { t } = useTranslation();
  const [modalMapaVisivel, setModalMapaVisivel] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={onEditPress}>
        <MaterialIcons name="edit" size={24} color="#00B37E" />
      </Pressable>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{valor}</Text>
        {endereco && <Text style={styles.address}>{endereco}</Text>}
      </View>

      {latitude && longitude && (
        <Pressable
          onPress={() => setModalMapaVisivel(true)}
          style={styles.iconSpacing}
        >
          <MaterialIcons name="location-on" size={26} color="#1e90ff" />
        </Pressable>
      )}

      <Pressable onPress={onDeletePress}>
        <MaterialIcons name="delete" size={24} color="#ff4444" />
      </Pressable>

      <Modal
        visible={modalMapaVisivel}
        animationType="slide"
        onRequestClose={() => setModalMapaVisivel(false)}
      >
        <SafeAreaView style={styles.modalMapaContainer}>
          <View style={styles.headerModal}>
            <Text style={styles.modalTitle}>{t("modal_map_title")}</Text>
            <TouchableOpacity onPress={() => setModalMapaVisivel(false)}>
              <Text style={styles.closeText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === "web" ? (
            <View style={styles.webFallback}>
              <MaterialIcons name="map" size={50} color="#aaa" />
              <Text style={styles.webFallbackText}>
                O mapa não está disponível na versão Web.
              </Text>
              <Text style={styles.webFallbackSubText}>
                Por favor, use o Expo Go no celular para visualizar.
              </Text>
            </View>
          ) : (
            <MapView
              style={styles.mapa}
              initialRegion={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{ latitude, longitude }}
                title={valor}
                description={endereco}
              />
            </MapView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    width: "95%",
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  textContainer: { flex: 1, marginHorizontal: 10 },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  address: { color: "#aaa", fontSize: 12, marginTop: 2 },
  iconSpacing: { marginRight: 15 },
  modalMapaContainer: { flex: 1, backgroundColor: "#121212" },
  headerModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  closeText: { color: "#00B37E", fontSize: 16, fontWeight: "bold" },
  mapa: { flex: 1 },
  // Estilos para a mensagem na Web
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  webFallbackText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  webFallbackSubText: { color: "#aaa", fontSize: 14, textAlign: "center" },
});
