import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/index';
import FloralArrangements from './pages/floralarrangements';
import Checkout from './pages/checkout';
import AboutUs from './pages/aboutus';
import Plants from './pages/plants';
import HomeDecor from './pages/homedecor';
import Weddings from './pages/weddings';
import { createPortal } from 'react-dom';
import { medusa } from "./lib/sdk";


export default function App() {

  // content state and cart visibility
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, right: 0 });
  const subtotalRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem('userCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const wrapperRef = useRef(null);
  const [regionContext, setRegionContext] = useState({ id: null, currency_code: 'usd' });
  const [isRegionLoading, setIsRegionLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [products, setProducts] = useState([]); 

  // loading states
  useEffect(() => { 
    // check if region was cached locally 
    const savedRegion = localStorage.getItem('medusa_region'); 
    if (savedRegion) { 
      setRegionContext(JSON.parse(savedRegion)); 
      setIsRegionLoading(false); // <-- Stop loading because we found a cached region
      return; 
    } 
    
    // if not, fetch default store region from backend 
    medusa.regions.list({ limit: 1 }) 
      .then(({ regions: fetchedRegions }) => { 
        if (fetchedRegions && fetchedRegions.length > 0) { 
          let defaultRegion = { 
            id: fetchedRegions[0].id, 
            currency_code: fetchedRegions[0].currency_code 
          }; 
          setRegionContext(defaultRegion); 
          localStorage.setItem('medusa_region', JSON.stringify(defaultRegion)); 
        } 
      }) 
      .catch(err => { 
        console.error('Could not initialize storefront region context', err); 
      })
      .finally(() => {
        setIsRegionLoading(false); // <-- stop loading whether API succeeded or failed
      });
  }, []);

  useEffect(() => {
    // Stop if region isn't loaded yet to avoid $0.00 pricing issues
    if (!regionContext || !regionContext.id) return;

    setIsProductsLoading(true);

    // Pass the region_id so Medusa calculates correct taxes and local prices
    medusa.products.list({
      region_id: regionContext.id,
    })
    .then(({ products: fetchedProducts }) => {
      setProducts(fetchedProducts);
    })
    .catch(err => {
      console.error("Failed to fetch products:", err);
    })
    .finally(() => {
      setIsProductsLoading(false);
    });
  }, [regionContext]); 
  

  const handlePointerEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  
    // Calculate exactly where the subtotal button sits on the screen
    if (subtotalRef.current) {
      const rect = subtotalRef.current.getBoundingClientRect();
      setDropdownCoords({
        // Place it exactly at the bottom edge of the subtotal button
        top: rect.bottom + window.scrollY,
        // Align it to the right edge of the subtotal button
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
    setIsCartVisible(true);
  };

  
  const handlePointerLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsCartVisible(false);
    }, 200);
  };

   // synchronize cart state to session storage
   useEffect(() => {
    sessionStorage.setItem('userCart', JSON.stringify(cartItems));
  }, [cartItems]);

  //total calculation
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);


  const handleAddClick = (e, product) => {
    e.preventDefault();

     // 1. CRITICAL V2 FIX: Extract the actual Medusa database variant ID string
    const variantId = product.variants?.[0]?.id || "";
    
    if (!variantId) {
      console.error("This product cannot be added because it has no active variant ID on the backend.");
      return;
    }

    // Medusa v2 products return calculated raw integer prices (e.g. 1000 = $10.00) or standard formats
    const priceValue = product.variants?.[0]?.calculated_price?.calculated_amount ?? 0;
    const thumbnail = product.thumbnail || product.images?.[0]?.url || "";
    
    setCartItems(prevItems => {
      // Match by variant_id instead of name for accurate database tracking
      const existingItem = prevItems.find(item => item.variant_id === variantId);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.variant_id === variantId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      // 2. Return the item, now explicitly carrying the mandatory 'variant_id' string parameter
      return [...prevItems, { 
        variant_id: variantId, // <-- THIS FIXES STRIPE ON THE CHECKOUT PAGE
        thumbnail: thumbnail, 
        name: product.title, 
        price: priceValue, 
        quantity: 1 
      }];
    });
  };

  const handleRemoveClick = (indexToRemove) => {
    setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const updateQuantity = (index, delta) => {
    setCartItems(prevItems => prevItems.map((item, i) => {
      if (i === index) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // make sure sessionStorage stays populated with the variant_id strings
  useEffect(() => {
    sessionStorage.setItem('userCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside BOTH the trigger icon and the portal dropdown
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !event.target.closest(".global-portal-cart")
      ) {
        setIsCartVisible(false);
      }
    }

    
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, []);

  return (
    <div id="page-wrapper">
      <Router>
        
        <header id="header">

        <section id="banner-two">
          <h2><Link to="/">Andy's Flowers Ohio</Link></h2>
          
          <div
            ref={wrapperRef}
            className="cart-hover-wrapper"
            onPointerEnter={() => setIsCartVisible(true)} 
            onPointerLeave={() => setIsCartVisible(false)}
            onClick={() => setIsCartVisible(!isCartVisible)} /* for mobile taps */
          >
            <div className="subtotal">
              <img src="/icons/shopping_bag_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Shopping Bag" className="cart-icon"/>
              <p className="cart-price">${total.toFixed(2)}</p>
            </div>

            {/* remove the cart dropdown from the header DOM tree */}
            {isCartVisible && createPortal(
                <div className="cart-dropdown global-portal-cart">
                  {cartItems.length === 0 ? (
                    <p className="cart-empty">Your cart is empty.</p>
                  ) : (
                    <ul className="cart-item-names">
                      {cartItems.map((item, index) => (
                        <li key={index} style={{ fontSize: '0.9em', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ display: 'flex', gap: '8px' }}>
                            <img src={item.thumbnail} alt={item.name} style={{ width: '3em', height: '3em', objectFit: 'contain', borderRadius: '4px' }} />
                            <div>{item.name} - ${item.price.toFixed(2)} (x{item.quantity})</div>
                          </span>
                          <div>
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(index, -1)}}>-</button>
                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(index, 1)}}>+</button>
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveClick(index)}} style={{ marginLeft: '10px', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>
                              [Remove]
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="checkoutButton">
                    <a className="checkout" href="/checkout">Checkout</a>
                  </div>
                </div>,
              document.body // mount the HTML right inside the root <body>
            )}
          </div>
        </section>
         
          
          <nav id="nav">
            <ul>
              <li><Link to="/" className="button">Home</Link></li>
              <li>
                <Link to="/floralarrangements" className="icon solid fa-angle-down">Floral Arrangements</Link>
              </li>
              <li><Link to="/homedecor" className="button">Home Decor</Link></li>
              <li><Link to="/plants" className="button">Plants</Link></li>
              <li><Link to="/weddings" className="button">Weddings</Link></li>
              <li><Link to="/aboutus" className="button">About Us</Link></li>
            </ul>
          </nav>

        </header>

        <main id="main">
          <Routes>
            {/* 1. Pass handleAddClick down to the home page route */}
            <Route 
              path="/" 
              element={<Home onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />
            
            {/* 2. Pass handleAddClick down to the floral arrangements route */}
            <Route 
              path="/floralarrangements" 
              element={<FloralArrangements onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />
            
            <Route 
              path="/checkout" 
              element={<Checkout cartItems={cartItems} total={total} 
              regionContext={regionContext} />} 
            />

            <Route 
              path="/aboutus" 
              element={<AboutUs onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />

            <Route 
              path="/plants" 
              element={<Plants onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />

            <Route 
              path="/homedecor" 
              element={<HomeDecor onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />

            <Route 
              path="/weddings" 
              element={<Weddings onAddToCart={handleAddClick} 
              regionContext={regionContext} />} 
            />
          </Routes>
        </main>

        {/* CTA / Info Elements Section */}
        <section id="cta">
          <section className="about-us">
            <h2>About Us</h2>
            <p>
              Aurora Flower Shoppe is a floral boutique that offers beautiful designs for several different occasions. We are dedicated to serving our guests with specialized floral arrangements that will make any moment that much more meaningful.
            </p>
          </section>
          <section className="hours">
            <h2>Store Hours</h2>
            <p>
              Mon: 9AM - 4PM<br />
              Tues: 9AM - 4PM<br />
              Wed: 9AM - 4PM<br />
              Thurs: 9AM - 4PM<br />
              Fri: 9AM - 6PM<br />
              Sat: 10AM - 6PM<br />
              Sun: Closed
            </p>
          </section>
          <section className="contact-us">
            <h2>Contact Us</h2>
            <p>Phone: 440-###-####</p>
          </section>
        </section>

        {/* Global Application Footer Markup */}
        <footer id="footer">
          <ul className="icons">
            <li>
              <a href="https://facebook.com" className="icon" aria-label="Facebook" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style={{ fill: 'currentColor', width: '20px', height: '20px' }}>
                  <path d="M80 299.3V256H12v-54.7h68v-39.7c0-67.4 41.1-104 101.2-104 28.8 0 53.5 2.1 60.7 3v70.5h-41.8c-32.7 0-39 15.5-39 38.3v50.2h78l-10.2 54.7h-67.8V448H164V299.3H80z"/>
                </svg>
                <span className="label">Facebook</span>
              </a>
            </li> 

            <li>
              <a href="https://instagram.com" className="icon" aria-label="Instagram" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ fill: 'currentColor', width: '20px', height: '20px' }}>
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
                <span className="label">Instagram</span>
              </a>
            </li>

            <li>
              <a href="#" className="icon brands fa-envelope">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 512 512" style={{ fill: 'currentColor' }}>
                  <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
                </svg>
                <span className="label">Envelope</span>
              </a>
            </li>
          </ul>
          <ul className="copyright">
            <li>&copy; Andy's Flowers Ohio</li>
            <li>Design: <a href="http://html5up.net" target="_blank" rel="noreferrer">HTML5 UP</a></li>
          </ul>
        </footer>

      </Router>
    </div>
  );
}