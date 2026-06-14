import Medusa from "@medusajs/js-sdk";

const medusa = new Medusa({ 
  baseUrl: "http://localhost:9000", 
  maxRetries: 3,
  publishableKey: 'pk_0b45406e09276b3cdb1c28630d0054f8ae129687e21c9be359c76adf65ef67f4'
});

export default medusa;
