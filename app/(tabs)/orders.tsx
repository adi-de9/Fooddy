import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "expo-router";

type OrderItem = {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  [k: string]: any;
};

type Order = {
  id: string;
  user_id?: string;
  order_type?: string; // 'online' | 'reservation' | 'takeaway' | 'dinein'
  status?: string;
  branch_name?: string;
  branch_id?: string | null;
  items?: OrderItem[] | string;
  total_amount?: number;
  guests?: number | null;
  time_slot?: string | null;
  scheduled_at?: string | null;
  delivery_addr?: string | null;
  pickup_drop?: boolean | null;
  vehicle_type?: string | null;
  meta?: any;
  created_at?: string;
  updated_at?: string;
  [k: string]: any;
};

type OrdersScreenProps = {
  // optional props if parent wants to provide orders or navigation handlers
  onNavigateToOrderDetails?: (orderId: string) => void;
  onNavigateToBookingDetails?: (bookingId: string) => void;
};

export default function OrdersScreen({
  onNavigateToOrderDetails,
  onNavigateToBookingDetails,
}: OrdersScreenProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    dateRange: "all" as "all" | "today" | "week" | "month",
  });

  // fetch orders from supabase
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<Order>("orders")
        .select("*")
        .order("created_at", { ascending: false }); // newest first

      if (error) {
        console.log("supabase orders error", error);
        Alert.alert("Error", "Failed to load orders");
        setOrders([]);
        setFiltered([]);
        return;
      }

      // Normalize items field: supabase may return JSON as object/array
      const normalized = (data || []).map((o) => {
        let items: OrderItem[] = [];
        try {
          if (!o.items) items = [];
          else if (Array.isArray(o.items)) items = o.items as OrderItem[];
          else if (typeof o.items === "string") items = JSON.parse(o.items) as OrderItem[];
          else items = o.items as OrderItem[];
        } catch (e) {
          items = [];
        }

        return {
          ...o,
          items,
          orderType: o.order_type || o.orderType || o.type,
          branchName: o.branch_name || o.branchName || o.branch,
          timestamp: o.scheduled_at || o.updated_at || o.created_at,
        } as Order;
      });

      setOrders(normalized);
      setFiltered(normalized);
    } catch (err) {
      console.log("loadOrders err", err);
      setOrders([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // optional: subscribe to realtime updates
    // const sub = supabase.from('orders').on('*', payload => loadOrders()).subscribe()
    // return () => supabase.removeSubscription(sub)
  }, [loadOrders]);

  // helper: format date like "19th Nov 2025"
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();

    const suffix = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${suffix(day)} ${month} ${year}`;
  };

  // status config similar to your web helper
  const getStatusConfig = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "delivered")
      return { label: "Order Delivered", color: "#16A34A", icon: "check" };
    if (s === "cancelled") return { label: "Order Cancelled", color: "#EF4444", icon: "x" };
    if (s === "preparing") return { label: "Order Preparing", color: "#3B82F6", icon: "clock" };
    if (s === "confirmed") return { label: "Order Confirmed", color: "#7C3AED", icon: "check" };
    return { label: "Order Received", color: "#0EA5E9", icon: "package" };
  };

  const getOrderTypeLabel = (orderType?: string) => {
    if (!orderType) return "Order";
    if (orderType === "online") return "Online Order";
    if (orderType === "takeaway") return "Takeaway Order";
    if (orderType === "reservation" || orderType === "dinein") return "Dine-In Booking";
    return "Order";
  };

  const canCancel = (order: Order) => {
    const s = (order.status || "").toLowerCase();
    return s !== "delivered" && s !== "completed" && s !== "cancelled";
  };

  const canTrack = (order: Order) => {
    const s = (order.status || "").toLowerCase();
    return s !== "delivered" && s !== "completed" && s !== "cancelled";
  };

  // search + filter
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    const result = orders.filter((o) => {
      // search
      const matchesSearch =
        !q ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.items &&
          Array.isArray(o.items) &&
          o.items.some((it) => (it.name || "").toLowerCase().includes(q)));

      // status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes((o.status || "").toLowerCase());

      // type filter
      const orderType = (o.orderType || o.order_type || o.type || "").toLowerCase();
      const matchesType =
        filters.type.length === 0 ||
        filters.type.includes(orderType) ||
        (orderType === "reservation" && filters.type.includes("dine-in"));

      // date range
      let matchesDate = true;
      if (filters.dateRange !== "all") {
        const ts = new Date(o.timestamp || o.created_at || o.updated_at || "");
        if (isNaN(ts.getTime())) matchesDate = false;
        else {
          if (filters.dateRange === "today") {
            matchesDate = ts.toDateString() === now.toDateString();
          } else if (filters.dateRange === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = ts >= weekAgo;
          } else if (filters.dateRange === "month") {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = ts >= monthAgo;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    // sort newest first (based on timestamp/updated_at/created_at)
    const sorted = result.sort((a, b) => {
      const aT = new Date(a.timestamp || a.updated_at || a.created_at || 0).getTime();
      const bT = new Date(b.timestamp || b.updated_at || b.created_at || 0).getTime();
      return bT - aT;
    });

    setFiltered(sorted);
  }, [searchQuery, filters, orders]);

  // helper to get image for item (placeholder mapping)
  const getMenuItemImage = (name?: string) => {
    // simple hash to pick a placeholder or use a default remote url
    return "https://via.placeholder.com/120x120.png?text=Food";
  };

  // navigation wrappers
  const goToOrder = (orderId: string, isReservation = false) => {
    if (isReservation && onNavigateToBookingDetails) {
      onNavigateToBookingDetails(orderId);
      return;
    }
    if (!isReservation && onNavigateToOrderDetails) {
      onNavigateToOrderDetails(orderId);
      return;
    }
    // fallback to router
    router.push(isReservation ? `/booking/${orderId}` : `/order/${orderId}`);
  };

  // cancel/track stubs
  const handleCancel = async (order: Order) => {
    if (!canCancel(order)) {
      Alert.alert("Cannot cancel this order");
      return;
    }
    Alert.alert("Cancel", "Cancel order functionality not wired. Implement API call here.");
    // Example: call supabase update status to 'cancelled'
  };

  const handleTrack = async (order: Order) => {
    if (!canTrack(order)) {
      Alert.alert("Cannot track this order");
      return;
    }
    Alert.alert("Track", "Track functionality not wired. Implement navigation to tracking page.");
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const order = item;
    const isReservation = (order.orderType || order.order_type || "").toLowerCase() === "reservation" || (order.order_type || "").toLowerCase() === "dinein";
    const statusCfg = getStatusConfig(order.status);
    const typeLabel = getOrderTypeLabel(order.orderType || order.order_type || order.type);
    const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
    const itemCount = Array.isArray(order.items) ? order.items.length : 0;
    const totalGuests = order.guests || 0;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardTop}>
          <Text style={styles.cardType}>{typeLabel}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => goToOrder(order.id, isReservation)}
          style={styles.cardHeader}
        >
          <View style={styles.statusLeft}>
            <View style={[styles.statusCircle, { backgroundColor: `${statusCfg.color}20` }]}>
              <Text style={[styles.statusIcon, { color: statusCfg.color }]}>
                {statusCfg.icon === "check" ? "✓" : statusCfg.icon === "clock" ? "⏱" : statusCfg.icon === "x" ? "×" : "📦"}
              </Text>
            </View>

            <View>
              <Text style={styles.statusLabel}>{statusCfg.label}</Text>
              <Text style={styles.statusSub}>{formatDate(order.timestamp)}</Text>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => goToOrder(order.id, isReservation)}
          style={styles.cardBody}
        >
          {firstItem ? (
            <Image source={{ uri: getMenuItemImage(firstItem.name) }} style={styles.itemImage} />
          ) : (
            isReservation && (
              <View style={styles.reservationPlaceholder}>
                <Text style={{ fontSize: 26 }}>🍽️</Text>
              </View>
            )
          )}

          <View style={styles.itemDetails}>
            {firstItem ? (
              <>
                <Text numberOfLines={1} style={styles.itemTitle}>{firstItem.name}</Text>
                <View style={styles.itemMetaRow}>
                  {itemCount > 1 && <Text style={styles.itemMeta}>+{itemCount - 1} more</Text>}
                  {(!isReservation) && <Text style={styles.itemMeta}>Qty: {firstItem.quantity || 1}</Text>}
                </View>
              </>
            ) : (
              isReservation && (
                <>
                  <Text style={styles.itemTitle}>Table Reservation</Text>
                  <Text style={styles.itemMeta}>{totalGuests} {totalGuests === 1 ? "Guest" : "Guests"} • {order.time_slot || "N/A"}</Text>
                </>
              )
            )}

            <View style={styles.branchRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#FF5733" />
              <Text style={styles.branchText} numberOfLines={1}>{order.branch_name || "Unknown Branch"}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {(canCancel(order) || canTrack(order)) && (
          <View style={styles.actionRow}>
            {canCancel(order) && (
              <TouchableOpacity style={styles.actionBtnAlt} onPress={() => handleCancel(order)}>
                <Text style={styles.actionAltText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {canTrack(order) && (
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => handleTrack(order)}>
                <Text style={styles.actionPrimaryText}>Track</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>₹{(order.total_amount || 0).toFixed(0)}</Text>
          <Text style={styles.footerUpdated}>Updated: {order.updated_at ? new Date(order.updated_at).toLocaleString() : "—"}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>

        {/* Filter / placeholder */}
        <TouchableOpacity style={styles.filterBtn} onPress={() => Alert.alert("Filters", "Implement filter modal")}>
          <Feather name="filter" size={18} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarWrap}>
        <Feather name="search" size={18} color="#9CA3AF" style={{ marginLeft: 12 }} />
        <TextInput
          placeholder="Search orders or items"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingHorizontal: 12 }}>
            <Feather name="x" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listWrap}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF5733" style={{ marginTop: 30 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Feather name="shopping-bag" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? "Try adjusting your search or filters." : "Your order history will appear here."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={renderOrderCard}
            contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "android" ? 120 : 160 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    paddingTop: Platform.OS === "android" ? 18 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 50,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    color: "#111827",
  },

  listWrap: { flex: 1 },

  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  cardTop: { padding: 12, paddingBottom: 8 },
  cardType: { fontWeight: "700", color: "#111827" },

  cardHeader: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusIcon: { fontSize: 18, fontWeight: "700" },
  statusLabel: { fontWeight: "700", color: "#111827" },
  statusSub: { fontSize: 12, color: "#6B7280" },

  cardBody: { flexDirection: "row", paddingHorizontal: 12, paddingBottom: 12, gap: 12, alignItems: "center" },

  itemImage: { width: 72, height: 72, borderRadius: 12, resizeMode: "cover" },
  reservationPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#FFF3EE",
    alignItems: "center",
    justifyContent: "center",
  },

  itemDetails: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  itemMetaRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  itemMeta: { fontSize: 12, color: "#6B7280" },

  branchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  branchText: { color: "#374151", fontSize: 13 },

  actionRow: { flexDirection: "row", justifyContent: "center", gap: 10, padding: 12 },
  actionBtnAlt: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  actionAltText: { color: "#374151", fontWeight: "600" },
  actionBtnPrimary: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5733",
  },
  actionPrimaryText: { color: "#fff", fontWeight: "700" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
    gap: 10,
  },
  footerLabel: { color: "#6B7280" },
  footerValue: { fontWeight: "700", color: "#111827" },
  footerUpdated: { color: "#9CA3AF", fontSize: 12, flex: 1, textAlign: "right" },

  emptyWrap: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 12, color: "#111827" },
  emptySub: { fontSize: 13, color: "#6B7280", marginTop: 6, textAlign: "center", paddingHorizontal: 32 },
});
