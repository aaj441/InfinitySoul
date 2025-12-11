import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertCircle, CheckCircle2, Info } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Understanding WCAG 2.1 Compliance Levels",
    description: "Learn the difference between Level A, AA, and AAA compliance requirements",
    category: "wcag",
    level: "beginner",
    views: 1200,
  },
  {
    id: 2,
    title: "Alternative Text Best Practices",
    description: "How to write effective alt text for images and enhance accessibility",
    category: "images",
    level: "beginner",
    views: 890,
  },
  {
    id: 3,
    title: "Keyboard Navigation Implementation",
    description: "Ensure your website is fully navigable using keyboard alone",
    category: "interaction",
    level: "intermediate",
    views: 456,
  },
  {
    id: 4,
    title: "Color Contrast Requirements",
    description: "Meeting WCAG standards for text and background color contrast",
    category: "design",
    level: "intermediate",
    views: 734,
  },
  {
    id: 5,
    title: "Form Labels and Error Messaging",
    description: "Properly implement accessible forms with clear labels and error states",
    category: "forms",
    level: "intermediate",
    views: 567,
  },
  {
    id: 6,
    title: "Legal Implications of Inaccessible Websites",
    description: "Understanding ADA compliance and recent settlement trends",
    category: "legal",
    level: "advanced",
    views: 2100,
  },
];

const categories = {
  wcag: { icon: BookOpen, color: "bg-blue-100 text-blue-900" },
  images: { icon: AlertCircle, color: "bg-yellow-100 text-yellow-900" },
  interaction: { icon: CheckCircle2, color: "bg-green-100 text-green-900" },
  design: { icon: Info, color: "bg-purple-100 text-purple-900" },
  forms: { icon: BookOpen, color: "bg-indigo-100 text-indigo-900" },
  legal: { icon: AlertCircle, color: "bg-red-100 text-red-900" },
};

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Resources and best practices for WCAG accessibility
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => {
          const category = categories[article.category as keyof typeof categories] || categories.wcag;
          const Icon = category.icon;

          return (
            <Card key={article.id} className="hover-elevate cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {article.description}
                    </CardDescription>
                  </div>
                  <div className={`p-2 rounded-md flex-shrink-0 ${category.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" data-testid={`badge-category-${article.id}`}>
                      {article.category}
                    </Badge>
                    <Badge variant="secondary" data-testid={`badge-level-${article.id}`}>
                      {article.level}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{article.views} views</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
