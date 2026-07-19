import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; // Named import from your fixed sdk.ts file

export default function FloralArrangements({ onAddToCart, regionContext }) {
  
  // 1. Fetch the collection using Medusa v2 SDK namespaces
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => sdk.store.collection.list({ handle: 'floral-arrangements' }), // FIX: changed from productCollection to collection
  });

  // Extract the target collection ID
  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. Fetch products using the simple regionContext prop
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId, regionId: regionContext?.id }],
    queryFn: () => sdk.store.product.list({
      collection_id: collectionId, // FIX: Medusa v2 takes a simple string filter here instead of an array
      fields: "*variants.calculated_price",
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
            const activeVariant = product.variants?.[0];
            
            // Medusa v2 pricing properties
            const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? 0;
            const currencyCode = activeVariant?.calculated_price?.currency_code || regionContext?.currency_code || 'USD';
            
            let displayPrice = "$0.00";

            if (activeVariant?.calculated_price) {
              const normalizedAmount = rawAmount / 100; // Medusa returns minor units (cents)
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
