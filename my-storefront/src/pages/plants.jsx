import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";

export default function Plants({ onAddToCart }) {
  // 1. Fetch the collection using the Medusa v1 SDK namespace
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, error: collectionError } = useQuery({
    queryKey: ['collections', 'plants'],
    queryFn: () => medusa.collections.list({ 
      handle: 'plants' 
    }),
  });

  // Extract the target collection ID once the first query finishes
  const collectionId = collectionData?.collections?.[0]?.id;

  // 2. Fetch products only when the collection ID is successfully retrieved
  const { data: productData, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: ['products', { collectionId }],
    queryFn: () => medusa.products.list({
      collection_id: [collectionId], // Filter to only get items from this collection
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

          const basePriceObj = product.variants?.[0]?.prices?.[0];
          let displayPrice = "Price unavailable";

          if (basePriceObj) {
            // Medusa v1 stores values as integers in cents (e.g., 6500 = $65.00)
            const rawAmount = basePriceObj.amount ?? 0;
            const normalizedAmount = rawAmount / 100; // Divide by 100 for proper v1 display

            displayPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: basePriceObj.currency_code?.toUpperCase() || 'USD',
            }).format(normalizedAmount);
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
