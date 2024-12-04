import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@/lib/auth";
 
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1
    }
  })
    .middleware(async () => {
      const user = await currentUser();
      console.log("Upload middleware - user:", user);

      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed - metadata:", metadata);
      console.log("Upload completed - file:", file);
      
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter; 