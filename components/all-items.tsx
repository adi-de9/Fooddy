import { EvilIcons, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AllItemsHeader = ({ navigation }: any) => {
  return (
    <View
      style={{
        width: "100%",
        paddingTop: "12%",
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} />
      </TouchableOpacity>

      <View
        style={{
          marginLeft: 12,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "400", alignItems: "center" }}>
          All Items
        </Text>
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <EvilIcons name="heart" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default AllItemsHeader;

const styles = StyleSheet.create({});
