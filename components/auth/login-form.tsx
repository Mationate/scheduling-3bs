"use client"
import * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/schemas"
import { useSearchParams } from "next/navigation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { login } from "@/actions/login"
import Link from "next/link"
import { Loader2, Mail, Lock } from "lucide-react"
import Image from "next/image"

type LoginResponse = {
    error: string;
    success?: string;
    twoFactor?: boolean;
} | undefined;

export const LoginForm = () => {
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
        ? "Correo ya en uso con una cuenta de Google. Inicia sesión con Google."
        : "";

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [showTwoFactor, setShowTwoFactor] = useState(false);

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            login(values)
                .then((data: LoginResponse) => {
                    if (data?.error) {
                        form.reset();
                        setError(data.error);
                    }
                    if (data?.success) {
                        form.reset();
                        setSuccess(data.success);
                    }
                    if (data?.twoFactor) {
                        setShowTwoFactor(true);
                    }
                })
                .catch(() => setError("Algo salió mal"));
        });
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-lg border shadow-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Iniciar sesión
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="space-y-4">
                            {showTwoFactor ? (
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Código de verificación</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="123456"
                                                        type="text"
                                                        className="pl-10"
                                                    />
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="ejemplo@correo.com"
                                                            type="email"
                                                            className="pl-10"
                                                        />
                                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Contraseña</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="••••••••"
                                                            type="password"
                                                            className="pl-10"
                                                        />
                                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                <Button 
                                                    size="sm" 
                                                    variant="link" 
                                                    asChild 
                                                    className="px-0 font-normal"
                                                >
                                                    <Link href="/reset">
                                                        ¿Olvidaste tu contraseña?
                                                    </Link>
                                                </Button>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>
                        <FormError message={error || urlError} />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isPending}
                            type="submit"
                            className="w-full py-5 text-sm font-medium"
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {showTwoFactor ? "Verificar" : "Iniciar sesión"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};