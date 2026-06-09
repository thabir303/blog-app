"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { commentsApi } from "@/lib/api";
import { Comment } from "@/lib/types";
import { canCreateComment } from "@/utils/permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

interface Props {
  postId: number;
  onCreated: (comment: Comment) => void;
}

export default function CommentForm({ postId, onCreated }: Props) {
  const { user, token } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          {" "}to leave a comment.
        </p>
      </div>
    );
  }

  if (!canCreateComment(user.role)) {
    return (
      <p className="text-sm text-muted-foreground italic pt-4 border-t border-border">
        Guests cannot post comments.
      </p>
    );
  }

  const avatarColor = AVATAR_PALETTE[user.username.charCodeAt(0) % AVATAR_PALETTE.length];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token) return;
    setError("");
    setLoading(true);
    try {
      const comment = await commentsApi.create(postId, content.trim(), token);
      onCreated(comment);
      setContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border">
      <Avatar className="h-7 w-7 shrink-0 mt-1">
        <AvatarFallback className={`text-white text-xs font-semibold ${avatarColor}`}>
          {user.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2 items-end">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder="Add a comment… (Enter to submit)"
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (content.trim()) handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !content.trim()} className="shrink-0 h-9 w-9">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
