"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function ImageUploader({
  currentUrl,
  onUploaded,
  label = "Image",
  folder = "general",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentUrl ?? "");

  useEffect(() => {
    setPreview(currentUrl ?? "");
  }, [currentUrl]);

  async function handleFile(file: File) {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      try {
        const res = await fetch("/api/cms/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUri, filename: file.name, folder }),
        });
        const data = await res.json();
        if (data.url) {
          setPreview(data.url);
          onUploaded(data.url);
        }
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="block font-lato text-[12px] font-bold uppercase tracking-widest
                        text-stone-500 mb-2">
        {label}
      </label>
      <div
        className="border-2 border-dashed border-stone-200 rounded-sm p-4
                   flex flex-col items-center gap-3 cursor-pointer
                   hover:border-stone-400 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {preview ? (
          <div className="relative w-full flex flex-col items-center gap-2">
            <div className="relative w-full h-32">
              <Image src={preview} alt="preview" fill className="object-contain rounded-sm" />
            </div>
            <button
              type="button"
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-[5px] transition-colors bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              onClick={(e) => {
                e.stopPropagation();
                setPreview("");
                onUploaded("");
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div className="w-full h-20 bg-stone-100 rounded-sm flex items-center justify-center">
            <span className="font-lato text-[12px] text-stone-400">No image</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <p className="font-lato text-[11px] text-stone-400 text-center">
          {loading ? "Uploading…" : "Click or drag to upload"}
        </p>
      </div>
    </div>
  );
}
