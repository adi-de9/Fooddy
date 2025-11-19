import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  Switch,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Mock coupons file replacement: you already had coupons in data/mockData - keep that or remove this default
const DEFAULT_COUPONS = [
  {
    code: "WELCOME10",
    discountPercent: 10,
    isActive: true,
    description: "10% off on first order",
  },
];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadCart();
      loadAppliedCoupon();
    }, [])
  );

  const loadCart = async () => {
    try {
      const raw = await AsyncStorage.getItem("cart");
      const c = raw ? JSON.parse(raw) : [];
      setCart(c);
    } catch (e) {
      console.warn("Failed to load cart", e);
    }
  };

  const loadAppliedCoupon = async () => {
    try {
      const raw = await AsyncStorage.getItem("appliedCoupon");
      const c = raw ? JSON.parse(raw) : null;
      setAppliedCoupon(c);
    } catch (e) {
      console.warn("Failed to load appliedCoupon", e);
    }
  };

  const saveCart = async (newCart: any[]) => {
    await AsyncStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const changeQty = async (itemId: string, delta: number) => {
    const newCart = cart.map((it) =>
      it.id === itemId
        ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) }
        : it
    );
    await saveCart(newCart);
  };

  const removeItem = async (itemId: string) => {
    const newCart = cart.filter((it) => it.id !== itemId);
    await saveCart(newCart);
  };

  const subtotal = cart.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 1),
    0
  );
  const deliveryFee = 2.0; // match design
  const discount = appliedCoupon
    ? subtotal * (appliedCoupon.discountPercent / 100)
    : 0;
  const total = subtotal - discount + deliveryFee;

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Enter voucher code");
      return;
    }

    // if you want replace with your coupons import, use that. This is fallback
    const coupons = DEFAULT_COUPONS;
    const found = coupons.find((c) => c.code === code && c.isActive);

    if (!found) {
      Alert.alert("Invalid coupon");
      return;
    }
    setAppliedCoupon(found);
    await AsyncStorage.setItem("appliedCoupon", JSON.stringify(found));
    Alert.alert("Coupon applied", `${found.discountPercent}% off`);
  };

  const onCheckout = () => {
    if (isScheduled && !scheduledTime) {
      Alert.alert("Please select a time to schedule your order.");
      return;
    }

    // pass schedule/time param
    router.push({
      pathname: "/checkout",
      params: {
        mode: "delivery",
        scheduled: isScheduled ? scheduledTime : undefined,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <AntDesign name="left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={() => {}} style={styles.iconBtnRight}>
          <Feather name="more-vertical" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {cart.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="shopping-cart" size={48} color="#EEE" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add items to your cart to get started
            </Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => router.push("/")}
            >
              <Text style={styles.ctaText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Items */}
            <View style={{ marginBottom: 16 }}>
              {cart.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Image source={{ uri: item.image }} style={styles.itemImg} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemBy}>By McDonald's</Text>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <View style={styles.rating}>
                        <Text style={{ color: "#FF6A34", fontWeight: "700" }}>
                          ★
                        </Text>
                        <Text style={{ marginLeft: 6 }}>4.7</Text>
                      </View>

                      <Text style={styles.itemPrice}>
                        ₹{item.price.toFixed(2)}
                      </Text>

                      <View style={styles.qtyBox}>
                        <TouchableOpacity
                          onPress={() => changeQty(item.id, -1)}
                          style={styles.qtyBtn}
                        >
                          <Feather name="minus" size={14} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => changeQty(item.id, 1)}
                          style={[
                            styles.qtyBtn,
                            { backgroundColor: "#FF5733" },
                          ]}
                        >
                          <Feather name="plus" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    style={{ marginLeft: 8 }}
                  >
                    <Text style={{ color: "#FF5733" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Price Comparison Card */}
            <View style={styles.priceCard}>
              <LinearGradient
                colors={["#FB923C", "#F43F5E"]}
                style={styles.priceCardHeader}
              >
                <View>
                  <Text style={styles.priceCardTitle}>Price Comparison</Text>
                  <Text style={styles.priceCardSubtitle}>
                    See how much you save with us
                  </Text>
                </View>
                <View style={styles.bestValue}>
                  <Text style={styles.bestValueText}>Best Value</Text>
                </View>
              </LinearGradient>

              <View style={styles.priceCardBody}>
                <View style={styles.priceTableHeader}>
                  <Text style={styles.tableColItem}>Item</Text>
                  <Text style={styles.tableColCenter}>Our Price</Text>
                  <Text style={styles.tableColCenter}>Zomato</Text>
                  <Text style={styles.tableColCenter}>Swiggy</Text>
                </View>

                {cart.map((it) => {
                  const ourPrice = (it.price || 0) * (it.quantity || 1);
                  const zomato = Math.round(ourPrice * 1.15);
                  const swiggy = Math.round(ourPrice * 1.18);
                  return (
                    <View key={it.id} style={styles.priceRow}>
                      <Text style={styles.priceRowItem} numberOfLines={1}>
                        {it.name}
                        {it.quantity > 1 ? ` (x${it.quantity})` : ""}
                      </Text>
                      <View style={styles.centerCell}>
                        <Text style={styles.ourPriceBadge}>
                          ₹{Math.round(ourPrice)}
                        </Text>
                      </View>
                      <Text style={styles.centerText}>₹{zomato}</Text>
                      <Text style={styles.centerText}>₹{swiggy}</Text>
                    </View>
                  );
                })}

                <View style={styles.totalsRow}>
                  <Text style={{ fontWeight: "700" }}>Total</Text>
                  <View style={styles.centerCell}>
                    <Text style={styles.ourPriceBadge}>
                      ₹{Math.round(subtotal)}
                    </Text>
                  </View>
                  <Text style={styles.centerText}>
                    ₹{Math.round(subtotal * 1.15)}
                  </Text>
                  <Text style={styles.centerText}>
                    ₹{Math.round(subtotal * 1.18)}
                  </Text>
                </View>

                <View style={styles.savingsBox}>
                  <View style={styles.saveRow}>
                    <Text style={styles.saveLabel}>You save vs Zomato:</Text>
                    <Text style={styles.saveValue}>
                      ₹{Math.round(subtotal * 0.15)}
                    </Text>
                  </View>
                  <View style={styles.saveRow}>
                    <Text style={styles.saveLabel}>You save vs Swiggy:</Text>
                    <Text style={styles.saveValue}>
                      ₹{Math.round(subtotal * 0.18)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Voucher */}
            <View style={{ marginTop: 12 }}>
              <View style={styles.voucherRow}>
                <Feather
                  name="gift"
                  size={18}
                  color="#9CA3AF"
                  style={{ marginLeft: 14 }}
                />
                <TextInput
                  value={voucherCode}
                  onChangeText={(t) => setVoucherCode(t)}
                  placeholder="Enter your voucher code"
                  style={styles.voucherInput}
                />
                <TouchableOpacity
                  onPress={applyVoucher}
                  style={styles.applyBtn}
                >
                  <Text style={{ color: "#FF5733", fontWeight: "700" }}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
              {appliedCoupon && (
                <Text
                  style={{ color: "#16A34A", marginTop: 8, marginLeft: 14 }}
                >
                  {appliedCoupon.code} applied: {appliedCoupon.discountPercent}%
                  off
                </Text>
              )}
            </View>

            {/* Schedule Order */}
            <View style={styles.scheduleCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.scheduleIcon}>
                  <Feather name="clock" size={18} color="#fff" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "700", color: "#111" }}>
                    Schedule Order
                  </Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Set a time for your order
                  </Text>
                </View>
              </View>
              <Switch value={isScheduled} onValueChange={setIsScheduled} />
            </View>

            {isScheduled && (
              <View style={styles.schedulePick}>
                <Text
                  style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}
                >
                  Time (HH:MM in 24h)
                </Text>
                <TextInput
                  placeholder="13:30"
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  style={styles.timeInput}
                />
                {scheduledTime ? (
                  <Text style={{ marginTop: 8, color: "#111" }}>
                    Scheduled at: {scheduledTime}
                  </Text>
                ) : null}
              </View>
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text>Subtotal:</Text>
                <Text>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Delivery Fee:</Text>
                <Text>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              {appliedCoupon && (
                <View style={styles.summaryRow}>
                  <Text>Discount:</Text>
                  <Text>- ₹{discount.toFixed(2)}</Text>
                </View>
              )}
              <View
                style={[
                  styles.summaryRow,
                  {
                    marginTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#EEE",
                    paddingTop: 8,
                  },
                ]}
              >
                <Text style={{ fontWeight: "700" }}>Total Amount:</Text>
                <Text style={{ fontWeight: "700" }}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky bottom checkout */}
      {cart.length > 0 && (
        <View style={styles.bottom}>
          <TouchableOpacity
            onPress={onCheckout}
            style={styles.checkoutBtn}
            activeOpacity={0.9}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              ₹{total.toFixed(2)}
            </Text>
            <Text style={{ color: "#fff", marginLeft: 12 }}>
              {isScheduled ? "Schedule Order" : "Checkout"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop:
      (Platform.OS === "android" ? StatusBar.currentHeight ?? 20 : 44) + 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnRight: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  empty: { alignItems: "center", paddingTop: 40 },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 6 },
  emptySub: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: "#FF5733",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  ctaText: { color: "#fff", fontWeight: "700" },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemImg: { width: 70, height: 70, borderRadius: 10, resizeMode: "cover" },
  itemName: { fontWeight: "700", fontSize: 15 },
  itemBy: { color: "#6B7280", fontSize: 12, marginTop: 4 },
  rating: { flexDirection: "row", alignItems: "center" },
  itemPrice: { fontWeight: "700", color: "#FF5733", marginLeft: 8 },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 999,
    paddingHorizontal: 8,
    marginLeft: 12,
  },
  qtyBtn: { padding: 6 },
  qtyText: { paddingHorizontal: 8, fontWeight: "700" },

  priceCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  priceCardHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceCardTitle: { color: "#fff", fontWeight: "700" },
  priceCardSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
  },
  bestValue: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bestValueText: { color: "#fff", fontSize: 12 },

  priceCardBody: { padding: 12, backgroundColor: "#fff" },
  priceTableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  tableColItem: { flex: 1, fontSize: 12, color: "#374151" },
  tableColCenter: {
    width: 70,
    textAlign: "center",
    fontSize: 12,
    color: "#374151",
  },
  priceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  priceRowItem: { flex: 1, fontSize: 12, color: "#111" },
  centerCell: { width: 70, alignItems: "center" },
  ourPriceBadge: {
    backgroundColor: "#ECFDF5",
    color: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  centerText: { width: 70, textAlign: "center", color: "#374151" },

  totalsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  savingsBox: {
    marginTop: 12,
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
  },
  saveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  saveLabel: { color: "#374151" },
  saveValue: { color: "#16A34A", fontWeight: "700" },

  voucherRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    height: 52,
    marginTop: 6,
  },
  voucherInput: { flex: 1, marginLeft: 10, paddingRight: 12 },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
  },

  scheduleCard: {
    marginTop: 12,
    backgroundColor: "#FFF7ED",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEEBC8",
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5733",
    alignItems: "center",
    justifyContent: "center",
  },
  schedulePick: { marginTop: 12 },

  summaryCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  checkoutBtn: {
    backgroundColor: "#FF5733",
    height: 56,
    borderRadius: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: width - 32,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    width: 120,
  },
});
