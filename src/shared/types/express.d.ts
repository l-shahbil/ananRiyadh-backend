
declare namespace Express {
  interface Request {
     user?: {
        id: string;
        role: Role;
        name:string;
        isAdmin: boolean;
  }
}
}
