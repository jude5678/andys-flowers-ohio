import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medusa } from "../lib/sdk";

export default function WeddingsPage() {
  // Local state for managing form submission UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  // 1. Fetch the collection by handle and include its products using SDK methods
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['medusa-collection', 'weddings'],
    queryFn: async () => {
      
      const collectionsResponse = await medusa.collections.list({
        handle: 'weddings'
      });
      
      const targetCollection = collectionsResponse.collections?.[0];
      if (!targetCollection) throw new Error('Collection not found');

      
      const productsResponse = await medusa.products.list({
        collection_id: [targetCollection.id]
      });

      return {
        ...targetCollection,
        products: productsResponse.products || []
      };
    }
  });


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus('');
    
    // grab data from form inputs
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
  
    // live medusa url
    const BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
  
    try {
      // point fetch url to medusa route
      const response = await fetch(`${BACKEND_URL}/store/weddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY }, 
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });
  
      // medusa returns JSON
      const result = await response.json();
  
      if (response.ok && result.success) {
        setFormStatus('Success! We will contact you soon.');
        event.target.reset();
      } else {
        setFormStatus(`Error: ${result.error || 'Failed to send email'}`);
      }
    } catch (err) {
      setFormStatus('An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // grab wedding image from medusa collection
  const weddingImages = collection?.products?.flatMap(product => 
    product.images?.map(img => img.url) || []
  ) || [];

  return (
    <main id="weddings">
      <section>
        {/* loading and error states */}
        {isLoading && <p>Loading wedding gallery...</p>}
        {error && <p>Error loading images: {error.message}</p>}

        {/* show image */}
        {weddingImages.length > 0 ? (
          <div className="weddings-gallery">
            {weddingImages.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Wedding floral arrangement ${index + 1}`} 
                className="weddings-1 row-shadow" 
              />
            ))}
          </div>
        ) : (
          !isLoading && <img src="assets/css/images/weddings-4.jpg" alt="Default collage" className="weddings-1 row-shadow" />
        )}

        <p className="weddings-consult">
          At Aurora Flower Shoppe, we know how hectic it can be to plan a perfect wedding. We strive to make the process that much more seamless by designing floral arrangements that will compliment your special day. We offer consultations and custom pricing.
        </p>

        
        <form id="weddingForm" onSubmit={handleSubmit}>
          <label htmlFor="name">Enter your name: </label>
          <input type="text" name="name" id="name" required disabled={isSubmitting} />

          <label htmlFor="email" id="emailLabel">Enter your email: </label>
          <input type="email" name="email" id="email" required disabled={isSubmitting} />

          <button id="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'SENDING...' : 'SUBMIT'}
          </button>
        </form>

        
        {formStatus && <p className="form-feedback">{formStatus}</p>}
      </section>
    </main>
  );
}

