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
      {compressedImage && compressedSize ? (
        <>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Compressed Image
            </h3>
            <div className="overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-card)]">
              <img
                src={compressedImage}
                alt="Compressed"
                className="h-96 w-full object-contain"
              />
            </div>
            <div className="rounded-lg bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Original Size</p>
                  <p className="text-lg font-semibold">{formatSize(originalSize)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Compressed Size</p>
                  <p className="text-lg font-semibold text-primary">{formatSize(compressedSize)}</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-primary">
                  Reduced by {reductionPercent}%
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onDownload}
            className="h-12 w-full bg-gradient-to-r from-primary to-accent text-lg font-semibold shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Compressed Image
          </Button>
        </>
      ) : (
        <div className="rounded-2xl bg-muted p-12 text-center">
          <p className="text-muted-foreground">
            Compressed image will appear here after processing
          </p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
