// src/types/auth-user.ts

import { UserRole } from "../modules/auth/models/User";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}