"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { X, ImagePlus, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url?: string) => void;
  disabled?: boolean;
  onUpload?: (url: string) => void;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled,
  onUpload,
}: ImageUploadProps) => {
  const [isEditing, setIsEditing] = useState(!value);

  const toggleEdit = () => setIsEditing((current) => !current);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Imagen</span>
        {!disabled && (
          <Button onClick={toggleEdit} variant="ghost" type="button" size="sm">
            {isEditing && "Cancelar"}
            {!isEditing && !value && (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                Agregar imagen
              </>
            )}
            {!isEditing && value && (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Cambiar imagen
              </>
            )}
          </Button>
        )}
      </div>

      {!isEditing && value && (
        <div className="relative h-44 w-44">
          <Image
            alt="Upload"
            fill
            src={value}
            className="object-cover rounded-md"
          />
          {!disabled && (
            <Button
              onClick={() => {
                onChange("");
                setIsEditing(true);
              }}
              className="absolute top-2 right-2"
              variant="destructive"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {isEditing && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 max-w-[300px]">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              console.log("Upload completed:", res);
              const url = res?.[0].url;
              if (url) {
                console.log("URL received:", url);
                onChange(url);
                if (onUpload) onUpload(url);
                setIsEditing(false);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
            }}
            onUploadBegin={() => {
              console.log("Upload started");
            }}
          />
        </div>
      )}
    </div>
  );
}; 