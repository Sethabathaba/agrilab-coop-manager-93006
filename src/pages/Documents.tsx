import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentCategories } from "@/components/documents/DocumentCategories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  // Fetch documents from Supabase
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents', selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground">
            Manage cooperative documents, minutes, and reports
          </p>
        </div>
        <DocumentUpload onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ['documents'] })} />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <DocumentCategories
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documents
            {documents && (
              <span className="text-sm font-normal text-muted-foreground">
                ({documents.length} files)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList 
            documents={documents || []} 
            isLoading={isLoading}
            onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
