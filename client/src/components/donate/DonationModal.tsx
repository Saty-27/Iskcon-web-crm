import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DonationCategory, Event } from '@shared/schema';
import useAuth from '@/hooks/useAuth';
import { X } from 'lucide-react';

const donationFormSchema = z.object({
  amount: z.number().refine(
    (val) => val >= 1,
    { message: 'Amount must be at least ₹1' }
  ),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  panCard: z.string().optional(),
  message: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

interface DonationModalProps {
  isOpen: boolean;
  category?: DonationCategory;
  event?: Event;
  amount?: number | null;
  onClose: () => void;
}

const DonationModal = ({ isOpen, category, event, amount, onClose }: DonationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isShriDonation, setIsShriDonation] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const title = event ? event.title : category?.name || 'Donation';
  const suggestedAmounts = event?.suggestedAmounts || category?.suggestedAmounts || [1001, 2100, 5100, 11000];
  
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: amount || 0,
      name: user?.username || '',
      email: user?.email || '',
      phone: '',
      panCard: '',
      message: '',
    }
  });
  
  // Set the amount when selected from parent component
  useEffect(() => {
    if (amount) {
      setSelectedAmount(amount);
      form.setValue('amount', amount);
    }
  }, [amount, form]);
  
  const handleAmountSelect = (amt: number) => {
    setSelectedAmount(amt);
    form.setValue('amount', amt);
    form.clearErrors('amount');
  };
  
  const onSubmit = async (data: DonationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare donation data for PayU
      const donationData = {
        ...data,
        userId: user?.id,
        categoryId: category?.id,
        eventId: event?.id,
      };
      
      // Initialize payment with PayU
      const response = await apiRequest('/api/payments/initiate', 'POST', donationData);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.paymentData) {
        toast({
          title: "Redirecting to Payment Gateway",
          description: "Please wait while we redirect you to the secure payment page.",
          variant: "default",
        });
        
        // Store payment data in localStorage for the payment gateway
        const paymentInfo = {
          txnid: result.paymentData.txnid,
          amount: result.paymentData.amount,
          firstname: result.paymentData.firstname,
          email: result.paymentData.email,
          phone: result.paymentData.phone,
          productinfo: result.paymentData.productinfo,
          key: result.paymentData.key
        };
        
        localStorage.setItem('payuData', JSON.stringify(paymentInfo));
        localStorage.setItem('payuFormData', JSON.stringify(result.paymentData));
        
        // Redirect to payment simulation page
        window.location.href = '/donate/payment-gateway';
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-poppins font-bold text-xl text-primary flex justify-between items-center">
            <span>Donate for {title}</span>
            <DialogClose className="text-dark hover:text-primary text-2xl">
              <X size={24} />
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <div>
              <FormLabel className="block font-poppins font-medium text-dark mb-2">Select Amount</FormLabel>
              
              {/* 1 Rupee Donation Button */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsShriDonation(true);
                    handleAmountSelect(1);
                  }}
                  className={`w-full border rounded-lg py-3 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isShriDonation
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold">₹1 Shri Donation</span>
                    <span className="text-xs mt-1">Token of devotion to Lord Krishna</span>
                  </div>
                </button>
              </div>
              
              {/* Regular Donation Amounts */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {suggestedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setIsShriDonation(false);
                      handleAmountSelect(amt);
                    }}
                    className={`border rounded-lg py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary ${
                      selectedAmount === amt && !isShriDonation
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700">₹</span>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Other Amount"
                          className="pl-10 pr-4 py-2 focus:ring-primary"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value || 0);
                            setSelectedAmount(null);
                          }}
                          value={field.value === 0 ? '' : field.value}
                          min={1}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                      className="focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 98765 43210"
                      {...field}
                      className="focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="panCard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark font-medium">PAN Card (For Tax Benefits)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ABCDE1234F"
                      {...field}
                      className="focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark font-medium">Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your message or prayer request..."
                      {...field}
                      rows={2}
                      className="focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
              <Button
                type="submit"
                className="w-full bg-primary text-white font-poppins font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Proceed to Payment"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
