import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";

export default function HomeDecorStorefront({ onAddToCart }) {
  const collectionHandle = "home-decor";

  // 1. Fetch the collection object using Medusa v1 SDK namespace
  const { data: collectionData, isLoading: isLoadingCollection, isError: isCollectionError } = useQuery({
    queryKey: ['collection', collectionHandle],
    queryFn: async () => {
      const response = await medusa.collections.list({ 
        handle: collectionHandle 
      });
      // Return the first collection matching this handle
      return response.collections?.[0] || null;
    }
  });

  const collectionId = collectionData?.id;

  // 2. Fetch the actual storefront products tied to that collection ID
  const { data: products = [], isLoading: isLoadingProducts, isError: isProductsError } = useQuery({
    queryKey: ['collection-products', collectionId],
    queryFn: async () => {
      const response = await medusa.products.list({ 
        collection_id: [collectionId]
      });
      return response.products;
    },
    // Only fire this query if the collection metadata was successfully fetched
    enabled: !!collectionId
  });

  // Handle Loading and Error states gracefully
  if (isLoadingCollection || (collectionId && isLoadingProducts)) {
    return <div className="store-status">Loading our home decor collection...</div>;
  }

  if (isCollectionError || isProductsError) {
    return <div className="store-status error">Error loading store items. Please try refreshing.</div>;
  }

  if (!collectionData) {
    return <div className="store-status">Collection "{collectionHandle}" was not found.</div>;
  }

  return (
    <section id="home-decor">
      <section id="descriptor">
        <p>Check out our assortment of home decor items including candles, picture frames, and decorative throw pillows.</p>
      </section>

      {/* flex container is outside of loop */}
      <div className="decor-container">
        {products.map((product) => {
          const productImg = product.thumbnail || product.images?.[0]?.url;
          
          const basePriceObj = product.variants?.[0]?.prices?.[0];
          let displayPrice = "Price unavailable";

          if (basePriceObj) {
            // Medusa v1 stores values as integers in cents (6500 = $65.00)
            const rawAmount = basePriceObj.amount ?? 0;
            const normalizedAmount = rawAmount / 100; // Divide by 100 for proper v1 pricing layouts

            displayPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: basePriceObj.currency_code?.toUpperCase() || 'USD',
            }).format(normalizedAmount);
          }

          return (
            // The product card itself is the flex item
            <section key={product.id} className="decor product-card">
              <img src={productImg || "assets/css/images/placeholder.jpg"} alt={product.title} className="home-decor-img row-shadow" />
              <h3 className="col-h3">{product.title}</h3>
              <p className="product-price">{displayPrice}</p>
              {onAddToCart && (
                <div className="add-to-cart" onClick={(e) => onAddToCart(e, product)}>
                  <button type="button">Add to cart</button>
                </div>
              )}
            </section>
          );
        })}
      </div>
      <br />
    </section>
  );
}
