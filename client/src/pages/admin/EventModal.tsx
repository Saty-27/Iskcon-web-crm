import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, GripVertical } from "lucide-react";
import type { Event, DonationCard, EventDonationCard, BankDetails } from "@shared/schema";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  imageUrl: z.string().optional(),
  readMoreUrl: z.string().optional(),
  isActive: z.boolean(),
  customDonationEnabled: z.boolean(),
  customDonationTitle: z.string().min(1, "Custom donation title is required"),
  suggestedAmounts: z.array(z.number()).optional(),
});

const donationCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number(),
});

const bankDetailsSchema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  swiftCode: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  isActive: z.boolean(),
});

type EventFormData = z.infer<typeof eventFormSchema>;
type DonationCardFormData = z.infer<typeof donationCardSchema>;
type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
}

export default function EventModal({ isOpen, onClose, event }: EventModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [donationCards, setDonationCards] = useState<DonationCardFormData[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetailsFormData | null>(null);
  const [suggestedAmountsInput, setSuggestedAmountsInput] = useState("");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingQrCode, setUploadingQrCode] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      imageUrl: "",
      readMoreUrl: "",
      isActive: true,
      customDonationEnabled: true,
      customDonationTitle: "Any Donation of Your Choice",
      suggestedAmounts: [],
    },
  });

  const { data: existingEventDonationCards = [] } = useQuery<EventDonationCard[]>({
    queryKey: [`/api/events/${event?.id}/donation-cards`],
    enabled: !!event?.id,
  });

  // Get event-specific bank details instead of global ones
  const { data: existingEventBankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: [`/api/events/${event?.id}/bank-details`],
    enabled: !!event?.id && isOpen,
  });

  // Initialize form when event ID changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().split('T')[0],
        imageUrl: event.imageUrl,
        readMoreUrl: event.readMoreUrl || "",
        isActive: event.isActive,
        customDonationEnabled: event.customDonationEnabled,
        customDonationTitle: event.customDonationTitle,
        suggestedAmounts: event.suggestedAmounts || [],
      });
      
      // Set suggested amounts input
      if (event.suggestedAmounts) {
        setSuggestedAmountsInput(event.suggestedAmounts.join(", "));
      }
    } else {
      form.reset({
        title: "",
        description: "",
        date: "",
        imageUrl: "",
        readMoreUrl: "",
        isActive: true,
        customDonationEnabled: true,
        customDonationTitle: "Any Donation of Your Choice",
        suggestedAmounts: [],
      });
      setSuggestedAmountsInput("");
    }
  }, [event?.id]);

  // Load donation cards when event or cards change
  useEffect(() => {
    if (event && existingEventDonationCards) {
      setDonationCards(existingEventDonationCards.map(card => ({
        title: card.title,
        amount: card.amount,
        description: card.description || "",
        order: card.sortOrder,
      })));
    } else {
      setDonationCards([]);
    }
  }, [event?.id, existingEventDonationCards?.length]);

  // Load event-specific bank details when available
  useEffect(() => {
    if (isOpen && event?.id) {
      if (existingEventBankDetails && existingEventBankDetails.length > 0) {
        const activeBankDetails = existingEventBankDetails.find((bd: any) => bd.isActive) || existingEventBankDetails[0];
        setBankDetails({
          accountName: activeBankDetails.accountName,
          bankName: activeBankDetails.bankName,
          accountNumber: activeBankDetails.accountNumber,
          ifscCode: activeBankDetails.ifscCode,
          swiftCode: activeBankDetails.swiftCode || "",
          qrCodeUrl: activeBankDetails.qrCodeUrl || "",
          isActive: activeBankDetails.isActive,
        });
      } else {
        // Initialize with default bank details for new event
        setBankDetails({
          accountName: "ISKCON Juhu",
          bankName: "HDFC",
          accountNumber: "",
          ifscCode: "",
          swiftCode: "",
          qrCodeUrl: "",
          isActive: true,
        });
      }
    } else if (!isOpen) {
      // Clear bank details when modal is closed
      setBankDetails(null);
    }
  }, [isOpen, existingEventBankDetails, event?.id]);

  const saveEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        imageUrl: data.imageUrl || "/api/placeholder/400/300",
        suggestedAmounts: suggestedAmountsInput 
          ? suggestedAmountsInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
          : null,
      };

      if (event) {
        return apiRequest(`/api/events/${event.id}`, 'PUT', eventData);
      } else {
        return apiRequest('/api/events', 'POST', eventData);
      }
    },
    onSuccess: async (response) => {
      const savedEvent = await response.json();
      // Force refresh of all event-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.removeQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Success', description: `Event ${event ? 'updated' : 'created'} successfully` });
      
      // Save donation cards if any
      if (donationCards.length > 0) {
        saveDonationCards(savedEvent.id);
      }
      
      // Save bank details if changed
      if (bankDetails) {
        saveBankDetails();
      }
      
      if (donationCards.length === 0 && !bankDetails) {
        onClose();
      }
    },
    onError: () => {
      toast({ title: 'Error', description: `Failed to ${event ? 'update' : 'create'} event`, variant: 'destructive' });
    },
  });

  const saveDonationCards = async (eventId: number) => {
    try {
      // Delete existing cards for this event
      for (const card of existingEventDonationCards) {
        await apiRequest(`/api/event-donation-cards/${card.id}`, 'DELETE');
      }
      
      // Create new cards
      for (const card of donationCards) {
        await apiRequest('/api/event-donation-cards', 'POST', {
          title: card.title,
          amount: card.amount,
          description: card.description || "",
          imageUrl: card.imageUrl || "",
          sortOrder: card.order,
          eventId,
          isActive: true,
        });
      }
      
      // Invalidate both admin and frontend queries
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/donation-cards`] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      // Force refetch by removing from cache completely
      queryClient.removeQueries({ queryKey: [`/api/events/${eventId}/donation-cards`] });
      toast({ title: 'Success', description: 'Donation cards saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save donation cards', variant: 'destructive' });
    }
  };

  const saveBankDetails = async () => {
    if (!bankDetails || !event?.id) return;
    
    try {
      if (existingEventBankDetails.length > 0) {
        const activeBankDetails = existingEventBankDetails.find((bd: any) => bd.isActive) || existingEventBankDetails[0];
        await apiRequest(`/api/events/${event.id}/bank-details/${activeBankDetails.id}`, 'PUT', bankDetails);
      } else {
        await apiRequest(`/api/events/${event.id}/bank-details`, 'POST', bankDetails);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/bank-details`] });
      toast({ title: 'Success', description: 'Event payment details saved successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save event payment details', variant: 'destructive' });
    }
  };

  const addDonationCard = () => {
    setDonationCards([...donationCards, {
      title: "",
      amount: 0,
      description: "",
      order: donationCards.length,
    }]);
  };

  const removeDonationCard = (index: number) => {
    setDonationCards(donationCards.filter((_, i) => i !== index));
  };

  const updateDonationCard = (index: number, field: keyof DonationCardFormData, value: any) => {
    setDonationCards(donationCards.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const handleBannerFileUpload = async (file: File) => {
    if (!file) return;

    // Check file size (1MB limit)
    const maxSize = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'Image file size must be less than 1MB',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');

    setUploadingBanner(true);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      form.setValue('imageUrl', result.url);

      toast({
        title: 'Success',
        description: 'Banner image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleQrCodeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'qr');

    setUploadingQrCode(true);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setBankDetails(prev => prev ? {...prev, qrCodeUrl: result.url} : prev);

      toast({
        title: 'Success',
        description: 'QR code uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload QR code',
        variant: 'destructive',
      });
    } finally {
      setUploadingQrCode(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    await saveEventMutation.mutateAsync(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="cards">Donation Cards</TabsTrigger>
            <TabsTrigger value="custom">Custom Donation</TabsTrigger>
            <TabsTrigger value="payment">Payment Details</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Event Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information & Banner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Support Our Temple Development" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Rich text description of the event..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Event Status</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Make event visible on frontend
                              </div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner Image</FormLabel>
                            <div className="space-y-4">
                              {/* File Upload Option */}
                              <div>
                                <Label className="text-sm font-medium">Upload from Computer</Label>
                                <div className="mt-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleBannerFileUpload(file);
                                      }
                                    }}
                                    disabled={uploadingBanner}
                                    className="cursor-pointer"
                                  />
                                  {uploadingBanner && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                      Uploading image...
                                    </div>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Maximum file size: 1MB. Supported formats: JPG, PNG, GIF
                                  </p>
                                </div>
                              </div>

                              {/* URL Input Option */}
                              <div>
                                <Label className="text-sm font-medium">Or Enter Image URL</Label>
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/banner-image.jpg" 
                                    {...field} 
                                    className="mt-1"
                                  />
                                </FormControl>
                              </div>

                              {/* Image Preview */}
                              {field.value && (
                                <div className="mt-2">
                                  <Label className="text-sm font-medium">Preview</Label>
                                  <div className="mt-1 border rounded-lg overflow-hidden">
                                    <img 
                                      src={field.value} 
                                      alt="Banner preview" 
                                      className="w-full h-32 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="readMoreUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Read More Link (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/event-details" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label>Suggested Donation Amounts</Label>
                      <Input
                        placeholder="e.g., 501, 1001, 2501, 5001"
                        value={suggestedAmountsInput}
                        onChange={(e) => setSuggestedAmountsInput(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter amounts separated by commas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Donation Cards Tab */}
              <TabsContent value="cards" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Predefined Donation Cards</CardTitle>
                    <Button type="button" onClick={addDonationCard} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {donationCards.map((card, index) => (
                        <Card key={index} className="border-l-4 border-l-orange-500 bg-orange-50/30">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-orange-700">
                                  Donation Card {index + 1}
                                </h4>
                                {card.title && card.amount && (
                                  <p className="text-xs text-muted-foreground">
                                    {card.title} - ₹{card.amount}
                                  </p>
                                )}
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeDonationCard(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-0">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Title</Label>
                                <Input
                                  placeholder="e.g., Temple Equipment"
                                  value={card.title}
                                  onChange={(e) => updateDonationCard(index, 'title', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium">Amount (₹)</Label>
                                <Input
                                  type="number"
                                  placeholder="5001"
                                  value={card.amount || ''}
                                  onChange={(e) => updateDonationCard(index, 'amount', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Description</Label>
                              <Textarea
                                placeholder="Brief description of what this donation supports"
                                value={card.description}
                                onChange={(e) => updateDonationCard(index, 'description', e.target.value)}
                                className="min-h-[60px] text-sm resize-none"
                              />
                            </div>

                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {donationCards.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No donation cards added yet. Click "Add Card" to create predefined donation options.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom Donation Tab */}
              <TabsContent value="custom" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Donation Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customDonationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Custom Donation</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow donors to enter their own amount
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customDonationTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Any Donation of Your Choice for Temple Renovation" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Details Tab */}
              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank & UPI Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bankDetails && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Account Holder Name</Label>
                            <Input
                              value={bankDetails.accountName}
                              onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Bank Name</Label>
                            <Input
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Account Number</Label>
                            <Input
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>IFSC Code</Label>
                            <Input
                              value={bankDetails.ifscCode}
                              onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>SWIFT Code (Optional)</Label>
                            <Input
                              value={bankDetails.swiftCode}
                              onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>UPI QR Code</Label>
                            <div className="space-y-2">
                              <Input
                                placeholder="https://example.com/qr-code.jpg"
                                value={bankDetails.qrCodeUrl}
                                onChange={(e) => setBankDetails({...bankDetails, qrCodeUrl: e.target.value})}
                              />
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">or</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        // Validate file size (1MB limit)
                                        if (file.size > 1024 * 1024) {
                                          toast({
                                            title: 'File too large',
                                            description: 'Please select an image smaller than 1MB',
                                            variant: 'destructive',
                                          });
                                          return;
                                        }
                                        handleQrCodeUpload(file);
                                      }
                                    };
                                    input.click();
                                  }}
                                  disabled={uploadingQrCode}
                                >
                                  {uploadingQrCode ? (
                                    <>
                                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload QR Code
                                    </>
                                  )}
                                </Button>
                              </div>
                              {bankDetails.qrCodeUrl && (
                                <div className="mt-2 relative">
                                  <div className="text-xs text-gray-600 mb-1">QR Code Preview:</div>
                                  <img 
                                    src={bankDetails.qrCodeUrl} 
                                    alt="QR Code preview" 
                                    className="w-32 h-32 object-contain rounded border border-gray-300 bg-white p-2"
                                    onLoad={() => console.log('QR image loaded:', bankDetails.qrCodeUrl)}
                                    onError={(e) => {
                                      console.log('QR image failed to load:', bankDetails.qrCodeUrl);
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={() => setBankDetails({...bankDetails, qrCodeUrl: ''})}
                                  >
                                    ×
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={bankDetails.isActive}
                            onCheckedChange={(checked) => setBankDetails({...bankDetails, isActive: checked})}
                          />
                          <Label>Show payment details section</Label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveEventMutation.isPending}>
                  {saveEventMutation.isPending ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}