import Medusa from "@medusajs/js-sdk"

// let MEDUSA_BACKEND_URL = "http://localhost:9000"
// if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
//   MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
// }

export const sdk = new Medusa({
  baseUrl: process.env.VITE_BACKEND_URL || "mutual-crush-shorten.medusajs.app",
  // debug: process.env.NODE_ENV === "development",
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})