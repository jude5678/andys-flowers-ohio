import 'dotenv/config'; // Import as module
console.log('Environment loaded, STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
import Stripe from 'stripe'
import express from 'express'
const app = express()
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const floristShopDir = path.join(__dirname, '..', 'html5up-alpha')
import cookieParser from 'cookie-parser'
import cors from 'cors';
import { Resend } from 'resend';
import { useEffect, useState } from "react"
export default function ProductPrice({ id, region }){
    const [product, setProduct] = useState()}

// Initialize Stripe once, not in every request
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PORT = 8000


app.use(cookieParser())

// allow react app to talk to this server
app.use(cors());

// parses JSON request bodies
app.use(express.json());

app.set('view engine', 'ejs')


app.get('/floralarrangements', async (req, res) => {    

    try{
        // 1. get collection by handle
        const { collections } = await sdk.store.collection.list({
            handle: "floral-arrangements",
        },
        {
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }
        )
        //console.log("collections", collections)

        if (!collections.length){
            return res.status(404).render('collection-not-found')
        }

        const collection = collections[0]

        // get region
        const regionId = req.cookies.region_id;
        let region;

        if (regionId) {
            const { region: dataRegion } = await sdk.store.region.retrieve(regionId, {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
            });
            region = dataRegion;
        } else {
            // If no cookie, get the list of regions
            const { regions } = await sdk.store.region.list({}, {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
            });
            // CRITICAL FIX: Assign the first item of the array to your 'region' variable
            region = regions[1]; 
        }

        // Safety check: ensure region was found
        if (!region || !region.id) {
            throw new Error("No region found to calculate prices.");
        }

        // 2. get products in that collection
        const { products } = await sdk.store.product.list({
            collection_id: collection.id,
            limit: 20,
            region_id: region.id, // pass pricing context here
            fields: `*variants.calculated_price` // include pricing fields
        },
        {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }
        )
        //console.log("products", products)

        // 3. loop through products to format their prices for the UI
        const formattedProducts = products.map(product => {
            const variant = product.variants[0]
            const amount = variant?.calculated_price?.calculated_amount || 0

            // format the price for this specific product
            const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: region.currency_code,
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }).format(amount)

            // return product with the new price property attached
            return {
                ...product,
                formattedPrice: formattedPrice
            }
        })

        // render ejs view, passing products (and collection) to the template
        res.render('floralarrangements.ejs', {
            collection: collections,
            products: formattedProducts,
        })
    } catch(error){
        console.error(error)
        res.status(500).render('error')
    }
})

app.get('/plants', async (req, res) => {    

    try{
        // 1. get collection by handle
        const { collections } = await sdk.store.collection.list({
            handle: "plants",
        },
        {
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }
        )
        //console.log("collections", collections)

        if (!collections.length){
            return res.status(404).render('collection-not-found')
        }

        const collection = collections[0]

        // get region
        const regionId = req.cookies.region_id;
        let region;

        if (regionId) {
            const { region: dataRegion } = await sdk.store.region.retrieve(regionId, {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
            });
            region = dataRegion;
        } else {
            // If no cookie, get the list of regions
            const { regions } = await sdk.store.region.list({}, {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
            });
            // CRITICAL FIX: Assign the first item of the array to your 'region' variable
            region = regions[1]; 
        }

        // Safety check: ensure region was found
        if (!region || !region.id) {
            throw new Error("No region found to calculate prices.");
        }

        // 2. get products in that collection
        const { products } = await sdk.store.product.list({
            collection_id: collection.id,
            limit: 20,
            region_id: region.id, // pass pricing context here
            fields: `*variants.calculated_price` // include pricing fields
        },
        {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
        }
        )
        //console.log("products", products)

        // 3. loop through products to format their prices for the UI
        const formattedProducts = products.map(product => {
            const variant = product.variants[0]
            const amount = variant?.calculated_price?.calculated_amount || 0

            // format the price for this specific product
            const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: region.currency_code,
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }).format(amount)

            // return product with the new price property attached
            return {
                ...product,
                formattedPrice: formattedPrice
            }
        })

        // // render ejs view, passing products (and collection) to the template
        // res.render('floralarrangements.ejs', {
        //     collection: collections,
        //     products: formattedProducts,
        // })
    } catch(error){
        console.error(error)
        res.status(500).render('error')
    }
})

app.get('/checkout', (req, res) => {
    res.render('checkout')
})

// when customer submits order
app.post('/create-payment-intent', async (req, res) => {
    console.log('Payment intent endpoint called');
    console.log('Request body:', req.body);
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);
    console.log('All env vars:', Object.keys(process.env));

    try {
        // load from stripe environment variable
        const { amount, currency, customer_email } = req.body;

        console.log('Creating PaymentIntent with:', { amount, currency, customer_email });

        // create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: currency,
            receipt_email: customer_email,
            // metadata about the order
            metadata: { 
            order_id: 'your-order-id'
            }
        });

        console.log('PaymentIntent created:', paymentIntent.id);
        console.log('Client secret:', paymentIntent.client_secret);

        // send the client secret to the client
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        res.status(500).json({ error: error.message });
    }
});


// Webhook endpoint
app.post('/webhook', (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        'whsec_your_webhook_secret'
      );
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Fulfill the order
        fulfillOrder(paymentIntent);
      }
      
      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// initialize resend with api key
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || "Andy <contact@andysflowersohio.com>";

// email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate inputs
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    // Trigger the email send via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email, // Dynamic destination from user input
      subject: `Wedding Consultation Request - ${name}`,
      html: `<h1>Hi ${name}!</h1><p>Thank you for reaching out. We will get in touch with you soon to set up your wedding consultation.</p>`,
      text: `Hi ${name}! Thank you for reaching out. We will get in touch with you soon to set up your wedding consultation.`
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Success response to React
    return res.status(200).json({ success: true, id: data?.id });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//serve files for all paths
app.use('/assets', express.static(path.join(__dirname, 'html5up-alpha/assets')))

// serve static files with proper MIME types
app.use(express.static(floristShopDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      }
    }
  }))



app.listen(PORT, (req, res) => {
    console.log(`listening on PORT: ${PORT}`)
})