
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_CATEGORIES = [
  { value: "minutes", label: "Meeting Minutes" },
  { value: "financial", label: "Financial Reports" },
  { value: "policies", label: "Policies & Procedures" },
  { value: "certificates", label: "Certificates & Licenses" },
  { value: "correspondence", label: "Correspondence" },
  { value: "legal", label: "Legal Documents" },
  { value: "other", label: "Other" },
];

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: { files: File[], category: string, description: string }) => {
      const uploads = await Promise.all(
        formData.files.map(async (file) => {
          // Upload file to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `documents/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          // Save document metadata to database
          const { error: dbError } = await supabase
            .from('documents')
            .insert({
              name: file.name,
              file_path: filePath,
              file_url: publicUrl,
              file_size: file.size,
              file_type: file.type,
              category: formData.category,
              description: formData.description,
            });

          if (dbError) throw dbError;
          return { fileName: file.name, url: publicUrl };
        })
      );
      return uploads;
    },
    onSuccess: () => {
      toast.success(`Successfully uploaded ${selectedFiles.length} document(s)`);
      setSelectedFiles([]);
      setCategory("");
      setDescription("");
      setIsOpen(false);
      onUploadSuccess();
    },
    onError: (error) => {
      toast.error("Failed to upload documents: " + error.message);
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    uploadMutation.mutate({ files: selectedFiles, category, description });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload cooperative documents, meeting minutes, or reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description or notes about these documents"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={uploadMutation.isPending || selectedFiles.length === 0}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
