/**
 * Array de rutas públicas
 * No requieren autenticación
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
]

/**
 * Array de rutas privadas
 * Requieren autenticación
 * @type {string[]}
 */
export const authRoutes = [
    "/login",
    "/register",
]

/**
 * Prefijo de API de autenticación
 * Rutas que empiecen con este prefijo son usadas para API de autenticación
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Ruta de redirección por defecto al iniciar sesión
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings"