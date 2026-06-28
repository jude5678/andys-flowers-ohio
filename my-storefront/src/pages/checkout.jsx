import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { medusa } from '../lib/sdk'; 

// Initialize Stripe outside the component render loops to avoid duplicate re-renders
const stripePromise = loadStripe('pk_test_51TIzQcDTKOEuTpmuoPJ9VwFDK3JZViceRb7zlGznAEidYNxLkOWPTupwqD1PGkHF3kUSvqVqX6jMUZMclIzB59iK0026vJFEpv');

const EmbeddedStripeForm = ({ stripeLoading, handleStripeSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  return (
    <form onSubmit={(e) => handleStripeSubmit(e, stripe, elements)}>
      <PaymentElement />
      <button 
        type="submit" 
        disabled={!stripe || stripeLoading} 
        style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', cursor: stripeLoading ? 'not-allowed' : 'pointer' }}
      >
        {stripeLoading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default function Checkout() {
  // 1. Core Cart & Input States
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem('userCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [senderInfo, setSenderInfo] = useState({ firstName: '', lastName: '', phone: '', email: '', deliveryDate: '' });
  const [recipientInfo, setRecipientInfo] = useState({ firstName: '', lastName: '', phone: '' });
  const [addressInfo, setAddressInfo] = useState({ company: '', city: '', address1: '', address2: '', zipcode: '', instructions: '' });
  const [giftMessage, setGiftMessage] = useState('');

  // Medusa-managed Stripe Secrets
  const [clientSecret, setClientSecret] = useState('');
  const [medusaCartId, setMedusaCartId] = useState(localStorage.getItem('medusa_cart_id') || '');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [submitText, setSubmitText] = useState('Pay Now');

  // Synchronize cart backup storage state
  useEffect(() => {
    sessionStorage.setItem('userCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = cartItems.length > 0 ? subtotal + 5 : 0;

  // 2. The combined submission function
  const handleStripeSubmit = async (event, stripe, elements) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    // Trigger frontend validation
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setStripeError(submitError.message);
      return;
    }

    try {
      setStripeLoading(true);
      setStripeError('');

      const { regions } = await medusa.regions.list();
      if (!regions || regions.length === 0) {
        throw new Error("No active operating sales regions found.");
      }
      const defaultRegionId = regions[0].id;

      // Get items from session storage
      const savedSessionCart = sessionStorage.getItem('userCart');
      const sessionItems = savedSessionCart ? JSON.parse(savedSessionCart) : [];

      const { cart } = await medusa.carts.create({
        email: senderInfo.email || "guest@auroraflowers.com",
        region_id: defaultRegionId,
        shipping_address: {
          first_name: recipientInfo.firstName || "Guest",
          last_name: recipientInfo.lastName || "Customer",
          address_1: addressInfo.address1 || "Pending Address",
          city: addressInfo.city || "Pending City",
          postal_code: addressInfo.zipcode || "00000",
          country_code: "us"
        }
      });

      // Synchronize the line items
      for (const item of sessionItems) {
        if (item.variant_id) {
          await medusa.carts.lineItems.create(cart.id, {
            variant_id: item.variant_id,
            quantity: parseInt(item.quantity) || 1
          });
        }
      }

      const { shipping_options } = await medusa.shippingOptions.listCartOptions(cart.id);
      if (shipping_options && shipping_options.length > 0) {
        await medusa.carts.addShippingMethod(cart.id, {
          option_id: shipping_options[0].id
        });
      }

      // Medusa v1 requires creating the payment session shell on the cart directly
      const { cart: fullyUpdatedCart } = await medusa.carts.createPaymentSessions(cart.id);

      // Find the Stripe session item out of the generated payment sessions array
      const stripeSession = fullyUpdatedCart.payment_sessions?.find(
        (session) => session.provider_id === "stripe"
      );

      if (!stripeSession) {
        throw new Error("Stripe payment session was not initialized properly by the backend.");
      }

      await medusa.carts.setPaymentSession(cart.id, {
        provider_id: "stripe"
      });

      const backendSecret = stripeSession.data?.client_secret;
      if (!backendSecret) {
        throw new Error("Could not retrieve backend validation tokens.");
      }

      // SECURE CONFIRMATION: Send token to Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: backendSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: senderInfo.email,
        },
      });

      if (error) {
        setStripeError(error.message);
      }
    } catch (err) {
      console.error("Payment pipeline execution crash:", err);
      setStripeError("Unable to securely authorize card transaction.");
    } finally {
      setStripeLoading(false);
    }
  };



  // 2. Medusa v2 Checkout Orchestration Lifecycle
//   useEffect(() => {
//     if (total === 0 || !medusa) return;

//   const initializeMedusaCheckout = async () => {

//     if (clientSecret) {
//       console.log("Stripe session is already initialized. Blocking duplicate API execution loops.");
//       return; 
//     }

//     try {
//       // Look up previous local storage identifiers to prevent duplicate carts
//       let activeCartId = localStorage.getItem('medusa_cart_id') || medusaCartId;
      
//       // DECLARE ONCE: Safe block-scoped initialization mapping
//       let currentCart = null;

//       // 1. Fetch backend sales Region configuration details 
//       const { regions } = await medusa.store.region.list();
//       if (!regions || regions.length === 0) {
//         throw new Error("No active operating sales regions found in Medusa Admin settings.");
//       }
//       const defaultRegionId = regions[0].id; 

//       // 2. Fetch locally stored storefront items from user session memory
//       const savedSessionCart = sessionStorage.getItem('userCart'); 
//       const sessionItems = savedSessionCart ? JSON.parse(savedSessionCart) : [];

//       // 3. Spawning or retrieving the cart database layer matrix
//       if (!activeCartId) {
//         console.log("No cart ID found in browser. Spawning new server cart template...");
//         const { cart } = await medusa.store.cart.create({
//           email: senderInfo.email || "guest@auroraflowers.com",
//           region_id: defaultRegionId,
//           shipping_address: {
//             first_name: recipientInfo.firstName || "Guest",
//             last_name: recipientInfo.lastName || "Customer",
//             address_1: addressInfo.address1 || "Pending Address",
//             city: addressInfo.city || "Pending City",
//             postal_code: addressInfo.zipcode || "00000",
//             country_code: "us"
//           }
//         });
        
//         activeCartId = cart.id;
//         setMedusaCartId(cart.id);
//         localStorage.setItem('medusa_cart_id', cart.id);
//         currentCart = cart;
//       } else {
//         // Fetch existing record baseline shell structure data
//         const response = await medusa.store.cart.retrieve(activeCartId, {
//           fields: "+total,+items,+shipping_methods"
//         });
//         currentCart = response.cart;
//       }

//       // 4. Synchronization Fallback: Push line items to the cart row if it's currently empty
//       if (!currentCart.items || currentCart.items.length === 0) {
//         console.log(`Synchronizing ${sessionItems.length} items to database cart ID: ${activeCartId}`);
        
//         for (const item of sessionItems) {
//           if (item.variant_id) {
//             // Medusa v2 strictly requires parameters nested inside a 'line_item' block wrapper
//             await medusa.store.cart.createLineItem(activeCartId, {
//                 variant_id: item.variant_id,
//                 quantity: parseInt(item.quantity) || 1
//             });
//           }
//         }
        
//         // 5. Force Fulfillment Configuration Binding to enable tax and price total metrics
//         const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
//           cart_id: activeCartId
//         });

//         if (shipping_options && shipping_options.length > 0) {
//           await medusa.store.cart.addShippingMethod(activeCartId, {
//             option_id: shipping_options[0].id
//           });
//           console.log("Successfully bound regional shipping method to frame.");
//         }

//         // Refetch the completely populated database row
//         const refreshed = await medusa.store.cart.retrieve(activeCartId, {
//           fields: "+total,+items,+shipping_methods"
//         });
//         currentCart = refreshed.cart;
//       }

//       console.log("FINAL SERVER TOTAL COMPILATION SUCCESS:", currentCart.total);

//       // 6. Stripe Verification Safeguard
//       if (currentCart.total < 50) {
//         setStripeError(`Calculated cart value (${currentCart.total}) fails Stripe's minimum boundary.`);
//         return; 
//       }

//       // 7. Invoke Payment Collection initialization passing the full Cart context object
//       const { payment_collection } = await medusa.store.payment.initiatePaymentSession(
//         currentCart, 
//         { 
//           provider_id: "pp_stripe_stripe",
//           // Force the inner data object to be empty so Medusa doesn't append an empty payment_method string
//           data: {} 
//         }
//       );

//       // 8. Capture Token strings to cleanly paint Stripe inputs across the UI
//       const activeSession = payment_collection?.payment_sessions?.[0];
//       if (activeSession?.data?.client_secret) {
//         setClientSecret(activeSession.data.client_secret);
//         setStripeError(''); // Reset old warnings safely
//       }

//     } catch (err) {
//       console.error('Medusa Stripe initialization error stack trace:', err);
//       setStripeError('Payment collection system failed to generate validation tokens.');
//     }
//   };

//   initializeMedusaCheckout();
// }, [total, medusaCartId]);


// // STRIPE SUB-COMPONENT (Handles Form Submission)
// function StripeForm({ stripeLoading, submitText, handleStripeSubmit }) {
//   const stripe = useStripe();
//   const elements = useElements();

//   const onSubmitHandler = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;
    
//     // call the parent state logic pass-through
//     handleStripeSubmit(stripe, elements);
//   };

//   return (
//     <form id="stripe-form" onSubmit={onSubmitHandler}>
//       <PaymentElement style={{ marginBottom: '20px' }} />
//       <button type="submit" id="stripe-submit-btn" disabled={stripeLoading}>
//         {submitText}
//       </button>
//     </form>
//   );
// }


//   const handleStripeSubmit = async (stripe, elements) => {
//     setStripeLoading(true);
//     setSubmitText('Processing...');
//     setStripeError('');

//     const result = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: `${window.location.origin}/success`,
//       },
//     });

//     if (result.error) {
//       setStripeError(result.error.message);
//       setStripeLoading(false);
//       setSubmitText('Pay Now');
//     }
//   };

return (
  <div id="page-wrapper">
    <div className="checkoutPage">
      <h1>Checkout</h1>
      <div className="checkoutColumns">
        
        {/* LEFT COLUMN: Customer Information Inputs */}
        <div className="columnOne">
          <div className="sendingFrom">
            <h2>Sending from</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="lineOne">
                <label htmlFor="senderFirstName"> First name * 
                  <input type="text" id="senderFirstName" required value={senderInfo.firstName} onChange={(e) => setSenderInfo({...senderInfo, firstName: e.target.value})} />
                </label>
                <label htmlFor="senderLastName"> Last name * 
                  <input type="text" id="senderLastName" required value={senderInfo.lastName} onChange={(e) => setSenderInfo({...senderInfo, lastName: e.target.value})} />
                </label>
              </div>
              <div className="lineTwo">
                <label htmlFor="senderPhone"> Phone 
                  <input type="text" id="senderPhone" value={senderInfo.phone} onChange={(e) => setSenderInfo({...senderInfo, phone: e.target.value})} />
                </label>
                <label htmlFor="senderEmail"> Email address * 
                  <input type="email" id="senderEmail" required value={senderInfo.email} onChange={(e) => setSenderInfo({...senderInfo, email: e.target.value})} />
                </label>
              </div>
              <div className="lineThree">
                <label htmlFor="deliveryDate"> Delivery Date * 
                  <input type="date" id="deliveryDate" className="custom-date" required value={senderInfo.deliveryDate} onChange={(e) => setSenderInfo({...senderInfo, deliveryDate: e.target.value})} />
                </label>
              </div>
            </form>
          </div>

          <div className="deliveringTo">
            <h2>Delivering to</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="lineOne">
                <label htmlFor="recipientFirstName"> First name * 
                  <input type="text" id="recipientFirstName" required value={recipientInfo.firstName} onChange={(e) => setRecipientInfo({...recipientInfo, firstName: e.target.value})} />
                </label>
                <label htmlFor="recipientLastName"> Last name * 
                  <input type="text" id="recipientLastName" required value={recipientInfo.lastName} onChange={(e) => setRecipientInfo({...recipientInfo, lastName: e.target.value})} />
                </label>
              </div>
              <div className="lineThree">
                <label htmlFor="recipientPhone"> Phone 
                  <input type="text" id="recipientPhone" value={recipientInfo.phone} onChange={(e) => setRecipientInfo({...recipientInfo, phone: e.target.value})} />
                </label>
              </div>
            </form>
          </div>

          <div className="recipientAddress">
            <h2>Recipient Address</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="lineThree">
                <label htmlFor="company"> Company Name 
                  <input type="text" id="company" value={addressInfo.company} onChange={(e) => setAddressInfo({...addressInfo, company: e.target.value})} />
                </label>
              </div>
              <div className="lineOne">
                <label htmlFor="state"> State / County * 
                  <input type="text" id="state" placeholder="Ohio" disabled />
                </label>
                <label htmlFor="city"> Town / City * 
                  <input type="text" id="city" required value={addressInfo.city} onChange={(e) => setAddressInfo({...addressInfo, city: e.target.value})} />
                </label>
              </div>
              <div className="lineOne">
                <label htmlFor="address1"> Address Line 1 * 
                  <input type="text" id="address1" required value={addressInfo.address1} onChange={(e) => setAddressInfo({...addressInfo, address1: e.target.value})} />
                </label>
                <label htmlFor="address2"> Address Line 2 
                  <input type="text" id="address2" value={addressInfo.address2} onChange={(e) => setAddressInfo({...addressInfo, address2: e.target.value})} />
                </label>
              </div>
              <div className="lineThree">
                <label htmlFor="zipcode"> Postcode / ZIP * 
                  <input type="text" id="zipcode" required value={addressInfo.zipcode} onChange={(e) => setAddressInfo({...addressInfo, zipcode: e.target.value})} />
                </label>
              </div>
              <div className="lineThree">
                <label htmlFor="deliveryInstructions"> Delivery Instructions * 
                  <textarea id="deliveryInstructions" rows="4" required placeholder="Please specify any additional delivery details here, we aim to deliver all orders between 10am-4pm." value={addressInfo.instructions} onChange={(e) => setAddressInfo({...addressInfo, instructions: e.target.value})} />
                </label>
              </div>
            </form>
          </div>

          <div className="giftMessage">
            <h2>Gift message</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="lineThree">
                <label htmlFor="giftMessageInput">
                  <textarea id="giftMessageInput" rows="4" placeholder="Please note your name is not automatically added to the gift message" value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} />
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Invoice Breakdown Grid */}
        <div className="yourOrder">
          <h2>Your Order</h2>
          <table>
            <tbody>
              <tr>
                <td>Product</td>
                <td>Subtotal</td>
              </tr>
              <tr>
                <td>
                  <ul className="cart-item-names">
                    {cartItems.map((item, index) => (
                      <li key={index} style={{ fontSize: '0.8em', display: 'flex', justifyContent: 'center', marginBottom: '.3em' }}>
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <img src={item.thumbnail} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                          <div>{item.name} x{item.quantity}</div>
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td><p>${subtotal.toFixed(0)}</p></td>
              </tr>
              <tr>
                <td>Subtotal</td>
                <td>${subtotal.toFixed(0)}</td>
              </tr>
              <tr>
                <td>Shipment</td>
                <td>Standard Fixed Shipping Included.</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td>$5</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>${total.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>

          {/* EMBEDDED STRIPE COMPONENT BLOCK */}
          {total > 0 ? (
            <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }} className='stripe-component'>
              <h3>Complete Your Payment</h3>
              <Elements 
                stripe={stripePromise} 
                options={{
                  mode: 'payment',
                  amount: Math.round(total * 100), // Converted cleanly to cents integer for Stripe processing
                  currency: 'usd',
                }}
              >
                <EmbeddedStripeForm 
                  stripeLoading={stripeLoading} 
                  handleStripeSubmit={handleStripeSubmit} 
                />
              </Elements>
              {stripeError && <div id="stripe-error" style={{ color: 'red', marginTop: '10px' }}>{stripeError}</div>}
            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  </div>
);
}


