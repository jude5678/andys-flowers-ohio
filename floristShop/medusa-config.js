import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from "path"
import { fileURLToPath } from "url";

// define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STOREFRONT_CORS || "http://localhost:5173",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:5173,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  
  admin: {
    vite: () => ({
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src/admin"),
        },
      },
    }),
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment", 
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe", 
            id: "stripe", 
            options: {
              apiKey: process.env.STRIPE_API_KEY, 
            },
          },
        ],
      },
    },
  ],
})
