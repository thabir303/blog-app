"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { canCreatePost } from "@/utils/permissions";
import PostForm from "@/components/posts/PostForm";
import { postsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, SquarePen } from "lucide-react";

export default function NewPostPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !canCreatePost(user.role))) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !canCreatePost(user.role)) return null;

  const handleSubmit = async (title: string, content: string) => {
    await postsApi.create({ title, content }, token!);
    router.push("/");
  };

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
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SquarePen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">New Post</CardTitle>
              <CardDescription>Share something with the community</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PostForm
            onSubmit={handleSubmit}
            submitLabel="Publish Post"
            onCancel={() => router.push("/")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
