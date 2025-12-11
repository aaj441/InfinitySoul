import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading blog posts...</p>
      </div>
    );
  }

  const categories = ["EAA 2025", "Industry Analysis", "Technical", "Legal & Risk", "ROI & Business"];
  const selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Blog Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">EAA 2025 Compliance Blog</h1>
          <p className="text-xl opacity-90">Expert insights on European Accessibility Act compliance, AI remediation, and digital accessibility trends</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-gray-50 dark:bg-slate-900 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => navigate("/blog")}
              data-testid="button-filter-all"
            >
              All Articles
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => navigate(`/blog?category=${encodeURIComponent(cat)}`)}
                data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  data-testid={`card-blog-${post.slug}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                      {post.industry && <Badge>{post.industry}</Badge>}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {post.metaDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{post.estimatedReadTime} min read</span>
                      <span>{post.wordCount} words</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
