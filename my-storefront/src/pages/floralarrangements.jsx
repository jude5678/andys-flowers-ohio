import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";

export default function FloralArrangements({ onAddToCart }) {
  // 1. Fetch the collection using Medusa v1 SDK namespace
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => medusa.collections.list({
      handle: 'floral-arrangements' 
    }),
  });

  // Extract the target collection ID once the first query finishes
  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. Fetch products only when the collection ID is successfully retrieved
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId }],
    queryFn: () => medusa.products.list({
      collection_id: [collectionId], // Filter to only get items from this collection

      region_id: regionContext?.id || undefined,
      currency_code: !regionContext?.id ? regionContext?.currency_code : undefined,

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
          
          // primary variant 
          const activeVariant = product.variants?.[0];
          
          // medusa pricing fields
          const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? 0;
          const currencyCode = activeVariant?.calculated_price?.currency_code || 'USD';
          
          let displayPrice = "$0.00";
          
          // format only if a valid price object was calculated by backend 
          if (activeVariant?.calculated_price) {
            const normalizedAmount = rawAmount / 100; // Medusa still uses cents (e.g. 5000 = $50.00)
            
            displayPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currencyCode.toUpperCase(),
            }).format(normalizedAmount);
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
