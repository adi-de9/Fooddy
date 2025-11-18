import {
  Feather,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const user = {
    name: "Guest User",
    mobile: "+91 98765 43210",
  };

  const ordersCount = 8;
  const reservationsCount = 5;

  const handleLogout = () => {
    console.log("Logout pressed");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={32} color="white" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <View style={styles.phoneRow}>
                  <SimpleLineIcons name="phone" size={15} color="black" />
                  <Text style={styles.phoneText}>{user.mobile}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Overview</Text>
            <View style={styles.statsGrid}>
              {/* Online Orders */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, styles.greenBg]}>
                  <Feather name="shopping-bag" size={28} color={"gray"} />
                </View>
                <Text style={styles.statNumber}>{ordersCount}</Text>
                <Text style={styles.statLabel}>Online Orders</Text>
              </View>

              {/* Reservations */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, styles.blueBg]}>
                  <Feather name="calendar" size={28} color={"gray"} />
                </View>
                <Text style={styles.statNumber}>{reservationsCount}</Text>
                <Text style={styles.statLabel}>Reservations</Text>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Information</Text>
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>{user.mobile}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>Nagpur, Maharashtra</Text>
              </View>
              <View style={[styles.infoRow, styles.lastRow]}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>November 2025</Text>
              </View>
            </View>
          </View>

          {/* Restaurant Info */}
          <View style={styles.restaurantCard}>
            <Text style={styles.restaurantName}>Moti Mahal</Text>
            <Text style={styles.restaurantSubtitle}>
              Authentic North Indian & Chinese Cuisine
            </Text>
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantDetailText}>
                📍 Nagpur, Maharashtra
              </Text>
              <Text style={styles.restaurantDetailText}>
                📞 +91 98765 00000
              </Text>
              <Text style={styles.restaurantDetailText}>
                🕒 11:00 AM - 11:00 PM
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#FF5733" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileCard: {
    backgroundColor: "#fff5f2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF5733",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  iconText: {
    fontSize: 36,
    color: "#ffffff",
  },
  smallIcon: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  greenBg: {
    backgroundColor: "#d1fae5",
  },
  blueBg: {
    backgroundColor: "#dbeafe",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  restaurantCard: {
    backgroundColor: "#fff5f2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fed7aa",
    marginBottom: 32,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  restaurantSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  restaurantDetails: {
    gap: 8,
  },
  restaurantDetailText: {
    fontSize: 14,
    color: "#374151",
  },
  logoutButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#FF5733",
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5733",
  },
});

export default ProfileScreen;
