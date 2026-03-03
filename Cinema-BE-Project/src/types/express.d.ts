// src/types/express.d.ts

import { AuthUser } from "./auth-user";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}