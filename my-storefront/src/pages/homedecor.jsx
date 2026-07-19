import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from "../lib/sdk"; 

export default function HomeDecorStorefront({ onAddToCart, regionContext }) {
  const collectionHandle = "home-decor";

  // fetch collection
  const { 
    data: collectionData, 
    isLoading: isLoadingCollection, 
    isError: isCollectionError 
  } = useQuery({
    queryKey: ['collection', collectionHandle],
    queryFn: async () => {
      const response = await sdk.collections.list({ handle: collectionHandle });
      return response.collections?.[0] || null;
    }
  });

  const collectionId = collectionData?.id;

  // fetch products using regionContext
  const { 
    data: products = [], 
    isLoading: isLoadingProducts, 
    isError: isProductsError 
  } = useQuery({
    queryKey: ['collection-products', { collectionId, regionId: regionContext?.id }],
    queryFn: async () => {
      const response = await sdk.products.list({ 
        collection_id: [collectionId],
        region_id: regionContext?.id || undefined, 
      });
      return response.products;
    },
    enabled: !!collectionId 
  });

  // loading and error messages
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

      <div className="decor-container">
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
            <section key={product.id} className="decor product-card">
              <img 
                src={productImg || "assets/css/images/placeholder.jpg"} 
                alt={product.title} 
                className="home-decor-img row-shadow" 
              />
              <h3 className="col-h3">{product.title}</h3>
              <p className="product-price">{displayPrice}</p>
              {onAddToCart && (
                <div className="add-to-cart">
                  <button type="button" onClick={(e) => onAddToCart(e, product)}>
                    Add to cart
                  </button>
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
