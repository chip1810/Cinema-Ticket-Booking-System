const mongoose = require("mongoose");
const Hall = require("../modules/hall/models/Hall");
const { Seat, SeatType } = require("../modules/seat/models/Seat");

const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findHall = async (id) => {
  const hall = await Hall.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
  if (!hall) throw new Error("Hall not found");
  return hall;
};

const hallManagerService = {
  getAllHalls: () => Hall.find().sort({ name: 1 }),

  async getHallById(id) {
    const hall = await findHall(id);
    const seats = await Seat.find({ hall: hall._id }).sort({ row: 1, col: 1 });
    return { ...hall.toObject(), seats };
  },

  async createHall(data) {
    if (await Hall.findOne({ name: data.name })) {
      throw new Error(`Hall "${data.name}" already exists`);
    }
    const hall = new Hall({
      name: data.name,
      type: data.type,
      capacity: data.capacity,
    });
    return hall.save();
  },

  async updateHall(id, data) {
    const hall = await findHall(id);
    Object.assign(hall, data);
    return hall.save();
  },

  async deleteHall(id) {
    const hall = await findHall(id);
    await Seat.deleteMany({ hall: hall._id });
    return Hall.deleteOne({ _id: hall._id });
  },

  async setSeatLayout(hallId, seats) {
    const hall = await findHall(hallId);
    await Seat.deleteMany({ hall: hall._id });

    if (!seats?.length) return { total: 0, seats: [] };

    const created = await Seat.insertMany(
      seats.map(({ row, col, type }) => ({
        seatNumber: `${ROW_LABELS[row - 1] ?? `R${row}`}${col}`,
        row,
        col,
        type: type || SeatType.NORMAL,
        hall: hall._id,
      }))
    );

    hall.capacity = created.length;
    await hall.save();

    return {
      total: created.length,
      seats: created.map(({ UUID, seatNumber, row, col, type }) => ({ UUID, seatNumber, row, col, type })),
    };
  },

  async getSeatLayout(hallId) {
    const hall = await findHall(hallId);
    const seats = await Seat.find({ hall: hall._id }).sort({ row: 1, col: 1 });

    const rowMap = seats.reduce((map, s) => {
      const r = s.row ?? 0;
      if (!map[r]) map[r] = [];
      map[r].push({ UUID: s.UUID, seatNumber: s.seatNumber, col: s.col, type: s.type });
      return map;
    }, {});

    return {
      hall: { id: hall.UUID, name: hall.name, type: hall.type, capacity: hall.capacity },
      totalSeats: seats.length,
      matrix: Object.entries(rowMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([row, seats]) => ({ row: Number(row), seats })),
    };
  },
};

module.exports = { hallManagerService };
