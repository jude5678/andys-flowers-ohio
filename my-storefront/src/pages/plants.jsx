import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";


export default function Plants({ onAddToCart }) {
    // 1. Fetch the collection using the Medusa v2 "collection" namespace
    const { 
      data: collectionData, 
      isLoading: isCollectionLoading, 
      isError: isCollectionError, 
      error: collectionError 
    } = useQuery({
      queryKey: ['collections', 'plants'],
      queryFn: () => medusa.store.collection.list({ handle: 'plants' }),
    });
  
    // Extract the target collection ID once the first query finishes
    const collectionId = collectionData?.collections?.[0]?.id;
  
    // 2. Fetch products only when the collection ID is successfully retrieved
    const { 
      data: productData, 
      isLoading: isProductLoading, 
      isError: isProductError, 
      error: productError 
    } = useQuery({
      queryKey: ['products', { collectionId }],
      queryFn: () => medusa.store.product.list({ 
        collection_id: [collectionId], 
        fields: "*variants.calculated_price" // Injects Medusa v2 calculation engine
      }),
      enabled: !!collectionId, 
    });
  
    // Extract products safely from the second query
    const products = productData?.products || [];
  
    // Consolidate early return layouts for both network states
    if (isCollectionLoading || (collectionId && isProductLoading)) {
      return <div className="loading-state">Loading beautiful arrangements...</div>;
    }
  
    if (isCollectionError || isProductError) {
      const errorMsg = collectionError?.message || productError?.message;
      return <div className="error-state">Failed to fetch products: {errorMsg}</div>;
    }
  
    return (
      <main id="plants">
        <ul className="plant-container">
          {products.map((product) => {
            const productImg = product.thumbnail || product.images?.[0]?.url;
            
            // FIX: Safely parse Medusa v2 calculated_price properties
            const calcPrice = product.variants?.[0]?.calculated_price;
            let displayPrice = "Price unavailable";
  
            if (calcPrice) {
              // Fetch the raw clean amount (Medusa v2 directly returns formatted floats, e.g., 65)
              const trueAmount = calcPrice.calculated_amount ?? 0;
              
              // Format cleanly using JavaScript's native Intl formatter
              displayPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: calcPrice.currency_code?.toUpperCase() || 'USD',
              }).format(trueAmount);
            }
  
            return (
              <li key={product.id} className="product-container">
                <img src={productImg} alt={product.title} className="plants-image" />
                <h3>{product.title}</h3>
                <p>{displayPrice}</p>
                <div className="add-to-cart" onClick={(e) => onAddToCart(e, product)}>
                  <button>Add to cart</button>
                </div>
              </li>
            );
          })}
        </ul>
        <section id="disclaimer" />
      </main>
    );
}
  
    
