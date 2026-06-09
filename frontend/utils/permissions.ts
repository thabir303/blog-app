import { UserRole } from "@/lib/types";

export const canCreatePost = (role: UserRole) =>
  role === "super_admin" || role === "moderator" || role === "regular_user";

export const canUpdatePost = (role: UserRole, postOwnerId: number, userId: number) =>
  role === "super_admin" || (role === "regular_user" && postOwnerId === userId);

export const canDeletePost = (role: UserRole, postOwnerId: number, userId: number) =>
  role === "super_admin" ||
  role === "moderator" ||
  (role === "regular_user" && postOwnerId === userId);

export const canCreateComment = (role: UserRole) =>
  role === "super_admin" || role === "moderator" || role === "regular_user";

export const canDeleteComment = (
  role: UserRole,
  commentOwnerId: number,
  postOwnerId: number,
  userId: number
) =>
  role === "super_admin" ||
  role === "moderator" ||
  postOwnerId === userId ||
  commentOwnerId === userId;

export const canUpdateComment = (role: UserRole, commentOwnerId: number, userId: number) =>
  role === "super_admin" || commentOwnerId === userId;

export const canManageUsers = (role: UserRole) => role === "super_admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  regular_user: "Regular User",
  guest: "Guest",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-red-100 text-red-800",
  moderator: "bg-purple-100 text-purple-800",
  regular_user: "bg-blue-100 text-blue-800",
  guest: "bg-gray-100 text-gray-800",
};
