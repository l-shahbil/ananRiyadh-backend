
declare namespace Express {
  interface Request {
     user?: {
        id: string;
        role: string;
        name:string;
        isAdmin: boolean;
  }
}
}
