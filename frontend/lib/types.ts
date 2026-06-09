export type UserRole = "super_admin" | "moderator" | "regular_user" | "guest";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  owner: User;
  created_at: string;
  updated_at: string | null;
}

export interface Comment {
  id: number;
  content: string;
  post_id: number;
  owner_id: number;
  owner: User;
  created_at: string;
  updated_at: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
