import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Download, Trash2, Eye, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DocumentRecord {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentListProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  onDeleteSuccess: () => void;
}

const getCategoryLabel = (category: string) => {
  const categories: Record<string, string> = {
    minutes: "Meeting Minutes",
    financial: "Financial Reports",
    policies: "Policies & Procedures",
    certificates: "Certificates & Licenses",
    correspondence: "Correspondence",
    legal: "Legal Documents",
    other: "Other",
  };
  return categories[category] || category;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    minutes: "bg-blue-100 text-blue-800",
    financial: "bg-green-100 text-green-800",
    policies: "bg-purple-100 text-purple-800",
    certificates: "bg-yellow-100 text-yellow-800",
    correspondence: "bg-orange-100 text-orange-800",
    legal: "bg-red-100 text-red-800",
    other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || colors.other;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentList({ documents, isLoading, onDeleteSuccess }: DocumentListProps) {
  const deleteMutation = useMutation({
    mutationFn: async (documentRecord: DocumentRecord) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentRecord.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentRecord.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      onDeleteSuccess();
    },
    onError: (error) => {
      toast.error("Failed to delete document: " + error.message);
    },
  });

  const handleDownload = async (documentRecord: DocumentRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(documentRecord.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = documentRecord.name;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download document");
    }
  };

  const handleView = (documentRecord: DocumentRecord) => {
    window.open(documentRecord.file_url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
        <p className="text-muted-foreground">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((documentRecord) => (
        <Card key={documentRecord.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate" title={documentRecord.name}>
                  {documentRecord.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(documentRecord.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            <div className="space-y-2 mb-4">
              <Badge className={getCategoryColor(documentRecord.category)}>
                {getCategoryLabel(documentRecord.category)}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(documentRecord.file_size)}
              </p>
              {documentRecord.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {documentRecord.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(documentRecord)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(documentRecord)}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{documentRecord.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(documentRecord)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
