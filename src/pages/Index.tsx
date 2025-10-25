import { useState } from "react";
import { Sparkles } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import CompressionControls from "@/components/CompressionControls";
import ImagePreview from "@/components/ImagePreview";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setOriginalFile(file);
      setOriginalSize(file.size);
      setCompressedImage(null);
      setCompressedSize(null);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async (targetSizeKB: number) => {
    if (!originalImage || !originalFile) return;

    setIsProcessing(true);
    const targetSizeBytes = targetSizeKB * 1024;

    try {
      const img = new Image();
      img.src = originalImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get the mime type, default to jpeg if not png
      const mimeType = originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      let quality = 0.95;
      let blob: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 20;
      let minQuality = 0.05;
      let maxQuality = 0.95;

      // Binary search for optimal quality
      while (attempts < maxAttempts) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b),
            mimeType,
            quality
          );
        });

        if (!blob) break;

        const sizeDiff = blob.size - targetSizeBytes;
        
        // If within 5% of target, we're done
        if (Math.abs(sizeDiff) < targetSizeBytes * 0.05 || blob.size <= targetSizeBytes) {
          break;
        }

        // Adjust quality using binary search
        if (blob.size > targetSizeBytes) {
          maxQuality = quality;
          quality = (minQuality + quality) / 2;
        } else {
          minQuality = quality;
          quality = (quality + maxQuality) / 2;
        }

        // Prevent infinite loops
        if (maxQuality - minQuality < 0.01) {
          break;
        }

        attempts++;
      }

      if (blob && blob.size <= originalSize) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCompressedImage(e.target?.result as string);
          setCompressedSize(blob!.size);
          setIsProcessing(false);
          
          toast({
            title: "Compression complete!",
            description: `Image compressed to ${(blob!.size / 1024).toFixed(1)} KB`,
          });
        };
        reader.readAsDataURL(blob);
      } else {
        throw new Error("Could not compress image to target size");
      }
    } catch (error) {
      console.error("Compression error:", error);
      setIsProcessing(false);
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "An error occurred while compressing the image.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = `compressed-${originalFile?.name || "image.jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-bold text-transparent">
              Smart Image Compressor
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Compress your images to any size while maintaining quality
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!originalImage ? (
            <ImageUploader
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <ImagePreview
                originalImage={originalImage}
                compressedImage={compressedImage}
                originalSize={originalSize}
                compressedSize={compressedSize}
                onDownload={handleDownload}
              />
              <div className="space-y-6">
                <CompressionControls
                  onCompress={compressImage}
                  isProcessing={isProcessing}
                  originalSize={originalSize}
                />
                <button
                  onClick={() => {
                    setOriginalImage(null);
                    setCompressedImage(null);
                    setOriginalFile(null);
                  }}
                  className="w-full rounded-xl border-2 border-border bg-card px-6 py-3 font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  Upload New Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          © 2025 Smart Image Compressor | Powered by Lovable AI
        </footer>
      </div>
    </div>
  );
};

export default Index;
