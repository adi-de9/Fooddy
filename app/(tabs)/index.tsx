import { supabase } from "@/services/supabaseClient";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const mobile = await AsyncStorage.getItem("userMobile");
    if (!mobile) return;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("mobile", mobile)
      .single();

    if (data) setUser(data);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ================= HEADER ================= */}
      <View style={styles.headerBox}>
        {user ? (
          <>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name} 👋</Text>
          </>
        ) : (
          <>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>Guest User 👋</Text>
          </>
        )}

        {/* LOCATION ROW */}
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <Ionicons name="location-sharp" size={20} color="#FF5733" />

            <View>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationValue}>Sitabuildi, Nagpur</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* STORE ICON → LOCATION PAGE */}
            <TouchableOpacity
              onPress={() => router.push("/locations")}
              style={styles.storeBtn}
            >
              <Ionicons name="storefront" size={22} color="#222" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ================= SEARCH BAR ================= */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search & Filter dishes..."
          placeholderTextColor="#888"
        />
        <Feather name="sliders" size={20} color="#666" />
      </View>

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
      <View style={styles.restaurantCard}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
          }}
          style={styles.restaurantImage}
        />

        <View style={{ padding: 12 }}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FF9F0A" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>

          <Text style={styles.restaurantName}>Moti Mahal</Text>
          <Text style={styles.restaurantCuisine}>
            North Indian • Chinese • Continental
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.iconRow}>
              <Feather name="clock" size={16} color="#666" />
              <Text style={styles.infoText}>25-30 min</Text>
            </View>

            <View style={styles.iconRow}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.infoText}>2.5 km away</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ================= CATEGORY SECTION ================= */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>Categories</Text>
        <TouchableOpacity onPress={() => router.push("/view-all-catgy")}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryList}>
          {["Pizza", "Burger", "Biryani", "Chinese", "Snacks"].map(
            (item, i) => (
              <View key={i} style={styles.categoryBox}>
                <Text style={styles.categoryText}>{item}</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginTop: 50,
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
    borderColor: "#eee",
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#222",
  },

  // Offer
  offerCard: {
    marginTop: 20,
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

  // Restaurant
  restaurantCard: {
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },

  restaurantImage: { width: "100%", height: 160 },

  restaurantName: { fontSize: 20, fontWeight: "700", marginTop: 5 },
  restaurantCuisine: { color: "#777", marginTop: 2 },

  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 4, color: "#111", fontWeight: "600" },

  infoRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconRow: { flexDirection: "row", alignItems: "center" },
  infoText: { marginLeft: 4, color: "#666" },

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

  categoryText: { color: "#333", fontWeight: "500" },
});
