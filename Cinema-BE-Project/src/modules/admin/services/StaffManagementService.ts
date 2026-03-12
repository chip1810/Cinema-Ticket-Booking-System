import { AppDataSource } from "../../../data-source";
import { User, UserRole } from "../../auth/models/User";
import * as bcrypt from "bcryptjs";
import { In } from "typeorm";

export class StaffManagementService {

    private userRepo = AppDataSource.getRepository(User);

    // Tạo tài khoản nhân sự (STAFF hoặc MANAGER)
    async createStaff(data: {
        email: string;
        password: string;
        fullName?: string;
        phoneNumber?: string;
        role?: UserRole;
    }) {

        const existing = await this.userRepo.findOne({
            where: { email: data.email }
        });

        if (existing) {
            throw new Error("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const role =
            data.role && [UserRole.STAFF, UserRole.MANAGER].includes(data.role)
                ? data.role
                : UserRole.STAFF;

        const staff = this.userRepo.create({
            email: data.email,
            password: hashedPassword,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            role,
            isBlocked: false
        });

        return await this.userRepo.save(staff);
    }

    // Lấy danh sách staff + manager
    async getAllStaff() {
        return await this.userRepo.find({
            where: {
                role: In([UserRole.STAFF, UserRole.MANAGER])
            },
            select: ["id", "email", "fullName", "phoneNumber", "role", "isBlocked"]
        });
    }
}