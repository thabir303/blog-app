"use client";

import Link from "next/link";
import { Post } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { canDeletePost, canUpdatePost } from "@/utils/permissions";
import { postsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RoleChip from "@/components/RoleChip";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Pencil, Trash2, MessageSquare, CalendarDays } from "lucide-react";

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

interface Props {
  post: Post;
  onDeleted?: () => void;
}

export default function PostCard({ post, onDeleted }: Props) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const showEdit = user && canUpdatePost(user.role, post.owner_id, user.id);
  const showDelete = user && canDeletePost(user.role, post.owner_id, user.id);
  const avatarColor = AVATAR_PALETTE[post.owner.username.charCodeAt(0) % AVATAR_PALETTE.length];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await postsApi.delete(post.id, token);
      setDeleteOpen(false);
      onDeleted?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <CardContent className="p-5">
        {/* Title + actions */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/posts/${post.id}`} className="block">
              <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug truncate mb-1.5">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {post.content}
              </p>
            </Link>
          </div>

          {(showEdit || showDelete) && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {showEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.preventDefault(); router.push(`/posts/${post.id}?edit=true`); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteOpen}
          title="Delete post?"
          description="This will permanently remove the post and all of its comments. This action cannot be undone."
          confirmLabel="Delete post"
          loading={deleting}
          onConfirm={confirmDelete}
          onOpenChange={setDeleteOpen}
        />

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className={`text-white text-xs font-semibold ${avatarColor}`}>
              {post.owner.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{post.owner.username}</span>
          <RoleChip role={post.owner.role} iconOnly />

          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="h-3 w-3" />
              Comments
            </Link>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
