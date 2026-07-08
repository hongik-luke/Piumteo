export interface AuthSession {
  userId: number;
  email: string;
  nickname: string;
  role: "MEMBER" | "ADMIN";
  accessToken: string | null;
}
