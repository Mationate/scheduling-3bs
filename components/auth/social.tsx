"use client"

import { FcGoogle } from "react-icons/fc"
import { Button } from "../ui/button"
export const Social = () => {
    return(
        <div className="flex items-center w-full gap-x-2">
            <Button onClick={() => {}} variant="outline" size="lg" className="w-full">
                <FcGoogle className="h-5 w-5" />
            </Button>
        </div>
    )
}