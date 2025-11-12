import { useQuery } from '@tanstack/react-query';
import { DonationCategory } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

const DonationCategories = () => {
  const { data: categories = [], isLoading } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
  });
  
  if (isLoading) {
    return (
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-full mb-4" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Support Our Initiatives
          </h2>
          <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
            Your generous contributions help sustain our mission of spiritual education, 
            community service, and temple maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories
            .filter(category => category.isActive)
            .sort((a, b) => a.order - b.order)
            .slice(0, 6)
            .map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:transform hover:scale-105"
            >
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-poppins font-semibold text-xl text-primary mb-2">{category.name}</h3>
                <p className="font-opensans text-dark mb-6">{truncateDescription(category.description || '')}</p>
                <Link 
                  href={`/donate/${category.id}`}
                  className="w-full bg-primary text-white font-poppins font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors block text-center"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {categories.filter(category => category.isActive).length > 6 && (
          <div className="text-center mt-12">
            <Link 
              href="/donate"
              className="inline-block bg-secondary text-white font-poppins font-medium py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View All Donation Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default DonationCategories;