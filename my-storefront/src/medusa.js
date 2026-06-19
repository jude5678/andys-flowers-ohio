import Medusa from "@medusajs/js-sdk";

const medusa = new Medusa({ 
  baseUrl: "http://localhost:9000", 
  maxRetries: 3,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY
});

export default medusa;
