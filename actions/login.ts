"use server";

import * as z from "zod";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async (values:z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);
    if(!validatedFields.success){
        return {error: "Campos inválidos"}
    }
    const { email, password, code } = validatedFields.data;

    const existingUser = await getUserByEmail(email);
    if(!existingUser || !existingUser.email || !existingUser.password){
        return {error: "Credenciales inválidas"}
    }

    // if (!existingUser.emailVerified){
    //     const verificationToken = await generateVerificationToken(existingUser.email);
    //     await sendVerificationEmail(
    //         verificationToken.email,
    //         verificationToken.token
    //     )
    //     return  { success: "Se ha enviado un correo de verificación"}
    // }
    
    // if(existingUser.isTwoFactorEnabled && existingUser.email){
    //     if( code ){
    //         const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
    //         if(!twoFactorToken){
    //             return {error: "Código inválido"}
    //         }
    //         if(twoFactorToken.token !== code){
    //             return {error: "Código inválido"}
    //         }
    //         const hasExpired = new Date(twoFactorToken.expires) < new Date();
    //         if(hasExpired){
    //             return {error: "Código expirado"}
    //         }

    //         await db.twoFactorToken.delete({
    //             where: {
    //                 id: twoFactorToken.id
    //             }
    //         });
    //         const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
    //         if(existingConfirmation){
    //             await db.twoFactorConfirmation.delete({
    //                 where: {
    //                     id: existingConfirmation.id
    //                 }
    //             })
    //         }

    //         await db.twoFactorConfirmation.create({
    //             data: {
    //                 userId: existingUser.id
    //             }
    //         })

    //     } else {
    //         const twoFactorToken = await generateTwoFactorToken(existingUser.email);
    //         await sendTwoFactorTokenEmail(
    //             existingUser.email,
    //             twoFactorToken.token
    //         )
    //         return { twoFactor: true};
    //     } 
    // }

    try {
        await signIn("credentials", {email,password, redirectTo: DEFAULT_LOGIN_REDIRECT});
    } catch (error) {
        if(error instanceof AuthError){
            switch( error.type){
                case "CredentialsSignin":
                    return {error: "Credenciales inválidas"}
                default:
                    return {error: "Algo pasó"}
            }
        }
        throw error;
    }

}