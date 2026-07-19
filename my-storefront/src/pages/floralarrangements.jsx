import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; // Named import from your specific client instance

export default function FloralArrangements({ onAddToCart, regionContext }) {
  
  // 1. Fetch the collection using Medusa v1 Client syntax
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => sdk.collections.list({ handle: 'floral-arrangements' }), 
  });

  // Extract the target collection ID
  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. Fetch products safely mapping the simple regionContext prop
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId, regionId: regionContext?.id }],
    queryFn: () => sdk.products.list({
      collection_id: [collectionId], // v1 Client requires an array wrapper for listing filters
      region_id: regionContext?.id || undefined, 
    }),
    enabled: !!collectionId, 
  });

  const products = productData?.products || [];

  if (isCollectionLoading || isProductLoading) {
    return <div className="loading-state">Loading beautiful arrangements...</div>;
  }

  if (isCollectionError || isProductError) {
    const errorMsg = collectionError?.message || productError?.message;
    return <div className="error-state">Failed to fetch products: {errorMsg}</div>;
  }

  return (
    <div>
      <div style={{ padding: '2em' }}>
        <ul className="products products-grid">
          {products.map((product) => {
            const productImg = product.thumbnail || product.images?.[0]?.url;
            
            // Map the variant array safely
            const activeVariant = product.variants?.[0];
            
            // Check pricing fields
            const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? activeVariant?.prices?.[0]?.amount ?? 0;
            const currencyCode = activeVariant?.calculated_price?.currency_code || regionContext?.currency_code || 'USD';
            
            let displayPrice = "$0.00";

            if (rawAmount > 0) {
              const normalizedAmount = rawAmount / 100; // Minor units (cents)
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
