import { AppDataSource } from "../../../data-source";
import { User, UserRole } from "../../auth/models/User";
import * as bcrypt from "bcryptjs";

export class StaffManagementService {

    private userRepo = AppDataSource.getRepository(User);

    // Tạo staff
    async createStaff(data: any) {

        const existing = await this.userRepo.findOne({
            where: { email: data.email }
        });

        if (existing) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const staff = this.userRepo.create({
            email: data.email,
            password: hashedPassword,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role: UserRole.STAFF,
            isBlocked: false
        });

        return await this.userRepo.save(staff);
    }

    // Lấy danh sách staff
    async getAllStaff() {
        return await this.userRepo.find({
            where: { role: UserRole.STAFF },
            select: ["id", "email", "fullName", "phoneNumber", "isBlocked"]
        });
    }
}