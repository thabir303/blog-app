"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { postsApi } from "@/lib/api";
import PostCard from "@/components/posts/PostCard";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { canCreatePost } from "@/utils/permissions";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import { SquarePen, FileX, AlertCircle } from "lucide-react";

const PAGE_SIZE = 5;

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async (targetPage = 1) => {
    setLoading(true);
    try {
      const data = await postsApi.list(targetPage, PAGE_SIZE);
      if (data.total_pages > 0 && targetPage > data.total_pages) {
        setPage(data.total_pages);
        return;
      }
      setPosts(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
      setPage(data.page);
      setError("");
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(page); }, [page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${totalItems} post${totalItems !== 1 ? "s" : ""}`}
          </p>
        </div>
        {user && canCreatePost(user.role) && (
          <Link href="/posts/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <SquarePen className="h-3.5 w-3.5" />
            New Post
          </Link>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-5 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileX className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No posts yet</p>
          <p className="text-muted-foreground text-sm mt-1">Be the first to share something.</p>
          {user && canCreatePost(user.role) && (
            <Link href="/posts/new" className={cn(buttonVariants({ variant: "link" }), "mt-3")}>
              Create the first post →
            </Link>
          )}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDeleted={() => fetchPosts(page)} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemLabel="posts"
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
