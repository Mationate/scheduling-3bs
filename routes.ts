/**
 * Array de rutas públicas
 * No requieren autenticación
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/verificar",
    "/reset",
    "/new-password",
]

// Las rutas de API pública se manejan directamente en el middleware
// No es necesario listarlas aquí, ya que se filtran por prefijo

/**
 * Array de rutas privadas
 * Requieren autenticación
 * @type {string[]}
 */
export const authRoutes = [
    "/login",
    "/register",
    "/error"
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
export const DEFAULT_LOGIN_REDIRECT = "/admin"