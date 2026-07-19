import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; // Migrated to the v2 SDK instance

export default function Plants({ onAddToCart, regionContext }) {
  // fetch collection
  const { 
    data: collectionData, 
    isLoading: isCollectionLoading, 
    isError: isCollectionError, 
    error: collectionError 
  } = useQuery({
    queryKey: ['collections', 'plants'],
    queryFn: () => sdk.collections.list({ handle: 'plants' }),
  });

  // grab collection's ID
  const collectionId = collectionData?.collections?.[0]?.id;

  // fetch products using collectionID and regionContext
  const { 
    data: productData, 
    isLoading: isProductLoading, 
    isError: isProductError, 
    error: productError 
  } = useQuery({
    queryKey: ['products', { collectionId, regionId: regionContext?.id }],
    queryFn: () => sdk.products.list({ 
      collection_id: [collectionId], // Filter to only get items from this collection
      region_id: regionContext?.id || undefined, // Context-aware pricing injection
    }),
    enabled: !!collectionId, // Only fires if the collection metadata exists
  });

  // grab products from second query
  const products = productData?.products || [];

  // loading and error messages
  if (isCollectionLoading || (collectionId && isProductLoading)) {
    return <div className="loading-state">Loading beautiful arrangements...</div>;
  }

  if (isCollectionError || isProductError) {
    const errorMsg = collectionError?.message || productError?.message || "Unknown error";
    return <div className="error-state">Failed to fetch products: {errorMsg}</div>;
  }

  return (
    <main id="plants">
      <ul className="plant-container" style={{ padding: 0 }}>
        {products.map((product) => {
          const productImg = product.thumbnail || product.images?.[0]?.url;
          const activeVariant = product.variants?.[0];
          
          // check pricing data
          const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? activeVariant?.prices?.[0]?.amount ?? 0;
          const currencyCode = activeVariant?.calculated_price?.currency_code || regionContext?.currency_code || 'USD';
          
          
          const normalizedAmount = rawAmount; 

          const displayPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
          }).format(normalizedAmount);

          return (
            <li key={product.id} className="product-container" style={{ listStyle: 'none', marginBottom: '20px' }}>
              <img src={productImg} alt={product.title} className="plants-image" />
              <h3>{product.title}</h3>
              <p>{displayPrice}</p>
              {onAddToCart && (
                <div className="add-to-cart">
                  <button type="button" onClick={(e) => onAddToCart(e, product)}>
                    Add to cart
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <section id="disclaimer" />
    </main>
  );
}

