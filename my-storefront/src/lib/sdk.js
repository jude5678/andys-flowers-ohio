import Medusa from "@medusajs/js-sdk"

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://mutual-crush-shorten.medusajs.app"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_0b45406e09276b3cdb1c28630d0054f8ae129687e21c9be359c76adf65ef67f4"
})

