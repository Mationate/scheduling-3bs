import { currentUser } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();

const handleAuth = async () => {
    const user = await currentUser()
    if (!user) throw new Error("Unauthorized")
    // const { id: userId } = currentUser
    return user;
}
 
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await currentUser();
      console.log("Upload request from user:", user); // Debug
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed:", { metadata, file }); // Debug
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter; 