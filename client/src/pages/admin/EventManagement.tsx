import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import AdminLayout from "@/components/admin/Layout";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Upload, Eye, ArrowLeft, DollarSign, CreditCard, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Event, DonationCard, BankDetails, insertEventSchema, InsertEvent } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

const EventManagement = () => {
  const [, params] = useRoute('/admin/events/:id');
  const eventId = parseInt(params?.id || '0');
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isDonationCardDialogOpen, setIsDonationCardDialogOpen] = useState(false);
  const [isBankDetailsDialogOpen, setIsBankDetailsDialogOpen] = useState(false);
  const [editingDonationCard, setEditingDonationCard] = useState<DonationCard | null>(null);
  const [editingBankDetails, setEditingBankDetails] = useState<BankDetails | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get event data
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Get all donation cards for predefined amounts
  const { data: donationCards = [], isLoading: cardsLoading } = useQuery<DonationCard[]>({
    queryKey: ['/api/donation-cards'],
  });

  // Get bank details
  const { data: bankDetails = [], isLoading: bankLoading } = useQuery<BankDetails[]>({
    queryKey: ['/api/bank-details'],
  });

  // Event form with current schema structure
  const eventForm = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date || new Date(),
      imageUrl: event?.imageUrl || '',
      isActive: event?.isActive ?? true,
      suggestedAmounts: event?.suggestedAmounts || [],
    },
  });

  // Donation card form
  const donationCardForm = useForm({
    defaultValues: {
      title: '',
      amount: 0,
      description: '',
      imageUrl: '',
      order: 0,
      isActive: true,
      categoryId: 1, // Default to first category
    },
  });

  // Bank details form
  const bankDetailsForm = useForm({
    defaultValues: {
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      swiftCode: '',
      qrCodeUrl: '',
      isActive: true,
    },
  });

  // Update event form when event data loads
  React.useEffect(() => {
    if (event) {
      eventForm.reset({
        title: event.title,
        description: event.description || '',
        date: event.date,
        imageUrl: event.imageUrl,
        isActive: event.isActive,
        suggestedAmounts: event.suggestedAmounts || [],
      });
    }
  }, [event, eventForm]);

  // Mutations
  const updateEventMutation = useMutation({
    mutationFn: (data: Partial<Event>) => 
      apiRequest(`/api/events/${eventId}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}`] });
      setIsEditingEvent(false);
      toast({ title: 'Success', description: 'Event updated successfully' });
    },
  });

  const addDonationCardMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/donation-cards', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      setIsDonationCardDialogOpen(false);
      donationCardForm.reset();
      toast({ title: 'Success', description: 'Donation card created successfully' });
    },
  });

  const updateDonationCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/donation-cards/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      setEditingDonationCard(null);
      setIsDonationCardDialogOpen(false);
      toast({ title: 'Success', description: 'Donation card updated successfully' });
    },
  });

  const deleteDonationCardMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/donation-cards/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      toast({ title: 'Success', description: 'Donation card deleted successfully' });
    },
  });

  const addBankDetailsMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/bank-details', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
      setIsBankDetailsDialogOpen(false);
      bankDetailsForm.reset();
      toast({ title: 'Success', description: 'Bank details created successfully' });
    },
  });

  const updateBankDetailsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/bank-details/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
      setEditingBankDetails(null);
      setIsBankDetailsDialogOpen(false);
      toast({ title: 'Success', description: 'Bank details updated successfully' });
    },
  });

  const deleteBankDetailsMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/bank-details/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
      toast({ title: 'Success', description: 'Bank details deleted successfully' });
    },
  });

  if (eventLoading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  if (!event) {
    return <AdminLayout><div>Event not found</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/events" className="flex items-center text-indigo-600 hover:text-indigo-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <Badge variant={event.isActive ? "default" : "secondary"}>
              {event.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditingEvent(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Event Details</TabsTrigger>
            <TabsTrigger value="donation-cards">Donation Cards</TabsTrigger>
            <TabsTrigger value="bank-details">Payment Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Event Details Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Banner & Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Image Preview */}
                <div className="space-y-2">
                  <Label>Event Banner</Label>
                  <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No banner image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <p className="text-lg font-semibold">{event.title}</p>
                  </div>
                  <div>
                    <Label>Event Date</Label>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-gray-700">{event.description || 'No description provided'}</p>
                </div>

                <div>
                  <Label>Suggested Amounts</Label>
                  <div className="flex flex-wrap gap-2">
                    {event.suggestedAmounts?.map((amount, index) => (
                      <Badge key={index} variant="outline">
                        ₹{amount.toLocaleString('en-IN')}
                      </Badge>
                    )) || <span className="text-gray-500">No suggested amounts</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donation Cards Tab */}
          <TabsContent value="donation-cards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Predefined Donation Cards</h2>
              <Button
                onClick={() => {
                  setEditingDonationCard(null);
                  donationCardForm.reset();
                  setIsDonationCardDialogOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Donation Card
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donationCards.map((card) => (
                <Card key={card.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDonationCard(card);
                            donationCardForm.reset({
                              title: card.title,
                              amount: card.amount,
                              description: card.description || '',
                              imageUrl: card.imageUrl || '',
                              order: card.order,
                              isActive: card.isActive,
                              categoryId: card.categoryId,
                            });
                            setIsDonationCardDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteDonationCardMutation.mutate(card.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {card.imageUrl && (
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="text-lg font-bold text-green-600">₹{card.amount.toLocaleString('en-IN')}</span>
                      </div>
                      {card.description && (
                        <p className="text-sm text-gray-600">{card.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <Badge variant={card.isActive ? "default" : "secondary"}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-gray-400">Order: {card.order}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {donationCards.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Donation Cards</h3>
                  <p className="text-gray-600 mb-4">Create predefined donation cards to help donors choose amounts quickly.</p>
                  <Button
                    onClick={() => {
                      setEditingDonationCard(null);
                      donationCardForm.reset();
                      setIsDonationCardDialogOpen(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Donation Card
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bank Details Tab */}
          <TabsContent value="bank-details" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Payment & Bank Details</h2>
              <Button
                onClick={() => {
                  setEditingBankDetails(null);
                  bankDetailsForm.reset();
                  setIsBankDetailsDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bank Details
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bankDetails.map((bank) => (
                <Card key={bank.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{bank.bankName}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingBankDetails(bank);
                            bankDetailsForm.reset({
                              accountName: bank.accountName,
                              bankName: bank.bankName,
                              accountNumber: bank.accountNumber,
                              ifscCode: bank.ifscCode,
                              swiftCode: bank.swiftCode || '',
                              qrCodeUrl: bank.qrCodeUrl || '',
                              isActive: bank.isActive,
                            });
                            setIsBankDetailsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteBankDetailsMutation.mutate(bank.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-500">Account Name</Label>
                        <p className="font-medium">{bank.accountName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Account Number</Label>
                        <p className="font-mono">{bank.accountNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">IFSC Code</Label>
                        <p className="font-mono">{bank.ifscCode}</p>
                      </div>
                      {bank.swiftCode && (
                        <div>
                          <Label className="text-xs text-gray-500">SWIFT Code</Label>
                          <p className="font-mono">{bank.swiftCode}</p>
                        </div>
                      )}
                    </div>
                    
                    {bank.qrCodeUrl && (
                      <div className="text-center">
                        <Label className="text-xs text-gray-500">UPI QR Code</Label>
                        <div className="mt-2">
                          <img 
                            src={bank.qrCodeUrl} 
                            alt="UPI QR Code"
                            className="w-24 h-24 mx-auto border rounded"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={bank.isActive ? "default" : "secondary"}>
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bankDetails.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Details</h3>
                  <p className="text-gray-600 mb-4">Add bank details and UPI information for donors to make payments.</p>
                  <Button
                    onClick={() => {
                      setEditingBankDetails(null);
                      bankDetailsForm.reset();
                      setIsBankDetailsDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Details
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Donation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₹0</div>
                    <div className="text-sm text-gray-600">Total Donated</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Total Donors</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{donationCards.length}</div>
                    <div className="text-sm text-gray-600">Donation Cards</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{bankDetails.length}</div>
                    <div className="text-sm text-gray-600">Payment Methods</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Event Dialog */}
        <Dialog open={isEditingEvent} onOpenChange={setIsEditingEvent}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event Details</DialogTitle>
            </DialogHeader>
            <Form {...eventForm}>
              <form onSubmit={eventForm.handleSubmit((data) => updateEventMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={eventForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter event title" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eventForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ''} placeholder="Enter event description" rows={3} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter image URL" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={eventForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Event Active</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditingEvent(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Donation Card Dialog */}
        <Dialog open={isDonationCardDialogOpen} onOpenChange={setIsDonationCardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDonationCard ? 'Edit Donation Card' : 'Add Donation Card'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={donationCardForm.handleSubmit((data) => {
                if (editingDonationCard) {
                  updateDonationCardMutation.mutate({ id: editingDonationCard.id, data });
                } else {
                  addDonationCardMutation.mutate(data);
                }
              })}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="title">Card Title</Label>
                <Input
                  id="title"
                  {...donationCardForm.register('title')}
                  placeholder="e.g., General Temple Maintenance"
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...donationCardForm.register('amount', { valueAsNumber: true })}
                  placeholder="1001"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...donationCardForm.register('description')}
                  placeholder="Brief description of what this donation supports"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Card Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  {...donationCardForm.register('imageUrl')}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    {...donationCardForm.register('order', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    {...donationCardForm.register('isActive')}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDonationCardDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addDonationCardMutation.isPending || updateDonationCardMutation.isPending}>
                  {(addDonationCardMutation.isPending || updateDonationCardMutation.isPending) ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Bank Details Dialog */}
        <Dialog open={isBankDetailsDialogOpen} onOpenChange={setIsBankDetailsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBankDetails ? 'Edit Bank Details' : 'Add Bank Details'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={bankDetailsForm.handleSubmit((data) => {
                if (editingBankDetails) {
                  updateBankDetailsMutation.mutate({ id: editingBankDetails.id, data });
                } else {
                  addBankDetailsMutation.mutate(data);
                }
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...bankDetailsForm.register('bankName')}
                    placeholder="State Bank of India"
                  />
                </div>

                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    {...bankDetailsForm.register('accountName')}
                    placeholder="ISKCON Juhu Temple"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    {...bankDetailsForm.register('accountNumber')}
                    placeholder="1234567890123"
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    {...bankDetailsForm.register('ifscCode')}
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                <Input
                  id="swiftCode"
                  {...bankDetailsForm.register('swiftCode')}
                  placeholder="SBININBB123"
                />
              </div>

              <div>
                <Label htmlFor="qrCodeUrl">UPI QR Code Image URL</Label>
                <Input
                  id="qrCodeUrl"
                  {...bankDetailsForm.register('qrCodeUrl')}
                  placeholder="Enter QR code image URL"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  {...bankDetailsForm.register('isActive')}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsBankDetailsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addBankDetailsMutation.isPending || updateBankDetailsMutation.isPending}>
                  {(addBankDetailsMutation.isPending || updateBankDetailsMutation.isPending) ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EventManagement;