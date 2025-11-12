import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { User, DonationCard, DonationCategory, Event } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import useAuth from '@/hooks/useAuth';
import { Loader2, CreditCard, IndianRupee } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationCard?: DonationCard;
  eventDonationCard?: {
    id: number;
    eventId: number;
    title: string;
    amount: number;
    description: string;
    imageUrl: string;
  };
  customAmount?: number;
  donationCategory?: DonationCategory;
  event?: Event;
}

const PaymentModal = ({
  isOpen,
  onClose,
  donationCard,
  eventDonationCard,
  customAmount,
  donationCategory,
  event
}: PaymentModalProps) => {
  const { toast } = useToast();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bank details for category or event
  const { data: bankDetails = [] } = useQuery({
    queryKey: donationCategory 
      ? [`/api/categories/${donationCategory.id}/bank-details`]
      : event 
      ? [`/api/events/${event.id}/bank-details`]
      : ['/api/bank-details'],
    enabled: Boolean(isOpen && (donationCategory || event)),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    amount: customAmount || donationCard?.amount || eventDonationCard?.amount || 0,
    message: ''
  });

  // No authentication check - allow donations without login

  // Auto-populate form with user data when available
  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || ''
      }));
    }
  }, [authUser]);

  // Set amount when props change
  useEffect(() => {
    if (customAmount) {
      setFormData(prev => ({ ...prev, amount: customAmount }));
    } else if (donationCard) {
      setFormData(prev => ({ ...prev, amount: donationCard.amount }));
    } else if (eventDonationCard) {
      setFormData(prev => ({ ...prev, amount: eventDonationCard.amount }));
    }
  }, [customAmount, donationCard, eventDonationCard]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }
    if (formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Prepare donation data
      const donationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        amount: formData.amount,
        message: formData.message,
        categoryId: donationCard?.categoryId || donationCategory?.id,
        cardId: donationCard?.id,
        eventId: eventDonationCard?.eventId || event?.id,
        eventCardId: eventDonationCard?.id,
        isCustomAmount: Boolean(customAmount)
      };

      // Create PayU payment request
      const response = await apiRequest('/api/payment/create-payu-order', 'POST', donationData);
      const paymentData = await response.json();

      if (paymentData.success) {
        // Create PayU form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.paymentUrl;

        // Add all PayU parameters
        Object.entries(paymentData.params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        onClose();
      } else {
        throw new Error(paymentData.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 2000);
        onClose();
      } else {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getDonationTitle = () => {
    if (eventDonationCard) return eventDonationCard.title;
    if (donationCard) return donationCard.title;
    if (customAmount) return "Custom Donation";
    return "Donation";
  };

  const getDonationDescription = () => {
    if (eventDonationCard) return eventDonationCard.description;
    if (donationCard) return donationCard.description;
    if (customAmount && donationCategory) return `Custom donation for ${donationCategory.name}`;
    return "Your generous contribution";
  };

  const getMainHeading = () => {
    if (event) return `${event.title} - ${getDonationTitle()}`;
    if (donationCategory) return `${donationCategory.name} - ${getDonationTitle()}`;
    return getDonationTitle();
  };

  const getSubHeading = () => {
    if (eventDonationCard) return `Donating for ${event?.title || 'Special Event'}`;
    if (donationCard && donationCategory) return `Donating for ${donationCategory.name}`;
    if (customAmount && donationCategory) return `Custom donation for ${donationCategory.name}`;
    return "Making a donation";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-semibold text-primary">
            Complete Your Donation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Donation Details */}
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-primary">
            <h3 className="font-poppins font-semibold text-lg text-primary mb-1">
              {getMainHeading()}
            </h3>
            <p className="text-sm text-orange-700 font-medium mb-2">
              {getSubHeading()}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              {getDonationDescription()}
            </p>
            <div className="flex items-center text-2xl font-bold text-primary">
              <IndianRupee className="w-6 h-6 mr-1" />
              {formData.amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* User Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your 10-digit phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address (optional)"
                className="mt-1"
              />
            </div>

            {customAmount && (
              <div>
                <Label htmlFor="amount">Donation Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Leave a message with your donation"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Bank Details Section */}
          {bankDetails.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Bank Details for Direct Transfer</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Account Name:</strong> {bankDetails[0].accountName}</div>
                <div><strong>Bank Name:</strong> {bankDetails[0].bankName}</div>
                <div><strong>Account Number:</strong> {bankDetails[0].accountNumber}</div>
                <div><strong>IFSC Code:</strong> {bankDetails[0].ifscCode}</div>
                {bankDetails[0].swiftCode && (
                  <div><strong>SWIFT Code:</strong> {bankDetails[0].swiftCode}</div>
                )}
              </div>
              
              {/* QR Code for UPI */}
              {bankDetails[0].qrCodeUrl && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-700 mb-2">Or scan QR code for UPI payment:</p>
                  <img
                    src={bankDetails[0].qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-32 h-32 mx-auto rounded border"
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;