import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Quote } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const QuoteRotator = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
  });
  
  // Rotate quotes
  useEffect(() => {
    if (quotes.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);
  
  if (isLoading) {
    return (
      <section className="bg-primary py-10 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="w-full h-24 bg-white/10 mb-4" />
            <Skeleton className="w-1/2 h-6 bg-white/10 mx-auto" />
          </div>
        </div>
      </section>
    );
  }
  
  if (quotes.length === 0) {
    return null;
  }
  
  const currentQuote = quotes[currentQuoteIndex];
  
  return (
    <section className="bg-primary py-10 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="quote-container max-w-3xl mx-auto">
          <p className="font-playfair italic text-xl md:text-2xl mb-4">
            "{currentQuote.text}"
          </p>
          {currentQuote.source && (
            <p className="font-poppins font-medium">- {currentQuote.source}</p>
          )}
        </div>
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-repeat" 
          style={{backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMyAyMWg4di05SDN6bTEwIDB2LTloOHY5aC04eiIvPjxwYXRoIGQ9Ik0xIDl2MTFoMjJWOUwxMiAzIDEgOXoiLz48L3N2Zz4=')`}}>
        </div>
      </div>
    </section>
  );
};

export default QuoteRotator;
