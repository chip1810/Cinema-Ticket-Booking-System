const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const seatService = {

  async getSeatsByShowtime(uuid) {

    const res = await fetch(
      `${BASE_URL}/api/seat/showtimes/showtimeUuid/${uuid}/seats`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch seats");
    }

    const json = await res.json();

    return json.data; // chỉ trả data
  },

  async holdSeats(showtimeUUID, seatUUIDs) {

    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/seat/hold`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify({
        showtimeUUID,
        seatUUIDs
      })
    });

    if (!res.ok) {
      throw new Error("Failed to hold seats");
    }

    return res.json();
  }

};