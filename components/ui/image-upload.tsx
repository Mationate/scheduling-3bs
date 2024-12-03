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
          <div className="relative h-64 w-64 rounded-lg overflow-hidden">
            <Image
              fill
              alt="Upload"
              src={preview}
              className="object-cover transition-opacity group-hover:opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={onRemove}
                variant="destructive"
                size="sm"
                type="button"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : !isUploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary transition-colors">
          <UploadDropzone
            endpoint="imageUploader"
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={(res) => {
              setIsUploading(false);
              onChange(res?.[0].url);
              setPreview(res?.[0].url);
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              console.log(error);
            }}
            content={{
              label: (
                <div className="flex flex-col items-center space-y-4">
                  <ImagePlus className="h-12 w-12 text-gray-400" />
                  <div className="text-gray-600">
                    <p className="font-medium">Arrastra una imagen o haz clic aquí</p>
                    <p className="text-xs">Máximo 8MB - PNG, JPG</p>
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}
    </div>
  );
}; 