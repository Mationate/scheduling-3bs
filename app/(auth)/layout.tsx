const AuthLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return ( 
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" />
            {children}
        </div>
     );
}
 
export default AuthLayout;