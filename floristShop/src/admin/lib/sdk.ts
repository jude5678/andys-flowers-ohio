import Medusa from "@medusajs/js-sdk"

// 1. Read variables using Vite syntax
const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://mutual-crush-shorten.medusajs.app"
const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ""

// 2. Initialize the SDK safely
export const sdk = new Medusa({
  baseUrl: backendUrl,
  debug: import.meta.env.DEV, // Vite's native way to check for development mode
  publishableKey: publishableKey,
})