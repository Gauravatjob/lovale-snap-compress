import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CompressionControlsProps {
  onCompress: (targetSize: number) => void;
  isProcessing: boolean;
  originalSize: number;
}

const PRESET_SIZES = [
  { label: "100 KB", value: 100 },
  { label: "500 KB", value: 500 },
  { label: "1 MB", value: 1000 },
  { label: "2 MB", value: 2000 },
  { label: "Custom", value: -1 },
];

const CompressionControls = ({
  onCompress,
  isProcessing,
  originalSize,
}: CompressionControlsProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("500");
  const [customSize, setCustomSize] = useState<string>("");

  const originalSizeKB = Math.ceil(originalSize / 1024);

  const handleCompress = () => {
    const targetSize =
      selectedSize === "-1" ? parseInt(customSize) : parseInt(selectedSize);
    if (targetSize > 0 && targetSize < originalSizeKB) {
      onCompress(targetSize);
    }
  };

  const isTargetSizeValid = () => {
    if (selectedSize === "-1") {
      const target = parseInt(customSize);
      return target > 0 && target < originalSizeKB;
    }
    const target = parseInt(selectedSize);
    return target < originalSizeKB;
  };

  return (
    <div className="space-y-6 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="rounded-lg bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          Original image size: <span className="font-semibold text-foreground">{originalSizeKB} KB</span>
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="size-select" className="text-base font-semibold">
          Target Size (must be smaller than original)
        </Label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger id="size-select" className="h-12">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {PRESET_SIZES.map((size) => (
              <SelectItem 
                key={size.value} 
                value={size.value.toString()}
                disabled={size.value !== -1 && size.value >= originalSizeKB}
              >
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSize === "-1" && (
        <div className="space-y-3">
          <Label htmlFor="custom-size" className="text-base font-semibold">
            Custom Size (KB)
          </Label>
          <Input
            id="custom-size"
            type="number"
            min="1"
            max={originalSizeKB - 1}
            placeholder={`Enter size (max ${originalSizeKB - 1} KB)`}
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            className="h-12"
          />
          {customSize && parseInt(customSize) >= originalSizeKB && (
            <p className="text-sm text-destructive">
              Target size must be smaller than the original ({originalSizeKB} KB)
            </p>
          )}
        </div>
      )}

      <Button
        onClick={handleCompress}
        disabled={isProcessing || !isTargetSizeValid()}
        className="h-12 w-full bg-gradient-to-r from-primary to-accent text-lg font-semibold shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
      >
        {isProcessing ? "Compressing..." : "Compress Image"}
      </Button>
    </div>
  );
};

export default CompressionControls;
