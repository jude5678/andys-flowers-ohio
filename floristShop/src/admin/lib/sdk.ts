import Medusa from "@medusajs/js-sdk"

// 1. Read variables using Vite syntax
const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://mutual-crush-shorten.medusajs.app"
const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_0b45406e09276b3cdb1c28630d0054f8ae129687e21c9be359c76adf65ef67f4"

// 2. Initialize the SDK safely
export const sdk = new Medusa({
  baseUrl: backendUrl,
  debug: import.meta.env.DEV, // Vite's native way to check for development mode
  publishableKey: publishableKey,
})