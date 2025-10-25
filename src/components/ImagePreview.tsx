import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  originalImage: string;
  compressedImage: string | null;
  originalSize: number;
  compressedSize: number | null;
  onDownload: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const ImagePreview = ({
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
  onDownload,
}: ImagePreviewProps) => {
  const reductionPercent =
    compressedSize && originalSize
      ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Original</h3>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-card)]">
            <img
              src={originalImage}
              alt="Original"
              className="h-64 w-full object-contain"
            />
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground">
            {formatSize(originalSize)}
          </p>
        </div>

        {compressedImage && compressedSize && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Compressed
            </h3>
            <div className="overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-card)]">
              <img
                src={compressedImage}
                alt="Compressed"
                className="h-64 w-full object-contain"
              />
            </div>
            <p className="text-center text-sm font-medium text-primary">
              {formatSize(compressedSize)} · {reductionPercent}% smaller
            </p>
          </div>
        )}
      </div>

      {compressedImage && (
        <Button
          onClick={onDownload}
          className="h-12 w-full bg-gradient-to-r from-primary to-accent text-lg font-semibold shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Compressed Image
        </Button>
      )}
    </div>
  );
};

export default ImagePreview;
