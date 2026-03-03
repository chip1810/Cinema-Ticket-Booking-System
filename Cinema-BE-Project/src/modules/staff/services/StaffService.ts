import { Repository } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { User, UserRole } from "../../auth/models/User";

export class StaffService {
    private userRepo: Repository<User>;

    constructor() {
        this.userRepo = AppDataSource.getRepository(User);
    }

    // 🔎 Tra cứu khách hàng theo SĐT
    async lookupCustomerByPhone(phoneNumber: string) {
        const customer = await this.userRepo.findOne({
            where: {
                phoneNumber,
                role: UserRole.CUSTOMER,
            },
        });

        if (!customer) {
            throw new Error("Customer not found");
        }

        // Loại bỏ thông tin nhạy cảm
        const {
            password,
            resetPasswordOTP,
            resetPasswordExpires,
            ...safeCustomer
        } = customer;

        return safeCustomer;
    }
}