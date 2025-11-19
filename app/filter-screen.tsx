import { Feather } from "@expo/vector-icons"; // <-- Expo Icons
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export type FilterOptions = {
  cuisines: string[];
  priceRange: [number, number];
  minRating: number;
  dietary: "all" | "veg" | "non-veg";
  dealsOnly: boolean;
};

type Props = {
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onBack: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
};

const CUISINES = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Continental",
  "Thai",
  "Beverages",
];

const RATINGS = [
  { value: 0, label: "Any" },
  { value: 3, label: "3.0+" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
];

export default function FilterScreen({
  filters = {
    cuisines: [],
    priceRange: [0, 100],
    minRating: 0,
    dietary: "all",
    dealsOnly: false,
  },
  onApplyFilters,
  onBack,
  searchQuery = "",
  onSearchChange,
}: Props) {
  const DEFAULT_FILTERS: FilterOptions = {
    cuisines: [],
    priceRange: [0, 100],
    minRating: 0,
    dietary: "all",
    dealsOnly: false,
  };

  const mergedFilters: FilterOptions = {
    ...DEFAULT_FILTERS,
    ...filters,
    cuisines: filters?.cuisines ?? [],
    priceRange: filters?.priceRange ?? [0, 100],
  };

  const [tempFilters, setTempFilters] = useState<FilterOptions>(mergedFilters);
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);

  const toggleCuisine = (cuisine: string) => {
    setTempFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onSearchChange?.(tempSearchQuery);
    onBack();
  };

  const handleClearAll = () => {
    setTempFilters({
      cuisines: [],
      priceRange: [0, 100],
      minRating: 0,
      dietary: "all",
      dealsOnly: false,
    });
    setTempSearchQuery("");
  };

  const activeFilterCount =
    tempFilters.cuisines.length +
    (tempFilters.minRating > 0 ? 1 : 0) +
    (tempFilters.dietary !== "all" ? 1 : 0) +
    (tempFilters.dealsOnly ? 1 : 0) +
    (tempFilters.priceRange[0] > 0 || tempFilters.priceRange[1] < 100 ? 1 : 0) +
    (tempSearchQuery.trim() ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#000" />
        </Pressable>
        <View>
          <Text style={styles.title}>Filters</Text>
          <Text style={styles.subtitle}>Customize your search results</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Search */}
        <Text style={styles.sectionTitle}>Search</Text>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            value={tempSearchQuery}
            onChangeText={setTempSearchQuery}
            placeholder="Search for dishes..."
            style={styles.input}
          />
        </View>

        {/* Cuisine */}
        <Text style={styles.sectionTitle}>Cuisine</Text>
        <View style={styles.wrapRow}>
          {CUISINES.map((c) => {
            const selected = tempFilters.cuisines.includes(c);
            return (
              <Pressable
                key={c}
                onPress={() => toggleCuisine(c)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <View style={styles.chipRow}>
                  {selected && <Feather name="check" size={14} color="#fff" />}
                  <Text
                    style={[styles.chipText, selected && { color: "#fff" }]}
                  >
                    {c}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Price Range */}
        <Text style={styles.sectionTitle}>Price Range</Text>
        <View style={styles.box}>
          <Slider
            value={tempFilters.priceRange[1]}
            onValueChange={(v) =>
              setTempFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], Math.round(v)],
              }))
            }
            minimumValue={0}
            maximumValue={100}
            step={5}
          />
          <View style={styles.priceRow}>
            <Text>₹{tempFilters.priceRange[0]}</Text>
            <Text>₹{tempFilters.priceRange[1]}</Text>
          </View>
        </View>

        {/* Rating */}
        <Text style={styles.sectionTitle}>Rating</Text>
        <View style={styles.grid4}>
          {RATINGS.map((r) => {
            const selected = tempFilters.minRating === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() =>
                  setTempFilters((prev) => ({ ...prev, minRating: r.value }))
                }
                style={[styles.optionBox, selected && styles.optionBoxSelected]}
              >
                <Text
                  style={[styles.optionLabel, selected && { color: "#fff" }]}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Dietary */}
        <Text style={styles.sectionTitle}>Dietary Preference</Text>
        <View style={styles.grid3}>
          {(["all", "veg", "non-veg"] as const).map((opt) => {
            const selected = tempFilters.dietary === opt;
            const label =
              opt === "all" ? "All" : opt === "veg" ? "🟢 Veg" : "🔴 Non-Veg";

            return (
              <Pressable
                key={opt}
                onPress={() =>
                  setTempFilters((prev) => ({ ...prev, dietary: opt }))
                }
                style={[styles.optionBox, selected && styles.optionBoxSelected]}
              >
                <Text
                  style={[styles.optionLabel, selected && { color: "#fff" }]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Deals */}
        <Pressable
          onPress={() =>
            setTempFilters((prev) => ({
              ...prev,
              dealsOnly: !prev.dealsOnly,
            }))
          }
          style={[
            styles.dealsBox,
            tempFilters.dealsOnly && styles.optionBoxSelected,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text
              style={[
                styles.dealsText,
                tempFilters.dealsOnly && { color: "#fff" },
              ]}
            >
              🎉 Deals & Offers
            </Text>
            {tempFilters.dealsOnly && (
              <Feather name="check" size={20} color="#fff" />
            )}
          </View>
        </Pressable>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable onPress={handleClearAll} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>

        <Pressable onPress={handleApply} style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply Filters</Text>

          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backBtn: { padding: 8, marginRight: 10 },
  title: { fontSize: 20, fontWeight: "600", color: "#000" },
  subtitle: { fontSize: 12, color: "#666" },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 16, marginBottom: 8, fontWeight: "500" },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: 45 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#FF5733", borderColor: "#FF5733" },
  chipText: { fontSize: 13, color: "#333" },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  box: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  grid4: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  grid3: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  optionBox: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  optionBoxSelected: {
    backgroundColor: "#FF5733",
    borderColor: "#FF5733",
  },
  optionLabel: { fontSize: 14, color: "#333" },
  dealsBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 15,
  },
  dealsText: { fontSize: 15, color: "#333" },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearText: { fontSize: 15, color: "#333" },
  applyBtn: {
    flex: 1,
    backgroundColor: "#FF5733",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  applyText: { color: "#fff", fontSize: 15 },
  badge: {
    marginLeft: 6,
    backgroundColor: "#fff",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#FF5733", fontSize: 12, fontWeight: "600" },
});
