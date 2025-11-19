import { menuCategories, menuItems } from "@/data/mockData";
import { supabase } from "@/services/supabaseClient";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

export interface MenuCategory {
  id: string; // or number, depending on your data
  name: string;
  icon: string; // assuming emoji or icon char
}

export interface MenuItem {
  id: string; // should match your DB type
  name: string;
  image: string;
  cuisine: string;
  price: number;
  rating: number;
  dietary: "veg" | "non-veg";
  categoryId: string | number;
  hasDeals?: boolean;
  quantity?: number; // local/cart
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  created_at?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [cartCount, setCartCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<
    string | number | null
  >(null);
  const [filters, setFilters] = useState({
    cuisines: [],
    priceRange: [0, 100],
    minRating: 0,
    dietary: "all",
    dealsOnly: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.appliedFilters) {
      const parsed = JSON.parse(params.appliedFilters as string);
      setFilters((prev) =>
        JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
      );
    }

    if (params?.searchQuery !== undefined) {
      setSearchQuery((prev) =>
        prev !== params.searchQuery ? (params.searchQuery as string) : prev
      );
    }
  }, [params]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async (): Promise<void> => {
    const mobile = await AsyncStorage.getItem("userMobile");

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("mobile", mobile)
      .single<User>();
    if (!data) return;

    if (data) setUser(data);
  };

  const loadCartCount = async (): Promise<void> => {
    const raw = await AsyncStorage.getItem("cart");
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];

    const total = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    if (total !== cartCount) setCartCount(total);

    setCartCount(total);
  };

  const addToCart = async (item: MenuItem): Promise<void> => {
    const raw = await AsyncStorage.getItem("cart");
    let cart: CartItem[] = raw ? JSON.parse(raw) : [];

    const found = cart.find((it) => it.id === item.id);

    if (found) {
      found.quantity = (found.quantity || 1) + 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    await AsyncStorage.setItem("cart", JSON.stringify(cart));
    loadCartCount();
  };

  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [])
  );

  const activeFilterCount =
    filters.cuisines.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.dietary !== "all" ? 1 : 0) +
    (filters.dealsOnly ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // ======= TOP PICKS ITEMS =========
  // Make items stable (faster)
  const allItems = React.useMemo(() => Object.values(menuItems).flat(), []);

  // Optimize filter calculations
  const topPicks = React.useMemo(() => {
    let items = allItems;

    if (selectedCategory) {
      items = items.filter((i) => i.categoryId == selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    if (filters.cuisines.length > 0) {
      items = items.filter((i) => filters.cuisines.includes(i.cuisine));
    }

    if (filters.minRating > 0) {
      items = items.filter((i) => i.rating >= filters.minRating);
    }

    if (filters.dietary !== "all") {
      items = items.filter((i) => i.dietary === filters.dietary);
    }

    if (filters.dealsOnly) {
      items = items.filter((i) => i.hasDeals);
    }

    items = items.filter(
      (i) =>
        i.price >= filters.priceRange[0] && i.price <= filters.priceRange[1]
    );

    return items;
  }, [filters, selectedCategory, searchQuery]);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerBox}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user ? user.name : "Guest User"} 👋
          </Text>

          {/* LOCATION ROW */}
          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-sharp" size={20} color="#FF5733" />

              <View>
                <Text style={styles.locationLabel}>Location</Text>
                <Text style={styles.locationValue}>Sitabuildi, Nagpur</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/locations")}
              style={styles.storeBtn}
            >
              <Ionicons name="storefront" size={22} color="#222" />
            </TouchableOpacity>
          </View>

          {/* ================= SEARCH BAR ================= */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/filter-screen",
                params: {
                  filters: JSON.stringify(filters),
                  searchQuery,
                },
              })
            }
            style={[
              styles.searchBox,
              activeFilterCount > 0 && {
                backgroundColor: "#FF5733",
                borderColor: "#FF5733",
              },
            ]}
          >
            {/* SEARCH ICON */}
            <Ionicons
              name="search"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : "#666"}
            />

            {/* TEXT */}
            <Text
              style={[
                styles.searchInput,
                activeFilterCount > 0 && { color: "#fff" },
              ]}
            >
              {searchQuery ? searchQuery : "Search & Filter dishes..."}
            </Text>

            {/* RIGHT SECTION */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather
                name="sliders"
                size={20}
                color={activeFilterCount > 0 ? "#fff" : "#666"}
              />

              {activeFilterCount > 0 && (
                <View
                  style={{
                    backgroundColor: "#fff",
                    marginLeft: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#FF5733",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{ height: 1, backgroundColor: "#eee", marginVertical: 20 }}
        />

        {/* ================= OFFER CARD ================= */}
        <View style={styles.offerCard}>
          <View>
            <Text style={styles.offerTitle}>SPECIAL OFFER</Text>
            <Text style={styles.offerDiscount}>Get 50% OFF</Text>
            <Text style={styles.offerSub}>On your first order above ₹500</Text>

            <TouchableOpacity style={styles.orderBtn}>
              <Text style={styles.orderBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png",
            }}
            style={styles.offerImage}
          />
        </View>

        {/* ================= RESTAURANT CARD ================= */}
        <View style={styles.restaurantCardContainer}>
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                }}
                style={styles.image}
              />
              <View style={styles.ratingOverlay}>
                <Ionicons name="star" size={14} color="#FF5733" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.restaurantName}>Moti Mahal</Text>
              <Text style={styles.cuisine}>
                North Indian • Chinese • Continental
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.iconRow}>
                  <Feather name="clock" size={14} color="#FF5733" />
                  <Text style={styles.infoText}>25-30 min</Text>
                </View>
                <View style={styles.iconRow}>
                  <MaterialIcons name="location-on" size={14} color="#FF5733" />
                  <Text style={styles.infoText}>2.5 km away</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ================= CATEGORY SECTION ================= */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => router.push("/view-all-catgy")}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="arrow-right" size={16} color="#FF5733" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryList}>
            {menuCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  if (selectedCategory === category.id) {
                    setSelectedCategory(null); // unselect
                  } else {
                    setSelectedCategory(category.id); // select
                  }
                }}
                style={[
                  styles.categoryBox,
                  selectedCategory === category.id && {
                    borderColor: "#FF5733",
                    borderWidth: 2,
                    backgroundColor: "#fff4e8", // optional light orange, remove if not needed
                  },
                ]}
              >
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ⭐⭐⭐ TOP PICKS SECTION ⭐⭐⭐ */}
        <View style={styles.topWrapper}>
          <Text style={styles.topTitle}>Top Picks for you</Text>

          {/* ❗ If no items match filters */}
          {topPicks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>
                No items found matching your filters
              </Text>

              <TouchableOpacity
                onPress={() => {
                  // reset search + filters
                  setFilters({
                    cuisines: [],
                    priceRange: [0, 100],
                    minRating: 0,
                    dietary: "all",
                    dealsOnly: false,
                  });
                  setSearchQuery("");
                  setSelectedCategory(null);
                  router.replace("/(tabs)");
                }}
              >
                <Text style={styles.clearAllText}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={topPicks}
              extraData={selectedCategory}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/product/${item.id}`)}
                  style={styles.topCard}
                >
                  {/* IMAGE + RATING + DIETARY */}
                  <View style={styles.topImageWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.topImage}
                    />

                    <View style={styles.topRating}>
                      <Feather name="star" size={12} color="#FF5733" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>

                    <View
                      style={[
                        styles.dietTag,
                        item.dietary === "veg" ? styles.vegBg : styles.nonVegBg,
                      ]}
                    >
                      <Text>{item.dietary === "veg" ? "🟢" : "🔴"}</Text>
                    </View>
                  </View>

                  {/* DETAILS */}
                  <View style={styles.topContent}>
                    <Text style={styles.topName}>{item.name}</Text>
                    <Text style={styles.topCuisine}>{item.cuisine}</Text>

                    <View style={styles.bottomRow}>
                      <View>
                        <Text style={styles.price}>₹{item.price}</Text>
                        {item.hasDeals && (
                          <Text style={styles.deal}>🎉 Deal</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => addToCart(item)}
                        style={styles.addBtn}
                      >
                        <Feather name="plus" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <Animated.View
          entering={ZoomIn}
          exiting={ZoomOut}
          style={styles.cartContainer}
        >
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={styles.cartBtn}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "fixed",
    flex: 1,
    backgroundColor: "#fff7f2",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // HEADER
  headerBox: {
    marginTop: 50,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 16, color: "#777" },
  userName: { fontSize: 22, fontWeight: "700", color: "#111" },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-between",
  },

  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },

  storeBtn: {
    marginLeft: 12,
    backgroundColor: "#f2f2f2",
    padding: 6,
    borderRadius: 10,
  },

  // Search
  searchBox: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 30,
    borderColor: "#eee",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#222",
  },

  // Offer
  offerCard: {
    backgroundColor: "#FF7B5A",
    padding: 20,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  offerTitle: { fontSize: 12, color: "#fff", opacity: 0.8 },
  offerDiscount: { fontSize: 24, fontWeight: "700", color: "#fff" },
  offerSub: { fontSize: 12, color: "#fff", marginTop: 4 },

  orderBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },

  orderBtnText: {
    color: "#FF5733",
    fontWeight: "700",
  },

  offerImage: { width: 80, height: 80 },

  // Restaurant Card
  restaurantCardContainer: {
    marginTop: 25,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    height: 128,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  ratingOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 12,
    color: "#666",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },

  // Categories
  categoryHeader: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  categoryTitle: { fontSize: 18, fontWeight: "700" },

  viewAll: { color: "#FF5733", fontWeight: "600" },

  categoryList: {
    flexDirection: "row",
    marginTop: 15,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  locationLabel: {
    fontSize: 12,
    color: "#777",
  },

  locationValue: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
    marginTop: 2,
  },

  categoryBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewAllText: {
    color: "#FF5733",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#fff8e1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  // categoryText: {
  //   fontSize: 12,
  //   fontWeight: '500',
  //   color: '#333',
  //   textAlign: 'center',
  // },
  /* TOP PICKS styles */
  topWrapper: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  topCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 16,
    width: "48%",
  },
  topImageWrapper: {
    height: 130,
    position: "relative",
  },
  topImage: { width: "100%", height: "100%" },

  topRating: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  dietTag: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  vegBg: { backgroundColor: "#d4f8d4" },
  nonVegBg: { backgroundColor: "#ffd4d4" },

  topContent: {
    padding: 10,
  },
  topName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  topCuisine: {
    fontSize: 11,
    color: "#777",
    marginBottom: 6,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF5733",
  },
  deal: {
    fontSize: 11,
    color: "green",
  },

  addBtn: {
    backgroundColor: "#FF5733",
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  /* FLOATING CART BUTTON */
  cartContainer: {
    position: "absolute",
    bottom: 90,
    right: 20,
  },
  cartBtn: {
    width: 58,
    height: 58,
    backgroundColor: "#FF7B00",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "white",
    borderColor: "#FF7B00",
    borderWidth: 2,
    width: 22,
    height: 22,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FF7B00",
    fontSize: 10,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },

  clearAllText: {
    fontSize: 15,
    color: "#FF5733",
    fontWeight: "600",
  },

  categoryText: { color: "#333", fontWeight: "500" },
});
