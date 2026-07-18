import Medusa from "@medusajs/medusa-js"

const backendUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL || "https://mutual-crush-shorten.medusajs.app" 
const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || "pk_0b45406e09276b3cdb1c28630d0054f8ae129687e21c9be359c76adf65ef67f4"

export const sdk = new Medusa({
  baseUrl: backendUrl,
  maxRetries: 3,
  publishableApiKey: publishableKey
})

export const medusa = new Medusa({
  baseUrl: backendUrl,
  maxRetries: 3,
  publishableApiKey: publishableKey
})

export default sdk;
