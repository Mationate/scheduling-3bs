"use client"
import { useRouter } from "next/navigation";


interface LoginButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
};


export const LoginButton = ({
    children,
    mode = "redirect",
    asChild = false,
}: LoginButtonProps) => {
    const router = useRouter();

    const onClick = () => {
        router.push("/login");
    }
    if (mode === "modal") {
        return (
            <span  className="cursor-pointer">
            {/* TODO: MODAL */}
            </span>
        )
    }
  return (
    <span onClick={onClick} className="cursor-pointer">
        {children}
    </span>
  )
}
