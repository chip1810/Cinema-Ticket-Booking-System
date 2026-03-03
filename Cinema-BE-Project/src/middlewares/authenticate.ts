import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse";
import { UserRole } from "../modules/auth/models/User";
import { AuthUser } from "../types/auth-user";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthPayload extends JwtPayload {
  id: number;
  email: string;
  role: string;
}

// 👇 TẠO TYPE MỚI
interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = (
  req: AuthRequest,   // 👈 dùng AuthRequest
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.error(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  } catch {
    return ApiResponse.error(res, "Invalid token", 401);
  }
};