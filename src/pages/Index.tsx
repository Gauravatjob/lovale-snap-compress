import { useState } from "react";
import { Sparkles } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import CompressionControls from "@/components/CompressionControls";
import ImagePreview from "@/components/ImagePreview";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/sizedown-logo.png";
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

      let bestBlob: Blob | null = null;
      let bestDiff = Infinity;
      
      // Step 1: Try aggressive quality-only compression (maintain resolution)
      const canvas1 = document.createElement("canvas");
      const ctx1 = canvas1.getContext("2d");
      if (!ctx1) throw new Error("Could not get canvas context");
      
      canvas1.width = img.width;
      canvas1.height = img.height;
      ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height);
      
      let minQuality = 0.001; // More aggressive minimum
      let maxQuality = 0.95;
      
      for (let attempt = 0; attempt < 100; attempt++) { // More attempts
        const quality = (minQuality + maxQuality) / 2;
        
        const blob = await new Promise<Blob | null>(resolve => {
          canvas1.toBlob(b => resolve(b), mimeType, quality);
        });
        
        if (!blob) break;
        
        const currentDiff = Math.abs(blob.size - targetSizeBytes);
        
        if (blob.size <= targetSizeBytes) {
          if (!bestBlob || blob.size > bestBlob.size) {
            bestBlob = blob;
            bestDiff = currentDiff;
          }
          minQuality = quality;
        } else {
          maxQuality = quality;
        }
        
        // Accept if we're within 2% of target
        if (blob.size <= targetSizeBytes && currentDiff < targetSizeBytes * 0.02) {
          break;
        }
        
        if (maxQuality - minQuality < 0.00001) break;
      }
      
      // Step 2: Only reduce dimensions if we couldn't get reasonably close with quality-only
      // Allow up to 10% over target before reducing dimensions
      if (!bestBlob || bestBlob.size > targetSizeBytes * 1.1) {
        for (let scale = 0.9; scale >= 0.1; scale -= 0.1) {
          const canvas2 = document.createElement("canvas");
          const ctx2 = canvas2.getContext("2d");
          if (!ctx2) continue;
          
          canvas2.width = Math.max(1, Math.floor(img.width * scale));
          canvas2.height = Math.max(1, Math.floor(img.height * scale));
          ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
          
          minQuality = 0.01;
          maxQuality = 0.95;
          
          for (let attempt = 0; attempt < 30; attempt++) {
            const quality = (minQuality + maxQuality) / 2;
            
            const blob = await new Promise<Blob | null>(resolve => {
              canvas2.toBlob(b => resolve(b), mimeType, quality);
            });
            
            if (!blob) break;
            
            const currentDiff = Math.abs(blob.size - targetSizeBytes);
            
            if (blob.size <= targetSizeBytes) {
              if (!bestBlob || blob.size > bestBlob.size) {
                bestBlob = blob;
                bestDiff = currentDiff;
              }
              minQuality = quality;
            } else {
              if (!bestBlob || currentDiff < bestDiff) {
                bestBlob = blob;
                bestDiff = currentDiff;
              }
              maxQuality = quality;
            }
            
            if (blob.size <= targetSizeBytes && currentDiff < targetSizeBytes * 0.05) {
              break;
            }
            
            if (maxQuality - minQuality < 0.001) break;
          }
          
          if (bestBlob && bestBlob.size <= targetSizeBytes) {
            break;
          }
        }
      }
      
      const blob = bestBlob;
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
        <header className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <img src={logo} alt="SizeDown Logo" className="h-32 w-32" />
          </div>
          <div className="mb-4 flex items-center justify-center gap-2">
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-5xl font-bold text-transparent py-[8px]">SizeDown - Image Compressor</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Compress your images to any custom size without affecting the resolution
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {!originalImage ? <section aria-label="Image upload section">
              <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
            </section> : <section className="grid gap-8 lg:grid-cols-[2fr_1fr]" aria-label="Image compression section">
              <article aria-label="Image preview">
                <ImagePreview originalImage={originalImage} compressedImage={compressedImage} originalSize={originalSize} compressedSize={compressedSize} onDownload={handleDownload} />
              </article>
              <aside aria-label="Compression controls">
                <div className="space-y-6">
                  <CompressionControls onCompress={compressImage} isProcessing={isProcessing} originalSize={originalSize} />
                  <button onClick={() => {
                setOriginalImage(null);
                setCompressedImage(null);
                setOriginalFile(null);
              }} className="w-full rounded-xl border-2 border-border bg-card px-6 py-3 font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary" aria-label="Upload a new image">
                    Upload New Image
                  </button>
                </div>
              </aside>
            </section>}
        </main>
      </div>
    </div>;
};
export default Index;