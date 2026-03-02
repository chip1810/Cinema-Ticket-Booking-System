import { User } from "../modules/auth/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}