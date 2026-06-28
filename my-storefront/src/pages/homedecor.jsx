import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";

export default function HomeDecorStorefront({ onAddToCart }) {
  const collectionHandle = "home-decor";

  // 1. Fetch the collection object to obtain its unique ID
  const { 
    data: collectionData, 
    isLoading: isLoadingCollection, 
    isError: isCollectionError 
  } = useQuery({
    queryKey: ['collection', collectionHandle],
    queryFn: async () => {
      const response = await medusa.store.collection.list({ handle: collectionHandle });
      // Return the first collection matching this handle
      return response.collections?.[0] || null;
    }
  });

  const collectionId = collectionData?.id;

  // 2. Fetch the actual storefront products tied to that collection ID
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    isError: isProductsError 
  } = useQuery({
    queryKey: ['collection-products', collectionId],
    queryFn: async () => {
      const response = await medusa.store.product.list({
        collection_id: [collectionId],
        fields: "*variants.calculated_price" // Required for Medusa v2 frontend price rendering
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
          const calcPrice = product.variants?.[0]?.calculated_price;
          let displayPrice = "Price unavailable";
          
          if (calcPrice) {
            const trueAmount = calcPrice.calculated_amount ?? 0;
            displayPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: calcPrice.currency_code?.toUpperCase() || 'USD',
            }).format(trueAmount);
          }
  
          return (
            // The product card itself is the flex item
            <section key={product.id} className="decor product-card">
              <img 
                src={productImg || "assets/css/images/placeholder.jpg"} 
                alt={product.title} 
                className="home-decor-img row-shadow" 
              />
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