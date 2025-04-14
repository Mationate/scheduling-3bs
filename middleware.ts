import NextAuth from "next-auth";
import authConfig from "./auth.config";
import {
    DEFAULT_LOGIN_REDIRECT,
    apiAuthPrefix,
    authRoutes,
    publicRoutes,
} from "@/routes"
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isApiPublicRoute = nextUrl.pathname.startsWith("/api/public");
    const isBookingsApi = nextUrl.pathname.startsWith("/api/bookings/");
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    if(isApiAuthRoute || isApiPublicRoute || isBookingsApi) {
        return null;
    }
    if(isAuthRoute){
        if(isLoggedIn){
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }
    if(!isLoggedIn && !isPublicRoute){
        return Response.redirect(new URL("/login", nextUrl));
    }
    return null;
})

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
    matcher: [
        // Excluir archivos estáticos y _next
        "/((?!_next|.*\\..*).*)",
        // Incluir solo la raíz
        "/",
        // Incluir las rutas de API excepto las públicas y auth
        "/api/:path*",
    ],
}