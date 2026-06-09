import { AuthToken, Comment, PaginatedResponse, Post, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (username: string, email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  getMe: (token: string) => request<User>("/auth/me", {}, token),
};

export const postsApi = {
  list: (page = 1, limit = 10) =>
    request<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`),

  get: (id: number) => request<Post>(`/posts/${id}`),

  create: (data: { title: string; content: string }, token: string) =>
    request<Post>("/posts", { method: "POST", body: JSON.stringify(data) }, token),

  update: (id: number, data: { title?: string; content?: string }, token: string) =>
    request<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),

  delete: (id: number, token: string) =>
    request<void>(`/posts/${id}`, { method: "DELETE" }, token),
};

export const commentsApi = {
  list: (postId: number) => request<Comment[]>(`/posts/${postId}/comments`),

  create: (postId: number, content: string, token: string) =>
    request<Comment>(
      `/posts/${postId}/comments`,
      { method: "POST", body: JSON.stringify({ content }) },
      token
    ),

  update: (postId: number, commentId: number, content: string, token: string) =>
    request<Comment>(
      `/posts/${postId}/comments/${commentId}`,
      { method: "PUT", body: JSON.stringify({ content }) },
      token
    ),

  delete: (postId: number, commentId: number, token: string) =>
    request<void>(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" }, token),
};

export const usersApi = {
  list: (token: string, page = 1, limit = 10) =>
    request<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`, {}, token),

  update: (
    id: number,
    data: { role?: string; is_active?: boolean },
    token: string
  ) => request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),

  delete: (id: number, token: string) =>
    request<void>(`/users/${id}`, { method: "DELETE" }, token),
};
