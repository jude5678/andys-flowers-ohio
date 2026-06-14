import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../lib/sdk.js';

export default function WeddingsPage() {
  // Local state for managing form submission UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  // 1. Fetch the collection by handle and include its products
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['medusa-collection', 'weddings'],
    queryFn: async () => {
      // Fetches collections matching the handle
      const response = await sdk.client.fetch(`/store/collections`, {
        query: { handle: 'weddings' }
      });
      
      const targetCollection = response.collections?.[0];
      if (!targetCollection) throw new Error('Collection not found');

      // Fetches products belonging to that specific collection ID
      const productsResponse = await sdk.client.fetch(`/store/products`, {
        query: { collection_id: [targetCollection.id] }
      });

      return {
        ...targetCollection,
        products: productsResponse.products || []
      };
    }
  });

  // Integrated form submission handler connecting to the Express proxy route
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus('');

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Communicates directly through the Vite/Webpack backend proxy
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setFormStatus('Success! We will contact you soon.');
        event.target.reset(); // Safely clears the input fields
      } else {
        setFormStatus(`Error: ${result.error || 'Failed to send email'}`);
      }
    } catch (err) {
      setFormStatus('An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Extract all available product images from the collection
  const weddingImages = collection?.products?.flatMap(product => 
    product.images?.map(img => img.url) || []
  ) || [];

  return (
    <main id="weddings">
      <section>
        {/* 3. Handle loading and error states gracefully */}
        {isLoading && <p>Loading wedding gallery...</p>}
        {error && <p>Error loading images: {error.message}</p>}

        {/* 4. Display fetched images, falling back to a placeholder if empty */}
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

        {/* Integrated form with state-driven elements */}
        <form id="weddingForm" onSubmit={handleSubmit}>
          <label htmlFor="name">Enter your name: </label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            required 
            disabled={isSubmitting} 
          />

          <label htmlFor="email" id="emailLabel">Enter your email: </label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required 
            disabled={isSubmitting} 
          />

          <button id="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'SENDING...' : 'SUBMIT'}
          </button>
        </form>

        {/* Visual feedback notice for submission status */}
        {formStatus && <p className="form-feedback">{formStatus}</p>}
      </section>
    </main>
  );
}
