import { AppDataSource } from "../../../data-source";
import { Hall, HallType } from "../models/Hall";
import { Seat } from "../../seat/models/Seat";
import { SeatType } from "../../seat/models/enums/SeatType";

const hallRepo = AppDataSource.getRepository(Hall);
const seatRepo = AppDataSource.getRepository(Seat);
const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface SeatConfig { row: number; col: number; type: SeatType; }

const findHall = async (id: number) => {
    const hall = await hallRepo.findOneBy({ id });
    if (!hall) throw new Error("Hall not found");
    return hall;
};

export const hallManagerService = {
    getAllHalls: () => hallRepo.find({ order: { name: "ASC" } }),

    async getHallById(id: number) {
        const hall = await findHall(id);
        const seats = await seatRepo.find({ where: { hallId: id }, order: { row: "ASC", col: "ASC" } });
        return { ...hall, seats };
    },

    async createHall(data: { name: string; type: string; capacity: number }) {
        if (await hallRepo.findOneBy({ name: data.name }))
            throw new Error(`Hall "${data.name}" already exists`);
        
        const hallData = {
            ...data,
            type: data.type as HallType
        };

        return hallRepo.save(hallRepo.create(hallData));
    },

    async updateHall(id: number, data: Partial<{ name: string; type: string; capacity: number }>) {
        const hall = await findHall(id);
        
        const hallData: Partial<Hall> = { 
            ...data,
            type: data.type ? data.type as HallType : undefined
        };

        Object.assign(hall, hallData);
        return hallRepo.save(hall);
    },

    async deleteHall(id: number) {
        return hallRepo.remove(await findHall(id));
    },

    // Ghi đè toàn bộ sơ đồ ghế. Body: { seats: [{row, col, type}] }
    // seatNumber tự sinh theo quy tắc: hàng A-Z + cột số (A1, A2, B1...)
    async setSeatLayout(hallId: number, seats: SeatConfig[]) {
        const hall = await findHall(hallId);
        await seatRepo.delete({ hallId });

        if (!seats?.length) return { total: 0, seats: [] };

        const created = await seatRepo.save(
            seats.map(({ row, col, type }) =>
                seatRepo.create({
                    seatNumber: `${ROW_LABELS[row - 1] ?? `R${row}`}${col}`,
                    row, col, type, hallId,
                })
            )
        );

        hall.capacity = created.length;
        await hallRepo.save(hall);

        return {
            total: created.length,
            seats: created.map(({ UUID, seatNumber, row, col, type }) => ({ UUID, seatNumber, row, col, type })),
        };
    },

    // Trả về sơ đồ ghế dạng matrix [{row, seats:[]}]
    async getSeatLayout(hallId: number) {
        const hall = await findHall(hallId);
        const seats = await seatRepo.find({ where: { hallId }, order: { row: "ASC", col: "ASC" } });

        const rowMap = seats.reduce((map, s) => {
            const r = s.row ?? 0;
            if (!map[r]) map[r] = [];
            map[r].push({ UUID: s.UUID, seatNumber: s.seatNumber, col: s.col, type: s.type });
            return map;
        }, {} as Record<number, any[]>);

        return {
            hall: { id: hall.id, name: hall.name, type: hall.type, capacity: hall.capacity },
            totalSeats: seats.length,
            matrix: Object.entries(rowMap)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([row, seats]) => ({ row: Number(row), seats })),
        };
    },
};
