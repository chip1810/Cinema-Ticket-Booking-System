const BASE_URL = `http://localhost:3000`;

export const seatService = {

  async getSeatsByShowtime(uuid) {

    const res = await fetch(`${BASE_URL}/api/seat/showtimes/showtimeUuid/${uuid}/seats`);

    if (!res.ok) {
      throw new Error("Failed to fetch seats");
    }

    return res.json();
  }

};