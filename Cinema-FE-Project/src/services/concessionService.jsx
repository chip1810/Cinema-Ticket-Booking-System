const BASE_URL = `http://localhost:3000`;

export const concessionService = {

  // GET /api/concessions — lấy tất cả
  async getAll() {
    const res = await fetch(`${BASE_URL}/api/concessions`);

    if (!res.ok) {
      throw new Error("Failed to fetch concessions");
    }

    return res.json();
  },

  // GET /api/concessions/:id — lấy theo id (số nguyên)
  async getById(id) {
    const res = await fetch(`${BASE_URL}/api/concessions/${id}`);

    if (!res.ok) {
      throw new Error("Failed to fetch concession");
    }

    return res.json();
  },

};