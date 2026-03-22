// auth.controller.js
const AuthService = require("../services/auth.service");
const ApiResponse = require("../../../utils/ApiResponse");

const authService = new AuthService();

class AuthController {
  async register(req, res) {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, "Email and password are required", 400);
    }

    try {
      const result = await authService.register({ email, password, fullName });
      return ApiResponse.success(res, result, "Register successfully", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, "Email and password are required", 400);
    }

    try {
      const result = await authService.login({ email, password });
      return ApiResponse.success(res, result, "Login successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 401);
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.error(res, "Email is required", 400);
    }

    try {
      const result = await authService.forgotPassword(email);
      return ApiResponse.success(res, result, "OTP sent to email");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async resetPassword(req, res) {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return ApiResponse.error(res, "Email, token and newPassword are required", 400);
    }

    try {
      const result = await authService.resetPassword({ email, token, newPassword });
      return ApiResponse.success(res, result, "Password reset successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }
}

module.exports = AuthController;