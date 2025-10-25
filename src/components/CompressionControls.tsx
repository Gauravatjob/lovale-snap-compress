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
}: CompressionControlsProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("500");
  const [customSize, setCustomSize] = useState<string>("");

  const handleCompress = () => {
    const targetSize =
      selectedSize === "-1" ? parseInt(customSize) : parseInt(selectedSize);
    if (targetSize > 0) {
      onCompress(targetSize);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="space-y-3">
        <Label htmlFor="size-select" className="text-base font-semibold">
          Target Size
        </Label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger id="size-select" className="h-12">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {PRESET_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value.toString()}>
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
            placeholder="Enter size in KB"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            className="h-12"
          />
        </div>
      )}

      <Button
        onClick={handleCompress}
        disabled={
          isProcessing ||
          (selectedSize === "-1" && (!customSize || parseInt(customSize) <= 0))
        }
        className="h-12 w-full bg-gradient-to-r from-primary to-accent text-lg font-semibold shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
      >
        {isProcessing ? "Compressing..." : "Compress Image"}
      </Button>
    </div>
  );
};

export default CompressionControls;
