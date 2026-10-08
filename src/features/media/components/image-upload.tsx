"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { uploadImage } from "../actions";
import { mediaUrl } from "../url";
import { downscaleImage } from "./downscale";

type ImageUploadProps = {
  /** Current media id, or null when there is no image. */
  value: string | null;
  onChange: (mediaId: string | null) => void;
  /** Accessible name of the control, e.g. "Ürün görseli". */
  label: string;
  aspect?: "square" | "wide";
  disabled?: boolean;
  className?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";

export function ImageUpload({ value, onChange, label, aspect = "wide", disabled, className }: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoaded, setIsLoaded] = useState(false);
  const src = mediaUrl(value);

  function handleFile(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const body = new FormData();
      body.set("file", await downscaleImage(file), file.name);
      const result = await uploadImage(body);
      if (result.ok) {
        setIsLoaded(false);
        onChange(result.data.id);
      } else {
        toast.error(result.error);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-dashed border-border-strong bg-surface-muted",
          aspect === "square" ? "aspect-square w-32" : "aspect-[16/9] w-full",
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- media is already resized and immutable
          <img
            src={src}
            alt=""
            onLoad={() => setIsLoaded(true)}
            className={cn("h-full w-full object-cover transition-opacity", isLoaded ? "opacity-100" : "opacity-0")}
          />
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              "flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-3 text-center text-sm text-fg-muted",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <ImagePlus aria-hidden className="size-6" />
            <span>Görsel yükle</span>
            <span className="text-xs">JPG, PNG, WebP · en fazla 4 MB</span>
          </label>
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70" role="status">
            <Spinner />
            <span className="sr-only">Görsel yükleniyor</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        aria-label={label}
        className="sr-only"
        disabled={disabled || isPending}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {src && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isPending}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus aria-hidden className="size-4" />
            Değiştir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPending}
            onClick={() => onChange(null)}
          >
            <Trash2 aria-hidden className="size-4" />
            Kaldır
          </Button>
        </div>
      )}
    </div>
  );
}
