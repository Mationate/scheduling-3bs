import { CardWrapper } from "./card-wrapper"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export const ErrorCard = () => {
    return (
       <CardWrapper
       headerLabel="Algo pasó !"
       backButtonLabel="Volver"
       backButtonHref="/login"
       >
        <div className="w-full flex justify-center items-center">
            <ExclamationTriangleIcon className="text-destructive"/>

        </div>
       </CardWrapper>
    )
}
