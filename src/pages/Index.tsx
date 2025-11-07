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
  const {
    toast
  } = useToast();
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
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
      await new Promise(resolve => {
        img.onload = resolve;
      });

      // Always use JPEG for better compression
      const mimeType = 'image/jpeg';

      // Keep original dimensions - only compress via quality
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let quality = 0.9;
      let blob: Blob | null = null;
      let bestBlobUnderTarget: Blob | null = null;
      let closestBlobOverTarget: Blob | null = null;
      let attempts = 0;
      const maxAttempts = 100;
      let minQuality = 0.001;
      let maxQuality = 0.95;

      // Binary search for optimal quality - explore full range
      while (attempts < maxAttempts) {
        attempts++;
        quality = (minQuality + maxQuality) / 2;
        blob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(b => resolve(b), mimeType, quality);
        });
        if (!blob) break;

        // Track best result under target (prefer largest one under target)
        if (blob.size <= targetSizeBytes) {
          if (!bestBlobUnderTarget || blob.size > bestBlobUnderTarget.size) {
            bestBlobUnderTarget = blob;
          }
          // We found something under target, search higher quality
          minQuality = quality;
        } else {
          // Too large, need lower quality
          if (!closestBlobOverTarget || blob.size < closestBlobOverTarget.size) {
            closestBlobOverTarget = blob;
          }
          maxQuality = quality;
        }

        // Stop only when quality range is exhausted
        if (maxQuality - minQuality < 0.00005) {
          break;
        }
      }

      // Use the best result we found - prefer under target, fallback to closest over
      blob = bestBlobUnderTarget || closestBlobOverTarget;
      if (blob && blob.size <= originalSize) {
        const reader = new FileReader();
        reader.onload = e => {
          setCompressedImage(e.target?.result as string);
          setCompressedSize(blob!.size);
          setIsProcessing(false);
          const actualSizeKB = (blob!.size / 1024).toFixed(1);
          toast({
            title: "Compression complete!",
            description: `Image compressed to ${actualSizeKB} KB (target: ${targetSizeKB} KB)`
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
        variant: "destructive"
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
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-bold text-transparent py-[8px]">SizeDown - Image Compressor</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Compress your images to any custom size without affecting the resolution
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!originalImage ? <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} /> : <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <ImagePreview originalImage={originalImage} compressedImage={compressedImage} originalSize={originalSize} compressedSize={compressedSize} onDownload={handleDownload} />
              <div className="space-y-6">
                <CompressionControls onCompress={compressImage} isProcessing={isProcessing} originalSize={originalSize} />
                <button onClick={() => {
              setOriginalImage(null);
              setCompressedImage(null);
              setOriginalFile(null);
            }} className="w-full rounded-xl border-2 border-border bg-card px-6 py-3 font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary">
                  Upload New Image
                </button>
              </div>
            </div>}
        </div>

        {/* Footer */}
        
      </div>
    </div>;
};
export default Index;