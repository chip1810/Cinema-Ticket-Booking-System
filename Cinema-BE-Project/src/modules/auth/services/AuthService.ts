import { AppDataSource } from "../../../data-source";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RegisterDTO, LoginDTO, ResetPasswordDTO } from "../dtos/Auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";
const JWT_EXPIRE = (process.env.JWT_EXPIRE || "7d") as any;

export class AuthService {
    private userRepo = AppDataSource.getRepository(User);

    async register(data: RegisterDTO) {
        const existing = await this.userRepo.findOneBy({ email: data.email });
        if (existing) throw new Error("Email đã tồn tại");

        const user = this.userRepo.create({
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            fullName: data.fullName,
        });
        await this.userRepo.save(user);
        const { password, ...result } = user;
        return result;
    }

    async login(data: LoginDTO) {
        const user = await this.userRepo.findOneBy({ email: data.email });

        if (!user) {
            throw new Error("Thông tin đăng nhập không hợp lệ");
        }

        const isMatch = await bcrypt.compare(data.password, user.password);

        if (!isMatch) {
            throw new Error("Thông tin đăng nhập không hợp lệ");
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        const { password, ...userInfo } = user;

        return { user: userInfo, token };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user) throw new Error("Người dùng không tồn tại");

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        user.resetPasswordOTP = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await this.userRepo.save(user);

        // In production, send email here with the OTP
        console.log(`[DEV] Reset OTP for ${email}: ${resetToken}`);

        return { message: "OTP đang được gửi tới bạn" };
    }

    async resetPassword(data: ResetPasswordDTO) {
        const user = await this.userRepo.findOneBy({ email: data.email });
        if (!user) throw new Error("Người dùng không tồn tại");

        if (
            user.resetPasswordOTP !== data.token ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < new Date()
        ) {
            throw new Error("OTP không hợp lệ hoặc đã hết hạn");
        }

        user.password = await bcrypt.hash(data.newPassword, 10);
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await this.userRepo.save(user);
        return { message: "Mật khẩu đã được cập nhật" };
    }
}
