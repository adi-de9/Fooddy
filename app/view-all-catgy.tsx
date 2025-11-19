import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const categories = ["All Items", "Starters", "Main Course"];

const items = [
  {
    id: "1",
    name: "Butter Chicken",
    price: "₹19",
    desc: "Creamy tomato curry with tender chicken pieces",
    img: "https://i.imgur.com/4YQZ8pD.png",
  },
  {
    id: "2",
    name: "Margherita Pizza",
    price: "₹16",
    desc: "Classic pizza with fresh mozzarella and basil",
    img: "https://i.imgur.com/zcN2dSb.png",
  },
  {
    id: "3",
    name: "Beef Burger",
    price: "₹15",
    desc: "Juicy beef patty with lettuce, tomato, and cheese",
    img: "https://i.imgur.com/8Xo3p7j.png",
  },
  {
    id: "4",
    name: "Pad Thai",
    price: "₹17",
    desc: "Stir-fried rice noodles with shrimp and peanuts",
    img: "https://i.imgur.com/z7ogw2U.png",
  },
];

export default function FoodMenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All Items");

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.img }} style={styles.foodImg} />

      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
      </View>

      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>Add +</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catBtn,
              selectedCategory === cat && styles.catBtnActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.catText,
                selectedCategory === cat && styles.catTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 10,
    textAlign: "center",
  },

  // Category Tabs
  categoryRow: {
    flexGrow: 0,
    marginBottom: 16,
  },
  catBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#bbbbbbff",
  },
  catBtnActive: {
    backgroundColor: "#FF6433",
  },
  catText: {
    color: "#444",
    fontWeight: "500",
  },
  catTextActive: {
    color: "#fff",
  },

  // Cards
  card: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImg: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    fontSize: 14,
    color: "#FF6433",
    marginVertical: 4,
  },
  desc: {
    fontSize: 12,
    color: "#666",
    width: "95%",
  },
  addBtn: {
    backgroundColor: "#f3f3f3",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "center",
  },
  addText: {
    fontWeight: "600",
    color: "#333",
  },
});
