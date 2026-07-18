"use client"
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; // Note: Medusa v2 uses the renamed 'sdk' import conventionally
import { useRegion } from "@/providers/region"; 

export default function FloralArrangements({ onAddToCart }) {
  const { region } = useRegion();

  // 1. Fetch the target collection
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => sdk.store.productCollection.list({ handle: 'floral-arrangements' }), // Medusa v2 method namespace
  });

  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. Fetch products (Refactored safely for Medusa v2 Context)
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId, regionId: region?.id }],
    queryFn: () => sdk.store.product.list({
      collection_id: [collectionId],
      fields: "*variants.calculated_price", // Medusa v2 retrieves calculations via graph linkages
      region_id: region?.id || undefined, 
    }),
    // FIX: Don't stall with (&& !!region) or it will lock on initial render if context is slow.
    // Instead, let it fetch without region context initially, or wait for collectionId.
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
            
            // Medusa v2 returns an integer for calculated_amount (e.g. 5000 for $50.00)
            const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? 0;
            
            // In v2, fall back strictly to your region's assigned active currency code
            const currencyCode = activeVariant?.calculated_price?.currency_code || region?.currency_code || 'usd';
            
            let displayPrice = "$0.00";

            if (activeVariant?.calculated_price) {
              const normalizedAmount = rawAmount / 100; 
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
