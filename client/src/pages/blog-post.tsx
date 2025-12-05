import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { BlogPost } from "@shared/schema";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Article not found.</p>
        <Button onClick={() => navigate("/blog")} data-testid="button-back-to-blog">
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950">
      {/* Article Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 mb-4" 
            onClick={() => navigate("/blog")}
            data-testid="button-back-header"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-lg opacity-90">{post.metaDescription}</p>
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge className="bg-white/20">{post.category}</Badge>
            {post.industry && <Badge className="bg-white/20">{post.industry}</Badge>}
            <span className="text-sm opacity-80">{post.estimatedReadTime} min read</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            data-testid="article-content"
          />
        </div>
      </section>

      {/* Related Articles CTA */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Compliant?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your free WCAG compliance scan today and see how WCAGAI can help you achieve EAA 2025 compliance.
          </p>
          <Button size="lg" onClick={() => navigate("/scanner")} data-testid="button-start-scan-from-article">
            Start Free Scan
          </Button>
        </div>
      </section>
    </article>
  );
}
