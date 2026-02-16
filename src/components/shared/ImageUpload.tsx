"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [mode, setMode] = useState<"url" | "file">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-caption font-semibold text-text-secondary uppercase tracking-tight">Görsel</span>
        <div className="flex bg-bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setMode("file")}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md transition-all font-bold",
              mode === "file" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary"
            )}
          >
            DOSYA
          </button>
          <button
            onClick={() => setMode("url")}
            className={cn(
              "text-[10px] px-2 py-1 rounded-md transition-all font-bold",
              mode === "url" ? "bg-white shadow-sm text-text-primary" : "text-text-secondary"
            )}
          >
            URL
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Preview Area */}
        <div className="relative group w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-bg-secondary border border-divider flex items-center justify-center">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={handleRemove}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary opacity-20">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1 flex flex-col justify-center">
          {mode === "file" ? (
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12 border-dashed border-2 hover:border-action/40 hover:bg-action/5 group"
              >
                <div className="flex items-center gap-2 text-text-secondary group-hover:text-action transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <span className="text-caption font-bold">Görsel Seç</span>
                </div>
              </Button>
              <p className="text-[10px] text-text-secondary text-center italic">PNG, JPG, WEBP (Max 2MB)</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Görsel URL adresini yapıştırın..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-12"
              />
              <p className="text-[10px] text-text-secondary text-center italic uppercase tracking-widest font-bold">Harici bir kaynaktan görsel bağlayın</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
