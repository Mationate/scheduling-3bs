"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url?: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState(value);
  const [isUploading, setIsUploading] = useState(false);

  const onRemove = () => {
    onChange("");
    setPreview("");
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {isUploading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      
      {preview && !isUploading ? (
        <div className="relative group">
          <div className="relative h-40 w-40 rounded-lg overflow-hidden">
            <Image
              fill
              alt="Upload"
              src={preview}
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <Button
                onClick={onRemove}
                variant="destructive"
                size="sm"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : !isUploading && (
        <UploadDropzone
          endpoint="imageUploader"
          onUploadBegin={() => {
            setIsUploading(true);
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res?.[0]) {
              setPreview(res[0].url);
              onChange(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false);
            console.error(error);
          }}
        />
      )}
    </div>
  );
}; 