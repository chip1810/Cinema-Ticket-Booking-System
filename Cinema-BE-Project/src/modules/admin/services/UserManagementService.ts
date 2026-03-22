import { AppDataSource } from "../../../mongo";
import { User, UserRole } from "../../auth/models/User";

export class UserManagementService {

    private userRepo = AppDataSource.getRepository(User);

    // Lấy danh sách khách hàng
    async getAllCustomers() {
        return await this.userRepo.find({
            where: { role: UserRole.CUSTOMER },
            select: ["id", "email", "fullName", "phoneNumber", "isBlocked"]
        });
    }

    // Khóa tài khoản
    async blockUser(userId: string) {

        const id = Number(userId);

        const user = await this.userRepo.findOne({
            where: { id }
        });

        if (!user) {
            throw new Error("User not found");
        }

        user.isBlocked = true;

        return await this.userRepo.save(user);
    }
}