import { StyleSheet, View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ItemNota({ valor, onDeletePress, onEditPress }) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onEditPress}>
        <MaterialIcons name="edit" size={24} />
      </Pressable>

      <Text style={styles.title}>{valor}</Text>

      <Pressable onPress={onDeletePress}>
        <MaterialIcons name="delete" size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "lightgrey",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
  },
  title: {
    flex: 1,
    marginHorizontal: 10,
  },
});
