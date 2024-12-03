"use client"
import * as z from "zod"
import { useEffect, useState, useTransition } from "react"
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
import { CardWrapper } from "./card-wrapper"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"
import { login } from "@/actions/login"
import Link from "next/link"

type LoginResponse = {
  error?: string;
  success?: string;
  twoFactor?: boolean;
};

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
    })
    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");
        startTransition(() => {
            login(values)
            .then((data: LoginResponse | undefined) => {
                if(data?.error){
                    form.reset();
                    setError(data.error);
                }
                if(data?.success){
                    form.reset();
                    setSuccess(data.success);
                }
                if(data?.twoFactor){
                    setShowTwoFactor(true);
                }
            })
            .catch(() => setError("Algo salió mal"));
        })
    }
    return(
       <CardWrapper 
       headerLabel="Bienvenid@ !"
        backButtonLabel="No tienes cuenta? Registrate"
        backButtonHref="/register"
        showSocial
       >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                    <div className="space-y-4">
                        {showTwoFactor && (
                            <FormField
                            control={form.control}
                            name="code"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel htmlFor="code">Código de dos factores</FormLabel>
                                    <FormControl>
                                        <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder="123456"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        )}
                        {!showTwoFactor && (
                        <>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Correo</FormLabel>
                                        <FormControl>
                                            <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="email@gmail.com"
                                            type="email"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">Contraseña</FormLabel>
                                        <FormControl>
                                            <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="******"
                                            type="password"
                                            />
                                        </FormControl>
                                        <Button size="sm" variant="link" asChild className="px-0 font-normal">
                                            <Link href="/reset">
                                                Olvidé mi contraseña
                                            </Link>
                                        </Button>
                                        <FormMessage/>
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
                    className="w-full "
                    >
                        {showTwoFactor ? "Verificar" : "Iniciar sesión"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}