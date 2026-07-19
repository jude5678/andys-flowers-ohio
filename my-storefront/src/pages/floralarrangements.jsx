import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; 

export default function FloralArrangements({ onAddToCart, regionContext }) {
  
  // fetch the product collection
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'floral-arrangements'],
    queryFn: () => sdk.collections.list({ handle: 'floral-arrangements' }), 
  });

  // get the collection ID
  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. fetch products using regionContext
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId, regionId: regionContext?.id }],
    queryFn: () => sdk.products.list({
      collection_id: [collectionId], 
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
            
            // prices array
            const activeVariant = product.variants?.[0];
            
            // check pricing data
            const rawAmount = activeVariant?.calculated_price?.calculated_amount ?? activeVariant?.prices?.[0]?.amount ?? 0;
            const currencyCode = activeVariant?.calculated_price?.currency_code || regionContext?.currency_code || 'USD';
            
            let displayPrice = "$0.00";

            if (rawAmount > 0) {
              const normalizedAmount = rawAmount;
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
