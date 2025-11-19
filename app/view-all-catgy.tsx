import { menuCategories, menuItems } from "@/data/mockData";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// types.ts
export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  cuisine: string;
  rating: number;
  dietary: string;
  hasDeals: boolean;
}

type CategoryType = "All Items" | MenuCategory;

export default function ViewAllCategoryPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("All Items");
  const [isHovered, setIsHovered] = useState(false);

  // Build category array dynamically
  const categories: CategoryType[] = ["All Items", ...menuCategories];

  // Filtering based on category
  const filteredItems: MenuItem[] =
    selectedCategory === "All Items"
      ? Object.values(menuItems).flat()
      : menuItems[selectedCategory?.id] || [];

  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.foodImg} />

      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>

      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={[styles.addBtn, isHovered && styles.addBtnHover]}
      >
        <Text style={[styles.addText, isHovered && styles.addTextHover]}>
          Add +
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
      >
        {categories.map((cat) => {
          const isActive =
            selectedCategory === "All Items"
              ? cat === "All Items"
              : (selectedCategory as MenuCategory).id ===
                (cat as MenuCategory).id;

          return (
            <TouchableOpacity
              key={cat === "All Items" ? "all" : (cat as MenuCategory).id}
              style={[styles.catBtn, isActive && styles.catBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, isActive && styles.catTextActive]}>
                {cat === "All Items" ? cat : cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Item List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  categoryRow: {
    flexGrow: 0,
    marginBottom: 20,
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
  addBtnHover: {
    backgroundColor: "#FF6433", // orange on hover
  },

  addTextHover: {
    color: "#fff",
  },
});
