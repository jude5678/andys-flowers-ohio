// 1. Swap the static imports for standard functional requires
const { loadEnv, defineConfig } = require('@medusajs/framework/utils');
const path = require("path");
const { fileURLToPath } = require("url");

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

const config = defineConfig({
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
    vite: {
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src/admin"),
        },
      },
    },
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
});

// 2. Export via both patterns simultaneously to satisfy all variations of the Medusa loader
module.exports = config;
