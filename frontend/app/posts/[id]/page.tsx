"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Post, Comment } from "@/lib/types";
import { postsApi, commentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { canUpdatePost, canDeletePost } from "@/utils/permissions";
import CommentCard from "@/components/comments/CommentCard";
import CommentForm from "@/components/comments/CommentForm";
import PostForm from "@/components/posts/PostForm";
import RoleChip from "@/components/RoleChip";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, CalendarDays, Pencil, Trash2, MessageSquare } from "lucide-react";

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = parseInt(id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    Promise.all([postsApi.get(postId), commentsApi.list(postId)])
      .then(([p, c]) => { setPost(p); setComments(c); })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [postId, router]);

  const handleUpdate = async (title: string, content: string) => {
    const updated = await postsApi.update(postId, { title, content }, token!);
    setPost(updated);
    setEditing(false);
    router.replace(`/posts/${postId}`);
  };

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await postsApi.delete(postId, token);
      setDeleteOpen(false);
      router.push("/");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) return null;

  const showEdit = user && canUpdatePost(user.role, post.owner_id, user.id);
  const showDelete = user && canDeletePost(user.role, post.owner_id, user.id);
  const avatarColor = AVATAR_PALETTE[post.owner.username.charCodeAt(0) % AVATAR_PALETTE.length];

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to posts
      </Link>

      <Card>
        {editing ? (
          <CardContent className="p-6">
            <h2 className="text-base font-semibold mb-5">Edit Post</h2>
            <PostForm
              initialTitle={post.title}
              initialContent={post.content}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              onCancel={() => { setEditing(false); router.replace(`/posts/${postId}`); }}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-semibold text-foreground leading-snug">{post.title}</h1>
                {(showEdit || showDelete) && (
                  <div className="flex items-center gap-1 shrink-0">
                    {showEdit && (
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={() => setEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deleting ? "Deleting…" : "Delete"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Author row */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={`text-white text-xs font-semibold ${avatarColor}`}>
                    {post.owner.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{post.owner.username}</span>
                <RoleChip role={post.owner.role} />
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formattedDate}
                  {post.updated_at && <span className="ml-1 opacity-60">· edited</span>}
                </span>
              </div>
            </CardHeader>

            <DeleteConfirmDialog
              open={deleteOpen}
              title="Delete post?"
              description="This will permanently remove the post and every comment attached to it. This action cannot be undone."
              confirmLabel="Delete post"
              loading={deleting}
              onConfirm={confirmDelete}
              onOpenChange={setDeleteOpen}
            />

            <Separator />

            <CardContent className="p-6">
              <p className="text-sm text-foreground/80 leading-7 whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </>
        )}
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            {comments.length === 0
              ? "No comments yet"
              : `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0">
          {comments.length > 0 && (
            <div className="divide-y divide-border">
              {comments.map((c) => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  post={post}
                  onDeleted={() => setComments((prev) => prev.filter((x) => x.id !== c.id))}
                  onUpdated={(updated) => setComments((prev) => prev.map((x) => x.id === updated.id ? updated : x))}
                />
              ))}
            </div>
          )}
          <div className={comments.length > 0 ? "mt-2" : ""}>
            <CommentForm postId={postId} onCreated={(c) => setComments((prev) => [...prev, c])} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
