"use client";

import { useState } from "react";
import { Comment, Post } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { canDeleteComment, canUpdateComment } from "@/utils/permissions";
import { commentsApi } from "@/lib/api";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Pencil } from "lucide-react";

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

interface Props {
  comment: Comment;
  post: Post;
  onDeleted: () => void;
  onUpdated: (updated: Comment) => void;
}

export default function CommentCard({ comment, post, onDeleted, onUpdated }: Props) {
  const { user, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const showEdit = user && canUpdateComment(user.role, comment.owner_id, user.id);
  const showDelete = user && canDeleteComment(user.role, comment.owner_id, post.owner_id, user.id);
  const avatarColor = AVATAR_PALETTE[comment.owner.username.charCodeAt(0) % AVATAR_PALETTE.length];

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await commentsApi.delete(post.id, comment.id, token);
      setDeleteOpen(false);
      onDeleted();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editContent.trim()) return;
    setSaving(true);
    try {
      const updated = await commentsApi.update(post.id, comment.id, editContent.trim(), token);
      onUpdated(updated);
      setEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const formattedTime = new Date(comment.created_at).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="group flex gap-3 py-3">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback className={`text-white text-xs font-semibold ${avatarColor}`}>
          {comment.owner.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{comment.owner.username}</span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
          {!editing && (showEdit || showDelete) && (
            <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {showEdit && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditing(true)}>
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              autoFocus
              className="resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setEditing(false); setEditContent(comment.content); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
        )}

        <DeleteConfirmDialog
          open={deleteOpen}
          title="Delete comment?"
          description="This comment will be removed permanently. This action cannot be undone."
          confirmLabel="Delete comment"
          loading={deleting}
          onConfirm={confirmDelete}
          onOpenChange={setDeleteOpen}
        />
      </div>
    </div>
  );
}
