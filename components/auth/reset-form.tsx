"use client"
import * as z from "zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { reset } from "@/actions/reset"
import { ResetSchema } from "@/schemas"
export const ResetForm = () => {
    const [isPending, startTransition] = useTransition();
    const [error, seterror] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        }
    })
    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        seterror("");
        setSuccess("");
        startTransition(() => {
            reset(values)
            .then((data) => {
                seterror(data?.error);
                setSuccess(data?.success);
            })
        })
    }
    return(
       <CardWrapper 
       headerLabel="Olvidé mi contraseña"
        backButtonLabel="Volver al inicio de sesión"
        backButtonHref="/login"
       >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                    <div className="space-y-4">
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
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full "
                    >
                        Enviar correo de recuperación
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}