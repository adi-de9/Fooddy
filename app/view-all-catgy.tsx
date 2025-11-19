import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { menuCategories, menuItems } from "../data/mockData";

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

export type CartItem = MenuItem & {
  quantity: number;
};

type CategoryType = "All Items" | MenuCategory;

export default function ViewAllCategoryPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("All Items");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [categoriesList, setCategoriesList] = useState<CategoryType[]>([
    "All Items",
    ...menuCategories,
  ]);

  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const raw = await AsyncStorage.getItem("cart");
    const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
    setCart(parsed);
    setCartCount(parsed.reduce((s, i) => s + i.quantity, 0));
  };

  const saveCart = async (updated: CartItem[]) => {
    setCart(updated);
    await AsyncStorage.setItem("cart", JSON.stringify(updated));
    setCartCount(updated.reduce((s, i) => s + i.quantity, 0));
  };

  const increment = (item: MenuItem) => {
    let updated = [...cart];
    const found = updated.find((c) => c.id === item.id);

    if (found) found.quantity++;
    else updated.push({ ...item, quantity: 1 });

    saveCart(updated);
  };

  const decrement = (item: MenuItem) => {
    let updated = [...cart];
    const found = updated.find((c) => c.id === item.id);
    if (!found) return;

    if (found.quantity <= 1) {
      updated = updated.filter((c) => c.id !== item.id);
    } else {
      found.quantity--;
    }

    saveCart(updated);
  };

  const handleDragEnd = ({ data, from, to }: any) => {
    // Prevent dragging "All Items"
    if (from === 0 || to === 0) {
      setCategoriesList([
        "All Items",
        ...data.filter((d) => d !== "All Items"),
      ]);
      return;
    }

    // Normal drag
    setCategoriesList(data);
  };

  const filteredItems: MenuItem[] =
    selectedCategory === "All Items"
      ? Object.values(menuItems).flat()
      : menuItems[selectedCategory.id] || [];

  const renderCategory = ({ item, drag, isActive, index }: any) => {
    const isAll = item === "All Items";

    const isActiveCat =
      selectedCategory === "All Items"
        ? item === "All Items"
        : item.id === (selectedCategory as MenuCategory).id;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          // Only allow drag if NOT "All Items"
          onLongPress={isAll ? undefined : drag}
          delayLongPress={120}
          onPress={() => setSelectedCategory(item)}
          style={[
            styles.catBtn,
            isActiveCat && styles.catBtnActive,
            isActive && !isAll && { opacity: 0.4 },
          ]}
        >
          {/* ICON */}
          {item !== "All Items" && (
            <Text style={styles.catIcon}>{item.icon}</Text>
          )}

          {/* NAME */}
          <Text style={[styles.catText, isActiveCat && styles.catTextActive]}>
            {isAll ? "All Items" : item.name}
          </Text>

          {/* DRAG HANDLE (HIDDEN FOR ALL ITEMS) */}
          {item !== "All Items" && (
            <Feather name="menu" size={14} color="#999" />
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const quantity = cart.find((c) => c.id === item.id)?.quantity ?? 0;

    return (
      <View style={styles.card}>
        {/* LEFT IMAGE */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.foodImg} />

          {/* VEG / NON-VEG */}
          <View
            style={[
              styles.dietBadge,
              item.dietary === "veg" ? styles.vegBorder : styles.nonVegBorder,
            ]}
          >
            <View
              style={[
                styles.dietDot,
                item.dietary === "veg" ? styles.vegDot : styles.nonVegDot,
              ]}
            />
          </View>

          {quantity > 0 && (
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>{quantity}</Text>
            </View>
          )}
        </View>

        {/* RIGHT SECTION */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.foodName} numberOfLines={1}>
              {item.name}
            </Text>

            {quantity === 0 ? (
              <Pressable style={styles.addBtn} onPress={() => increment(item)}>
                <Text style={styles.addBtnText}>Add</Text>
                <Text style={styles.plusIcon}>＋</Text>
              </Pressable>
            ) : (
              <View style={styles.counterBox}>
                <Pressable onPress={() => decrement(item)}>
                  <Text style={styles.counterBtnSymbol}>−</Text>
                </Pressable>
                <Text style={styles.counterQty}>{quantity}</Text>
                <Pressable onPress={() => increment(item)}>
                  <Text style={styles.counterBtnSymbol}>＋</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text style={styles.price}>₹{item.price}</Text>

          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* CATEGORY SCROLLER */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 6,
          paddingBottom: 10,
          height: 50,
        }}
      >
        {categories.map((cat) => {
          const isActive =
            selectedCategory === "All Items"
              ? cat === "All Items"
              : cat?.id === (selectedCategory as MenuCategory).id;

          return (
            <TouchableOpacity
              key={cat === "All Items" ? "all" : cat.id}
              style={[styles.catBtn, isActive && styles.catBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, isActive && styles.catTextActive]}>
                {cat === "All Items" ? "All Items" : cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView> */}

      <DraggableFlatList
        horizontal
        data={categoriesList}
        renderItem={renderCategory}
        keyExtractor={(item) => (item === "All Items" ? "all-items" : item.id)}
        onDragEnd={handleDragEnd}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ marginVertical: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {cartCount > 0 && (
        <Animated.View
          entering={ZoomIn}
          exiting={ZoomOut}
          style={styles.catContainer}
        >
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.floatingCartBtn}
          >
            <Feather name="shopping-cart" size={26} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  /* CATEGORY FILTER */
  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  catBtnActive: {
    backgroundColor: "#FF5733",
    borderColor: "#FF5733",
  },
  catText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  catTextActive: {
    color: "#fff",
  },
  catIcon: {
    fontSize: 16,
  },

  /* CARD LAYOUT */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ececec",
    padding: 12,
    gap: 14,
    marginBottom: 14,
  },

  imageWrapper: {
    position: "relative",
  },

  foodImg: {
    width: 75,
    height: 75,
    borderRadius: 12,
  },

  /* DIET ICON */
  dietBadge: {
    position: "absolute",
    top: -5,
    left: -5,
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  vegBorder: {
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  nonVegBorder: {
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  dietDot: {
    width: 9,
    height: 9,
    borderRadius: 4,
  },
  vegDot: {
    backgroundColor: "#16a34a",
  },
  nonVegDot: {
    backgroundColor: "#dc2626",
  },

  /* QUANTITY BADGE */
  qtyBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5733",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  qtyBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  /* TEXT SECTION */
  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    flex: 1,
    paddingRight: 10,
  },

  price: {
    color: "#FF5733",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  desc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },

  /* ADD BUTTON */
  addBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 3,
    backgroundColor: "#fff",
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  plusIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b5563",
  },

  /* COUNTER */
  counterBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FF5733",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 10,
    alignItems: "center",
  },
  counterBtnSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF5733",
  },
  counterQty: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    minWidth: 18,
    textAlign: "center",
  },

  /* FLOATING CART BUTTON */
  catContainer: {
    position: "absolute",
    bottom: 85,
    right: 20,
  },
  floatingCartBtn: {
    width: 58,
    height: 58,
    backgroundColor: "#FF5733",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#fff",
    borderColor: "#FF5733",
    borderWidth: 2,
    borderRadius: 20,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FF5733",
    fontWeight: "700",
    fontSize: 10,
  },
});
