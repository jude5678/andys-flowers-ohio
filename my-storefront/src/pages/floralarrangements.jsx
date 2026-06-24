import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../lib/sdk.js'; 

export default function FloralArrangements({ onAddToCart }) {
  // 1. Fetch the collection using the Medusa v2 "collection" namespace with handle "floral-arrangements"
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => sdk.store.collection.list({ 
      handle: ['floral-arrangements'] // Wrapped in brackets to make it an array
    }),
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
    queryFn: () => sdk.store.product.list({ 
      collection_id: [collectionId], // Filter to only get items from this collection
      fields: "*variants.calculated_price" 
    }),
    enabled: !!collectionId, // Prevents running until collectionId exists
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
    <div>
      {/* Grid Product Items container */}
      <div style={{ padding: '2em' }}>
        <ul className="products products-grid">
          {products.map((product) => {
            const productImg = product.thumbnail || product.images?.[0]?.url;
            
            // Target the raw calculated price object
            const calcPrice = product.variants?.[0]?.calculated_price;
            let displayPrice = "$0.00";
            
            if (calcPrice) {
              // Fetch the raw amount safely (In Medusa v2, this returns exactly 65)
              const trueAmount = calcPrice.calculated_amount ?? 0;
              
              // Format it cleanly using JavaScript's native Intl formatter (NO division!)
              displayPrice = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: calcPrice.currency_code?.toUpperCase() || 'USD',
              }).format(trueAmount);
            }

            return (
              <li key={product.id} className="product-container" style={{ listStyle: 'none', marginBottom: '20px' }}>
                <img src={productImg} alt={product.title} className="product-image floral-image" />
                <h3>{product.title}</h3>
                <p>{displayPrice}</p>
                <div className="add-to-cart" onClick={(e) => onAddToCart(e, product)}>
                  <button>Add to cart</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
