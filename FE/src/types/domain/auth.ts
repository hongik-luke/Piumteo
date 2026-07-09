export interface AuthSession {
  userId: number;
  email?: string | null;
  nickname: string;
  role: "MEMBER" | "ADMIN";
  accessToken: string | null;
}
