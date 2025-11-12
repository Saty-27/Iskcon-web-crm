import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminLayout from "@/components/admin/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Settings, CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DonationCategory, DonationCard, insertDonationCardSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import DonationCategoryModal from '@/components/admin/DonationCategoryModal';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const donationCardFormSchema = insertDonationCardSchema.extend({
  amount: z.number().min(1, 'Amount must be at least 1'),
});

const DonationCategoriesPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DonationCategory | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<DonationCard | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCategoryId, setPaymentCategoryId] = useState<number | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
    qrCodeUrl: '',
  });
  const [uploadingQR, setUploadingQR] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for donation card editing
  const cardForm = useForm<z.infer<typeof donationCardFormSchema>>({
    resolver: zodResolver(donationCardFormSchema),
    defaultValues: {
      title: '',
      amount: 0,
      description: '',
      imageUrl: '',
      categoryId: 0,
      isActive: true,
      order: 0,
    },
  });

  const { data: categories = [], isLoading } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
  });

  // Fetch donation cards for expanded category
  const { data: donationCards = [] } = useQuery<DonationCard[]>({
    queryKey: [`/api/donation-cards/category/${expandedCategory}`],
    enabled: !!expandedCategory,
  });

  // Store payment details status for each category
  const [categoryPaymentStatus, setCategoryPaymentStatus] = useState<Record<number, boolean>>({});

  // Fetch payment details status for all categories
  const { data: allPaymentDetails = [] } = useQuery({
    queryKey: ['/api/bank-details'],
    queryFn: async () => {
      const responses = await Promise.all(
        categories.map(async (category) => {
          try {
            const response = await fetch(`/api/categories/${category.id}/bank-details`);
            if (response.ok) {
              const bankDetails = await response.json();
              return { categoryId: category.id, details: bankDetails };
            }
            return { categoryId: category.id, details: [] };
          } catch (error) {
            return { categoryId: category.id, details: [] };
          }
        })
      );
      return responses;
    },
    enabled: categories.length > 0,
  });

  // Update payment status when data changes - but don't affect modal state
  useEffect(() => {
    if (allPaymentDetails.length > 0) {
      const statusMap: Record<number, boolean> = {};
      allPaymentDetails.forEach((pd) => {
        const hasDetails = pd.details && pd.details.length > 0 && pd.details[0].accountName && pd.details[0].bankName;
        statusMap[pd.categoryId] = !!hasDetails;
      });
      setCategoryPaymentStatus(statusMap);
      console.log('Updated category payment status:', statusMap);
    }
  }, [allPaymentDetails]);

  // Simple state management for payment details instead of React Hook Form
  const [paymentFormData, setPaymentFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
    qrCodeUrl: '',
  });

  // Query for payment details when modal is open
  const { data: currentPaymentDetails, isLoading: isLoadingPaymentDetails } = useQuery({
    queryKey: ['/api/categories', selectedCategoryId, 'bank-details'],
    enabled: isPaymentModalOpen && !!selectedCategoryId,
  });

  // Effect to populate state when payment details are loaded
  useEffect(() => {
    if (currentPaymentDetails && isPaymentModalOpen) {
      console.log('Loading payment details into state:', currentPaymentDetails);
      
      if (currentPaymentDetails.length > 0) {
        const details = currentPaymentDetails[0];
        console.log('Setting payment details state:', details);
        
        const newFormData = {
          accountName: details.accountName || '',
          bankName: details.bankName || '',
          accountNumber: details.accountNumber || '',
          ifscCode: details.ifscCode || '',
          swiftCode: details.swiftCode || '',
          qrCodeUrl: details.qrCodeUrl || '',
        };
        
        console.log('Setting form data to:', newFormData);
        setPaymentFormData(newFormData);
        console.log('Payment details state updated');
      } else {
        console.log('No payment details found, clearing state');
        setPaymentFormData({
          accountName: '',
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          swiftCode: '',
          qrCodeUrl: '',
        });
      }
    }
  }, [currentPaymentDetails, isPaymentModalOpen]);

  // Effect to populate form when editing a card
  useEffect(() => {
    if (editingCard && isCardDialogOpen) {
      cardForm.reset({
        title: editingCard.title,
        amount: editingCard.amount,
        description: editingCard.description || '',
        imageUrl: editingCard.imageUrl || '',
        categoryId: editingCard.categoryId,
        isActive: editingCard.isActive,
        order: editingCard.order,
      });
    }
  }, [editingCard, isCardDialogOpen, cardForm]);

  // Effect to ensure categoryId is set when modal opens for new card
  useEffect(() => {
    if (isCardDialogOpen && !editingCard && selectedCategoryId) {
      cardForm.setValue('categoryId', selectedCategoryId);
      cardForm.setValue('order', 0);
    }
  }, [isCardDialogOpen, editingCard, selectedCategoryId, cardForm]);

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/donation-categories/${id}`, 'DELETE'),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      const deletedCards = data?.deletedCards || 0;
      const message = deletedCards > 0 
        ? `Category and ${deletedCards} related donation card(s) deleted successfully`
        : 'Category deleted successfully';
      toast({ title: 'Success', description: message });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to delete category';
      toast({ 
        title: 'Error', 
        description: errorMessage.includes('Cannot delete category') 
          ? 'Cannot delete category with existing donation cards. Please delete the cards first.'
          : errorMessage, 
        variant: 'destructive' 
      });
    },
  });

  // Donation card mutations
  const createCardMutation = useMutation({
    mutationFn: (data: z.infer<typeof donationCardFormSchema>) => 
      apiRequest('/api/donation-cards', 'POST', data),
    onSuccess: async () => {
      // Comprehensive cache invalidation for both admin and frontend
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/donation-cards/category/${selectedCategoryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      
      // Force refresh the specific category cards (remove stale data)
      if (selectedCategoryId) {
        await queryClient.refetchQueries({ queryKey: [`/api/donation-cards/category/${selectedCategoryId}`] });
        // Also invalidate all related queries to ensure fresh data
        queryClient.removeQueries({ queryKey: [`/api/donation-cards/category/${selectedCategoryId}`] });
      }
      
      // Clear all stale cache entries for donation cards
      queryClient.removeQueries({ queryKey: ['/api/donation-cards'] });
      
      toast({ title: 'Success', description: 'Donation card created successfully' });
      setIsCardDialogOpen(false);
      cardForm.reset();
      setSelectedCategoryId(null);
      setEditingCard(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create donation card', variant: 'destructive' });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<z.infer<typeof donationCardFormSchema>> }) =>
      apiRequest(`/api/donation-cards/${id}`, 'PUT', data),
    onSuccess: async () => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/donation-cards/category/${selectedCategoryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      
      // Force refresh the specific category cards
      if (selectedCategoryId) {
        await queryClient.refetchQueries({ queryKey: [`/api/donation-cards/category/${selectedCategoryId}`] });
      }
      
      toast({ title: 'Success', description: 'Donation card updated successfully' });
      setIsCardDialogOpen(false);
      setEditingCard(null);
      cardForm.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update donation card', variant: 'destructive' });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/donation-cards/${id}`, 'DELETE'),
    onSuccess: async () => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/donation-cards/category/${expandedCategory}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      
      // Force refresh the specific category cards
      if (expandedCategory) {
        await queryClient.refetchQueries({ queryKey: [`/api/donation-cards/category/${expandedCategory}`] });
      }
      
      toast({ title: 'Success', description: 'Donation card deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete donation card', variant: 'destructive' });
    },
  });

  const handleEdit = (category: DonationCategory) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all associated donation cards.')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleEditCard = (card: DonationCard) => {
    setEditingCard(card);
    setSelectedCategoryId(card.categoryId);
    
    // Reset form with the card data
    cardForm.reset({
      title: card.title,
      amount: card.amount,
      description: card.description || '',
      imageUrl: card.imageUrl || '',
      categoryId: card.categoryId,
      isActive: card.isActive,
      order: card.order,
    });
    setIsCardDialogOpen(true);
  };

  const handleAddCard = (categoryId: number) => {
    setEditingCard(null);
    setSelectedCategoryId(categoryId);
    
    // Reset form with proper categoryId
    cardForm.reset({
      title: '',
      amount: 0,
      description: '',
      imageUrl: '',
      categoryId: categoryId,
      isActive: true,
      order: 0,
    });
    
    // Ensure categoryId is set immediately after reset
    cardForm.setValue('categoryId', categoryId);
    cardForm.setValue('order', 0);
    
    setIsCardDialogOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploadingQR(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qr');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPaymentFormData(prev => ({ ...prev, qrCodeUrl: data.url }));
      
      toast({
        title: 'Success',
        description: 'QR code uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload QR code',
        variant: 'destructive',
      });
    } finally {
      setUploadingQR(false);
    }
  };

  const handleOpenPaymentModal = async (categoryId: number) => {
    console.log('Opening payment modal for category:', categoryId);
    setSelectedCategoryId(categoryId);
    setIsPaymentModalOpen(true);
    
    // Load existing payment details for this category
    try {
      const response = await fetch(`/api/categories/${categoryId}/bank-details`);
      if (response.ok) {
        const existingDetails = await response.json();
        console.log('Loaded existing payment details:', existingDetails);
        
        if (existingDetails && existingDetails.length > 0) {
          const details = existingDetails[0];
          setPaymentFormData({
            accountName: details.accountName || '',
            bankName: details.bankName || '',
            accountNumber: details.accountNumber || '',
            ifscCode: details.ifscCode || '',
            swiftCode: details.swiftCode || '',
            qrCodeUrl: details.qrCodeUrl || '',
          });
        } else {
          // Reset to empty if no existing details
          setPaymentFormData({
            accountName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            swiftCode: '',
            qrCodeUrl: '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading existing payment details:', error);
      // Reset to empty form on error
      setPaymentFormData({
        accountName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        swiftCode: '',
        qrCodeUrl: '',
      });
    }
  };

  const handleSavePaymentDetails = async () => {
    if (!selectedCategoryId) return;
    
    console.log('Saving payment details:', paymentFormData);
    
    try {
      const response = await fetch(`/api/categories/${selectedCategoryId}/bank-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentFormData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Save result:', result);

      toast({
        title: 'Success',
        description: 'Payment details saved successfully',
      });
      
      handleClosePaymentModal();
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories', selectedCategoryId, 'bank-details'] });
    } catch (error) {
      console.error('Save error details:', error);
      toast({
        title: 'Error',
        description: `Failed to save payment details: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedCategoryId(null);
    setPaymentFormData({
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      swiftCode: '',
      qrCodeUrl: '',
    });
  };

  // Form submission is now handled inline in the form onSubmit handler

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };


  const getSuggestedAmountsDisplay = (suggestedAmounts: any) => {
    if (!suggestedAmounts) return 'No suggested amounts';
    if (Array.isArray(suggestedAmounts)) {
      return suggestedAmounts.length > 0 ? `${suggestedAmounts.length} suggested amounts` : 'No suggested amounts';
    }
    return 'No suggested amounts';
  };

  const getCustomDonationStatus = (category: DonationCategory) => {
    // For now, assume custom donations are enabled for all categories
    return 'Custom donations enabled';
  };

  const getPaymentDetailsStatus = (categoryId: number) => {
    return categoryPaymentStatus[categoryId] ? 'Payment details configured' : 'Payment details not configured';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Donation Categories</h1>
              <p className="text-gray-600">Create and manage comprehensive donation categories with full control</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Donation Categories</h1>
            <p className="text-gray-600">Create and manage comprehensive donation categories with full control</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </div>

        <div className="grid gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="grid grid-cols-3 gap-8 text-sm">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>{getSuggestedAmountsDisplay(category.suggestedAmounts)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">💰</span>
                        <span>{getCustomDonationStatus(category)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">🏦</span>
                        <span>{getPaymentDetailsStatus(category.id)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      title="Manage donation cards"
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPaymentModal(category.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Manage payment details"
                    >
                      <DollarSign className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded donation cards section */}
                {expandedCategory === category.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold">Donation Cards</h4>
                      <Button
                        size="sm"
                        onClick={() => handleAddCard(category.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Card
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {donationCards.filter(card => card.categoryId === category.id).map((card) => (
                        <Card key={card.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-sm">{card.title}</h5>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditCard(card)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteCardMutation.mutate(card.id)}
                                  className="h-6 w-6 p-0 text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{card.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-green-600">₹{card.amount}</span>
                              <Badge variant={card.isActive ? "default" : "secondary"} className="text-xs">
                                {card.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {donationCards.filter(card => card.categoryId === category.id).length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No donation cards yet</p>
                          <p className="text-xs">Click "Add Card" to create your first donation card</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No donation categories</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first donation category</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category Modal */}
        <DonationCategoryModal
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditingCategory(null);
          }}
          category={null}
        />
        
        {/* Edit Category Modal */}
        <DonationCategoryModal
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            setActiveTab('details');
          }}
          category={editingCategory}
          initialActiveTab={activeTab}
        />

        {/* Simple Add Card Modal */}
        <Dialog open={isCardDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingCard(null);
            setSelectedCategoryId(null);
            cardForm.reset();
          }
          setIsCardDialogOpen(open);
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Edit Donation Card' : 'Add Donation Card'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              
              <div>
                <Label htmlFor="title">Card Title</Label>
                <Input
                  id="title"
                  {...cardForm.register('title')}
                  placeholder="e.g., Temple Renovation"
                />
                {cardForm.formState.errors.title && (
                  <p className="text-sm text-red-600">{cardForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...cardForm.register('amount', { valueAsNumber: true })}
                  placeholder="1001"
                />
                {cardForm.formState.errors.amount && (
                  <p className="text-sm text-red-600">{cardForm.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={cardForm.watch('isActive')}
                  onCheckedChange={(checked) => cardForm.setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCardDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    // Get form data manually
                    const formData = cardForm.getValues();
                    const cardData = {
                      title: formData.title,
                      amount: formData.amount,
                      description: formData.description || '',
                      imageUrl: formData.imageUrl || '',
                      categoryId: selectedCategoryId!,
                      isActive: formData.isActive !== undefined ? formData.isActive : true,
                      order: 0,
                    };
                    
                    if (!selectedCategoryId) {
                      toast({ 
                        title: 'Error', 
                        description: 'Category ID is missing. Please close and reopen the form.', 
                        variant: 'destructive' 
                      });
                      return;
                    }
                    
                    if (editingCard) {
                      updateCardMutation.mutate({ id: editingCard.id, data: cardData });
                    } else {
                      createCardMutation.mutate(cardData);
                    }
                  }}
                  disabled={createCardMutation.isPending || updateCardMutation.isPending}
                >
                  {(createCardMutation.isPending || updateCardMutation.isPending) ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Details Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={(open) => { if (!open) handleClosePaymentModal(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {isLoadingPaymentDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading payment details...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input 
                      id="accountName"
                      placeholder="International Society for Krishna Consciousness"
                      value={paymentFormData.accountName}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input 
                      id="bankName"
                      placeholder="State Bank of India"
                      value={paymentFormData.bankName}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input 
                      id="accountNumber"
                      placeholder="10000000025"
                      value={paymentFormData.accountNumber}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input 
                      id="ifscCode"
                      placeholder="SBIN000001"
                      value={paymentFormData.ifscCode}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
                    <Input 
                      id="swiftCode"
                      placeholder="SBININBB"
                      value={paymentFormData.swiftCode}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, swiftCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qrCodeUrl">UPI QR Code</Label>
                    <Input 
                      id="qrCodeUrl"
                      placeholder="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=iskcon@sbi&pn=ISKCON"
                      value={paymentFormData.qrCodeUrl}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, qrCodeUrl: e.target.value }))}
                    />
                  </div>
                </div>

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
                          handleFileUpload(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={uploadingQR}
                  >
                    {uploadingQR ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Upload QR Code'
                    )}
                  </Button>
                </div>



                {paymentFormData.qrCodeUrl && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">QR Code Preview:</div>
                    <img 
                      src={paymentFormData.qrCodeUrl} 
                      alt="QR Code preview" 
                      className="w-32 h-32 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        console.log('QR code image failed to load:', paymentFormData.qrCodeUrl);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="showPaymentDetails" defaultChecked />
                  <Label htmlFor="showPaymentDetails">Show payment details section</Label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSavePaymentDetails}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Payment Details
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <DonationCategoryModal 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          category={null}
        />

        {/* Edit Category Modal */}
        <DonationCategoryModal 
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
        />
      </div>
    </AdminLayout>
  );
};

export default DonationCategoriesPage;