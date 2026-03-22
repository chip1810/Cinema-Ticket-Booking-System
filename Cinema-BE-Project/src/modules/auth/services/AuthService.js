// auth.service.js
const { User } = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "cinema_secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

class AuthService {
  async register(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error("Email đã tồn tại");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken: token, refreshToken: token };
  }

  async login(data) {
    const user = await User.findOne({ email: data.email });
    if (!user) throw new Error("Thông tin đăng nhập không hợp lệ");

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new Error("Thông tin đăng nhập không hợp lệ");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Người dùng không tồn tại");

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.resetPasswordOTP = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    await user.save();

    // DEV only: log OTP, trong production gửi email
    console.log(`[DEV] Reset OTP for ${email}: ${resetToken}`);

    return { message: "OTP đang được gửi tới bạn" };
  }

  async resetPassword(data) {
    const user = await User.findOne({ email: data.email });
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
    await user.save();

    return { message: "Mật khẩu đã được cập nhật" };
  }
}

module.exports = AuthService;