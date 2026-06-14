import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app';
import './main.css';


// Create the network cache client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,            // Stop retrying failed requests instantly
      refetchOnWindowFocus: false, // Prevent background refetch freezes
    },
  },
});

// Mount the app to the actual HTML index file
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

