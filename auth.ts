import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { getUserById } from "@/data/user"
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "USER"
      image: string;
    }
  } 
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
    pages:{
      signIn: "/login",
      error: "/error"
    },
    events:{
      async linkAccount({ user}){
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        })
      }
    },
    callbacks:{
      async signIn({user, account}){
        // Allow OAuth withoutn email verification
        if(account?.provider !== "credentials") return true;
        
        const existingUser = await getUserById(user.id);

        // prevent signin without email verification
        // if(!existingUser?.emailVerified){
        //   return false;
        // }
        if(existingUser?.isTwoFactorEnabled){
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

          if(!twoFactorConfirmation) return false;
          // delete 2fa confirmation for next login
          await db.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id }
          });
        }

        return true;

      },
      async session({token, session}){
        if(token.sub && session.user){
            session.user.id = token.sub;
          }
          if(token.role && session.user){
            session.user.role = token.role as "ADMIN" | "USER";
          }
  
        return session;

      },
      async jwt({token}){
        if (!token.sub) return token;
        const existingUser = await getUserById(token.sub);
        if(!existingUser)return token;

        token.role = existingUser.role;
        return token;
      }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig,
})