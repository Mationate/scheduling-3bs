"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";

interface FileUploadProps {
    onChange: (url?: string, fileName?: string) => void;
    endpoint: keyof typeof ourFileRouter;
};

export const FileUpload = ({
    onChange,
    endpoint,
}: FileUploadProps) => {
    return(
        <UploadDropzone
            endpoint={endpoint}
            onBeforeUploadBegin={(files) => {
                console.log("Before upload:", files);
                return files;
            }}
            onUploadBegin={() => {
                console.log("Upload started");
            }}
            onUploadProgress={(progress) => {
                console.log("Upload progress:", progress);
            }}
            onClientUploadComplete={(res) => {
                console.log("Upload completed:", res);
                if (res?.[0]) {
                    onChange(res[0].url, res[0].name);
                    toast.success("Imagen subida correctamente");
                }
            }}
            onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                toast.error(`Error al subir la imagen: ${error.message}`);
            }}
        />
    );
};