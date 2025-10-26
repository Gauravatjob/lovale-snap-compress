import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const ImageUploader = ({ onImageUpload, isProcessing }: ImageUploaderProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    },
    [onImageUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const validateAndUpload = (file: File) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }
    onImageUpload(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center transition-all hover:border-primary hover:bg-accent/5"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInput}
        disabled={isProcessing}
      />
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer flex-col items-center gap-4"
      >
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-6">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            Drop your image here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse • JPG, PNG • Max 10MB
          </p>
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;
