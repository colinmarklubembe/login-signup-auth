// types.d.ts
import { Session } from "express-session";

interface LoginSession extends Session {
  admin?: {
    id: any;
    name: string;
    email: string;
  };
  user?: {
    id: any;
    name: string;
    email: string;
  };
}

declare module "express-session" {
  interface Session {
    admin?: {
      id: any;
      name: string;
      email: string;
    };
    user?: {
      id: any;
      name: string;
      email: string;
    };
  }
}

export { LoginSession };
