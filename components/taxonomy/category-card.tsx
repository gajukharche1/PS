import Link from "next/link";
import { Utensils, Stethoscope, Wrench, Dumbbell, Folder, ChevronRight } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Stethoscope,
  Wrench,
  Dumbbell,
};

interface CategoryCardProps {
  category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    listingCount: number;
    children?: Array<{
      id: string;
      slug: string;
      name: string;
    }>;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Folder;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary">
            <IconComponent className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {category.listingCount} {category.listingCount === 1 ? "listing" : "listings"}
          </span>
        </div>

        <Link href={`/category/${category.slug}`} className="group">
          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
            <span>{category.name}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        </Link>

        {category.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${category.slug}/${child.slug}`}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-0.5 rounded transition"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
