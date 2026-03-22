// src/services/staffService.js
const BASE_URL = "http://localhost:3000/api/staff";

export const staffService = {

  // 🔹 Lookup customer theo phoneNumber
  async lookupCustomer(phoneNumber) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/customers/${phoneNumber}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch customer");
    }

    const json = await res.json();
    return json.data; // chỉ trả về data
  },

  // 🔹 Lookup order theo orderId
  async lookupOrder(orderId) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch order");
    }

    const json = await res.json();
    return json.data;
  },

  // 🔹 Lấy profile staff dựa trên JWT
  async getProfile() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/profile`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch staff profile");
    }

    const json = await res.json();
    return json.data;
  }

};