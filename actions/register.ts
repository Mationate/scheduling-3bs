"use server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import { getUserByEmail } from "@/data/user";


export const register = async (values:z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);
    if(!validatedFields.success){
        return {error: "Campos inválidos"}
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);
    
    if(existingUser){
        return {error: "Correo ya registrado"}
    }

    await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    })

    //TODO: send verification

    return {success: "Usuario creado!"}

}