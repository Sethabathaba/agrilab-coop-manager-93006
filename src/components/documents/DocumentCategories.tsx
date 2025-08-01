
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "minutes", label: "Meeting Minutes" },
  { value: "financial", label: "Financial Reports" },
  { value: "policies", label: "Policies & Procedures" },
  { value: "certificates", label: "Certificates & Licenses" },
  { value: "correspondence", label: "Correspondence" },
  { value: "legal", label: "Legal Documents" },
  { value: "other", label: "Other" },
];

interface DocumentCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function DocumentCategories({ selectedCategory, onCategoryChange }: DocumentCategoriesProps) {
  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORIES.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
