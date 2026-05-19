export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  foyerId: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  foyerNom?: string;
}
