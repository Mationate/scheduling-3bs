"use client"
import { useCallback, useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { newVerification } from "@/actions/new-verification"
import { CardWrapper } from "./card-wrapper"
import { useSearchParams } from "next/navigation"
import { FormError } from "../form-error"
import { FormSuccess } from "../form-success"

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;
        if(!token) {
            setError("No se ha proporcionado un token de verificación")
            return;
        }
        newVerification(token)
        .then((data) => {
            setSuccess(data.success);
            setError(data.error);
        })
        .catch((e) => {
            setError("Ha ocurrido un error");
        })
    }, [token, success, error]);


    useEffect(() => {
        onSubmit();        
    }, [onSubmit]);

  return (
    <CardWrapper
        headerLabel="Verificar correo"
        backButtonHref="/auth/login"
        backButtonLabel="Volver"
    >
        <div className="flex items-center w-full justify-center">
            {!success && !error && (
                <BeatLoader />
            )}
            <FormSuccess message={success} />
            {!success && (
                <FormError message={error} />
            )}
        </div>
    </CardWrapper>
  )
}
