"use client";

import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ImageIcon, PencilIcon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
    initialData: {
        imageUrl?: string | null;
    };
    entityId: string;
    entityType: "shops" | "workers" | "services";
    onImageUploaded?: (url: string) => void;
}

const formSchema = z.object({
    imageUrl: z.string().min(1, {
        message: "Se requiere una imagen"
    }),
});

export const ImageForm = ({
    initialData,
    entityId,
    entityType,
    onImageUploaded,
}: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const toggleEdit = () => setIsEditing((current) => !current);
    const router = useRouter();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            console.log("uploading image");
            if (entityId) {
                await axios.patch(`/api/${entityType}/${entityId}`, values);
            }
            if (onImageUploaded) {
                onImageUploaded(values.imageUrl);
            }
            toast.success("Imagen actualizada correctamente");
            toggleEdit();
            router.refresh();
        } catch (error) {
            toast.error("Ocurrió un error al actualizar la imagen");
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Vista previa
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && (
                        <>Cancelar</>
                    )}
                    {!isEditing && !initialData.imageUrl && (
                        <>
                            <PlusCircleIcon className="h-4 w-5 mr-2"/>
                            Agregar imagen
                        </>
                    )}
                    {!isEditing && initialData.imageUrl && (
                        <>
                            <PencilIcon className="h-4 w-4 mr-2"/>
                            Editar imagen
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                !initialData.imageUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <ImageIcon className="h-10 w-10 text-slate-500"/>
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image
                            alt="Upload"
                            fill
                            className="object-cover rounded-md"
                            src={initialData.imageUrl}
                        />
                    </div>
                )
            )}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="imageUploader"
                        onChange={(url, fileName) => {
                            console.log("File uploaded:", { url, fileName });
                            if(url) {
                                onSubmit({ imageUrl: url });
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        Se recomienda una imagen de alta calidad
                    </div>
                </div>
            )}
        </div>
    );
}; 