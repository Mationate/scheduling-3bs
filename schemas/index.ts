import * as z from 'zod';

export const NewPasswordSchema = z.object({
    password: z.string().min(6,{
        message:'Se requiere una contraseña de 6 caracteres'
    }),
});

export const ResetSchema = z.object({
    email: z.string().email({
        message:'Se requiere un email válido'
    }),
});

export const LoginSchema = z.object({
    email: z.string().email({
        message:'Se requiere un email válido'
    }),
    password: z.string().min(1,{
        message:'Se requiere una contraseña'
    }),
    code: z.optional(z.string())
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message:'Se requiere un email válido'
    }),
    password: z.string().min(6,{
        message:'Se requiere una contraseña de 6 caracteres'
    }),
    name: z.string().min(1, {
        message:'Se requiere un nombre'
    }),
});