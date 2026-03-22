const Hall = require("../modules/hall/models/Hall");
const Seat = require("../modules/seat/models/Seat");
const SeatType = require("../modules/seat/models/enums/SeatType");

const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// tìm hall theo UUID (Mongo không dùng id number nữa)
const findHall = async (hallUUID) => {
  const hall = await Hall.findOne({ UUID: hallUUID });
  if (!hall) throw new Error("Hall not found");
  return hall;
};

const hallManagerService = {

  // GET ALL
  getAllHalls: async () => {
    return await Hall.find().sort({ name: 1 });
  },

  // GET BY UUID + seats
  async getHallById(hallUUID) {
    const hall = await findHall(hallUUID);

    const seats = await Seat.find({ hall: hall._id })
      .sort({ row: 1, col: 1 });

    return {
      ...hall.toObject(),
      seats,
    };
  },

  // CREATE
  async createHall(data) {
    const exists = await Hall.findOne({ name: data.name });
    if (exists) throw new Error(`Hall "${data.name}" already exists`);

    const hall = new Hall(data);
    return await hall.save();
  },

  // UPDATE
  async updateHall(hallUUID, data) {
    const hall = await findHall(hallUUID);

    Object.assign(hall, data);
    return await hall.save();
  },

  // DELETE
  async deleteHall(hallUUID) {
    const hall = await findHall(hallUUID);

    await Seat.deleteMany({ hall: hall._id }); // xóa ghế trước
    await Hall.deleteOne({ _id: hall._id });

    return { message: "Hall deleted" };
  },

  // SET SEAT LAYOUT
  // Body: { seats: [{row, col, type}] }
  async setSeatLayout(hallUUID, seats) {
    const hall = await findHall(hallUUID);

    // xóa toàn bộ ghế cũ
    await Seat.deleteMany({ hall: hall._id });

    if (!seats || !seats.length) {
      hall.capacity = 0;
      await hall.save();
      return { total: 0, seats: [] };
    }

    // validate seatType
    const validTypes = Object.values(SeatType);

    const newSeats = seats.map(({ row, col, type }) => {
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid seat type: ${type}`);
      }

      return {
        seatNumber: `${ROW_LABELS[row - 1] || `R${row}`}${col}`,
        row,
        col,
        type,
        hall: hall._id,
      };
    });

    const created = await Seat.insertMany(newSeats);

    // update capacity
    hall.capacity = created.length;
    await hall.save();

    return {
      total: created.length,
      seats: created.map((s) => ({
        UUID: s.UUID,
        seatNumber: s.seatNumber,
        row: s.row,
        col: s.col,
        type: s.type,
      })),
    };
  },

  // GET SEAT LAYOUT (matrix)
  async getSeatLayout(hallUUID) {
    const hall = await findHall(hallUUID);

    const seats = await Seat.find({ hall: hall._id })
      .sort({ row: 1, col: 1 })
      .lean();

    const rowMap = {};

    for (const s of seats) {
      const r = s.row || 0;

      if (!rowMap[r]) rowMap[r] = [];

      rowMap[r].push({
        UUID: s.UUID,
        seatNumber: s.seatNumber,
        col: s.col,
        type: s.type,
      });
    }

    return {
      hall: {
        UUID: hall.UUID,
        name: hall.name,
        type: hall.type,
        capacity: hall.capacity,
      },
      totalSeats: seats.length,
      matrix: Object.entries(rowMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([row, seats]) => ({
          row: Number(row),
          seats,
        })),
    };
  },
};

module.exports = hallManagerService;