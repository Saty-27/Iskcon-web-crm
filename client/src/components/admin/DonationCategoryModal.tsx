import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
import { Plus, Trash2, GripVertical, Upload, Image, X } from "lucide-react";
import type { DonationCategory, DonationCard, BankDetails } from "@shared/schema";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Banner image is required"),
  isActive: z.boolean(),
  order: z.number().min(0),
  heading: z.string().optional(),
  suggestedAmounts: z.array(z.number()).optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface DonationCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: DonationCategory | null;
  initialActiveTab?: string;
}

export default function DonationCategoryModal({ isOpen, onClose, category, initialActiveTab = "details" }: DonationCategoryModalProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [donationCards, setDonationCards] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [suggestedAmountsInput, setSuggestedAmountsInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // Update activeTab when initialActiveTab changes
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize default values to prevent recreation
  const defaultValues = useMemo(() => ({
    name: category?.name || "",
    description: category?.description || "",
    imageUrl: category?.imageUrl || "",
    isActive: category?.isActive ?? true,
    order: category?.order || 0,
    heading: category?.heading || "",
    suggestedAmounts: Array.isArray(category?.suggestedAmounts) ? category.suggestedAmounts : [],
  }), [category?.id]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const { data: existingDonationCards = [] } = useQuery<DonationCard[]>({
    queryKey: [`/api/donation-cards/category/${category?.id}`],
    enabled: !!category?.id,
  });

  // Fetch category-specific bank details
  const { data: existingBankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: [`/api/categories/${category?.id}/bank-details`],
    enabled: isOpen && !!category?.id,
  });

  // Initialize state when modal opens and reset form with category data
  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
      setSuggestedAmountsInput(
        Array.isArray(category?.suggestedAmounts) 
          ? category.suggestedAmounts.join(", ") 
          : ""
      );
      
      // Reset form with category data when editing
      if (category) {
        console.log('Resetting form with category data:', category);
        form.reset({
          name: category.name || "",
          description: category.description || "",
          imageUrl: category.imageUrl || "",
          isActive: category.isActive ?? true,
          order: category.order || 0,
          heading: category.heading || "",
          suggestedAmounts: Array.isArray(category.suggestedAmounts) ? category.suggestedAmounts : [],
        });
      } else {
        // Clear form for new category
        form.reset({
          name: "",
          description: "",
          imageUrl: "",
          isActive: true,
          order: 0,
          heading: "",
          suggestedAmounts: [],
        });
        setDonationCards([]);
        setBankDetails({
          accountName: '',
          accountNumber: '',
          bankName: '',
          ifscCode: '',
          swiftCode: '',
          qrCodeUrl: '',
        });
      }
    } else {
      // Clear states when modal closes
      setDonationCards([]);
      setBankDetails(null);
      setActiveTab("details");
      setSuggestedAmountsInput("");
    }
  }, [isOpen, category?.id, form, category]);

  // Load existing donation cards when editing
  useEffect(() => {
    if (isOpen && category?.id && existingDonationCards.length > 0) {
      const categoryCards = existingDonationCards.filter(card => card.categoryId === category.id);
      console.log('Loading existing cards for category:', category.id, categoryCards);
      
      // Prevent duplicate loading by checking if cards are already loaded
      if (JSON.stringify(donationCards) !== JSON.stringify(categoryCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description || "",
        amount: card.amount,
        imageUrl: card.imageUrl || "",
        isActive: card.isActive,
        order: card.order || 0,
      })))) {
        setDonationCards(categoryCards.map(card => ({
          id: card.id,
          title: card.title,
          description: card.description || "",
          amount: card.amount,
          imageUrl: card.imageUrl || "",
          isActive: card.isActive,
          order: card.order || 0,
        })));
      }
    } else if (isOpen && category?.id && existingDonationCards.length === 0) {
      // If no existing cards for this category, clear the state
      setDonationCards([]);
    }
  }, [category?.id, existingDonationCards, isOpen]);

  // Load existing bank details
  useEffect(() => {
    if (existingBankDetails.length > 0) {
      const bankDetail = existingBankDetails[0];
      setBankDetails({
        accountName: bankDetail.accountName,
        accountNumber: bankDetail.accountNumber,
        bankName: bankDetail.bankName,
        ifscCode: bankDetail.ifscCode,
        swiftCode: bankDetail.swiftCode || "",
        qrCodeUrl: bankDetail.qrCodeUrl || "",
      });
    }
  }, [existingBankDetails]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const suggestedAmounts = suggestedAmountsInput
        ? suggestedAmountsInput.split(',').map(amount => parseInt(amount.trim())).filter(amount => !isNaN(amount))
        : [];

      const categoryData = {
        ...data,
        suggestedAmounts,
      };

      return await apiRequest('/api/donation-categories', 'POST', categoryData);
    },
    onSuccess: async (newCategory: any) => {
      try {
        console.log('New category created:', newCategory);
        
        // Filter out empty or invalid donation cards before processing
        const validCards = donationCards.filter(card => 
          card.title && card.title.trim() && card.amount && Number(card.amount) > 0
        );
        
        console.log('Valid cards to create:', validCards);
        
        if (validCards.length > 0) {
          // Create cards sequentially to prevent race conditions
          for (let i = 0; i < validCards.length; i++) {
            const card = validCards[i];
            const cardData = {
              title: card.title.trim(),
              amount: Number(card.amount),
              description: card.description || "",
              imageUrl: card.imageUrl || "",
              categoryId: newCategory.id,
              isActive: true,
              order: i,
            };
            
            console.log('Creating card with data:', cardData);
            try {
              const newCard = await apiRequest('/api/donation-cards', 'POST', cardData);
              console.log('Successfully created card:', newCard.id, newCard.title);
            } catch (error) {
              console.error('Failed to create card:', card.title, error);
              // Continue with other cards even if one fails
            }
          }
        }

        if (bankDetails && existingBankDetails.length > 0) {
          const bankDetailId = existingBankDetails[0].id;
          if (isJanmashtamiCategory) {
            await apiRequest(`/api/events/1/bank-details/${bankDetailId}`, 'PUT', bankDetails);
          } else {
            await apiRequest(`/api/bank-details/${bankDetailId}`, 'PUT', bankDetails);
          }
        } else if (bankDetails) {
          if (isJanmashtamiCategory) {
            await apiRequest('/api/events/1/bank-details', 'POST', bankDetails);
          } else {
            await apiRequest('/api/bank-details', 'POST', bankDetails);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
        queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
        queryClient.invalidateQueries({ queryKey: [`/api/donation-cards/category/${newCategory.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
        queryClient.invalidateQueries({ queryKey: ['/api/events/1/bank-details'] });
        queryClient.invalidateQueries({ queryKey: [`/api/categories/${newCategory.id}/bank-details`] });
        onClose();
        toast({ title: 'Success', description: 'Category created successfully' });
      } catch (error) {
        // Category was created but there was an issue with cards/bank details
        queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
        onClose();
        toast({ 
          title: 'Partial Success', 
          description: 'Category created, but there may be issues with donation cards or payment details',
          variant: 'default'
        });
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!category) return;

      const suggestedAmounts = suggestedAmountsInput
        ? suggestedAmountsInput.split(',').map(amount => parseInt(amount.trim())).filter(amount => !isNaN(amount))
        : [];

      const categoryData = {
        ...data,
        suggestedAmounts,
      };

      await apiRequest(`/api/donation-categories/${category.id}`, 'PUT', categoryData);
      return category.id;
    },
    onSuccess: async (categoryId) => {
      try {
        // Get current state of cards
        const existingCards = existingDonationCards.filter(card => card.categoryId === categoryId);
        const validCards = donationCards.filter(card => 
          card.title && card.title.trim() && card.amount && Number(card.amount) > 0
        );

        console.log('Updating cards for category:', categoryId);
        console.log('Existing cards:', existingCards.map(c => ({ id: c.id, title: c.title })));
        console.log('Valid new cards:', validCards.map(c => ({ id: c.id, title: c.title })));

        // Create maps for efficient comparison
        const existingCardMap = new Map(existingCards.map(card => [card.id, card]));
        const validCardMap = new Map();
        
        // Build valid card map with proper IDs
        validCards.forEach(card => {
          if (card.id) {
            validCardMap.set(card.id, card);
          }
        });

        // Delete cards that are no longer needed
        // First, check if any cards need to be deleted
        const cardsToDelete = existingCards.filter(existingCard => {
          const stillExists = validCards.some(card => 
            (card.id && card.id === existingCard.id) || 
            (card.title === existingCard.title && card.amount === existingCard.amount)
          );
          return !stillExists;
        });

        console.log('Cards to delete:', cardsToDelete.map(c => ({ id: c.id, title: c.title })));

        for (const cardToDelete of cardsToDelete) {
          try {
            await apiRequest(`/api/donation-cards/${cardToDelete.id}`, 'DELETE');
            console.log('Deleted card:', cardToDelete.id, cardToDelete.title);
          } catch (error) {
            console.log('Card already deleted or not found:', cardToDelete.id);
          }
        }

        // Additionally, if we have fewer cards in the frontend than in the database,
        // delete the excess ones
        if (validCards.length < existingCards.length) {
          const excessCards = existingCards.slice(validCards.length);
          console.log('Deleting excess cards:', excessCards.map(c => ({ id: c.id, title: c.title })));
          
          for (const excessCard of excessCards) {
            try {
              await apiRequest(`/api/donation-cards/${excessCard.id}`, 'DELETE');
              console.log('Deleted excess card:', excessCard.id, excessCard.title);
            } catch (error) {
              console.log('Excess card already deleted or not found:', excessCard.id);
            }
          }
        }

        // Update or create cards
        for (let i = 0; i < validCards.length; i++) {
          const card = validCards[i];
          const cardData = {
            title: card.title.trim(),
            amount: Number(card.amount),
            description: card.description || "",
            imageUrl: card.imageUrl || "",
            categoryId,
            isActive: true,
            order: i,
          };

          if (card.id && existingCardMap.has(card.id)) {
            // Update existing card
            await apiRequest(`/api/donation-cards/${card.id}`, 'PUT', cardData);
            console.log('Updated card:', card.id, card.title);
          } else {
            // Check if card with same title and amount already exists to prevent duplicates
            const duplicateCard = existingCards.find(existing => 
              existing.title === card.title && existing.amount === card.amount
            );
            
            if (!duplicateCard) {
              // Create new card only if no duplicate exists
              const newCard = await apiRequest('/api/donation-cards', 'POST', cardData);
              console.log('Created new card:', newCard.id, card.title);
            } else {
              console.log('Skipped duplicate card:', card.title);
            }
          }
        }

        if (bankDetails && existingBankDetails.length > 0) {
          const activeBankDetails = existingBankDetails.find(bd => bd.isActive) || existingBankDetails[0];
          await apiRequest(`/api/categories/${categoryId}/bank-details/${activeBankDetails.id}`, 'PUT', {
            ...bankDetails,
            isActive: true,
          });
        }
      } catch (error) {
        console.error('Error in success handler:', error);
        throw error;
      }

      // Comprehensive cache invalidation with forced refresh
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donation-cards'] });
      queryClient.invalidateQueries({ queryKey: [`/api/donation-cards/category/${categoryId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/bank-details'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/bank-details'] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${categoryId}/bank-details`] });
      
      // Force refresh the category-specific cards
      await queryClient.refetchQueries({ queryKey: [`/api/donation-cards/category/${categoryId}`] });
      
      onClose();
      toast({ title: 'Success', description: 'Category updated successfully' });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({ 
        title: 'Update Failed', 
        description: error instanceof Error ? error.message : 'Failed to update category and cards',
        variant: 'destructive' 
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (category) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const addDonationCard = () => {
    setDonationCards([...donationCards, { 
      title: "", 
      description: "", 
      amount: 0,
      imageUrl: "",
      isActive: true,
      order: donationCards.length
    }]);
  };

  const removeDonationCard = (index: number) => {
    console.log('Removing card at index:', index, 'from cards:', donationCards);
    const newCards = donationCards.filter((_, i) => i !== index);
    console.log('Cards after removal:', newCards);
    setDonationCards(newCards);
  };

  const updateDonationCard = (index: number, field: string, value: any) => {
    const updated = [...donationCards];
    updated[index] = { ...updated[index], [field]: value };
    setDonationCards(updated);
  };

  const handleFileUpload = async (file: File, type: string, cardIndex?: number) => {
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
    formData.append('type', type);

    setUploadingImage(type + (cardIndex !== undefined ? `-${cardIndex}` : ''));

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
      const imageUrl = result.url;

      if (type === 'banner') {
        form.setValue('imageUrl', imageUrl);
        form.trigger('imageUrl'); // Force re-validation and re-render
      } else if (type === 'card' && cardIndex !== undefined) {
        updateDonationCard(cardIndex, 'imageUrl', imageUrl);
      } else if (type === 'qr') {
        setBankDetails((prev: any) => ({
          ...prev,
          qrCodeUrl: imageUrl,
          accountName: prev?.accountName || '',
          accountNumber: prev?.accountNumber || '',
          bankName: prev?.bankName || '',
          ifscCode: prev?.ifscCode || '',
          swiftCode: prev?.swiftCode || '',
        }));
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${category ? 'grid-cols-4' : 'grid-cols-1'}`}>
            <TabsTrigger value="details">Category Details</TabsTrigger>
            {category && (
              <>
                <TabsTrigger value="cards">Donation Cards</TabsTrigger>
                <TabsTrigger value="custom">Custom Donation</TabsTrigger>
                <TabsTrigger value="payment">Payment Details</TabsTrigger>
              </>
            )}
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Information & Banner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
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
                              placeholder="Rich text description of the category..."
                              rows={4}
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
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Category Status</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Make category visible on frontend
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banner Image</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                placeholder="https://example.com/banner-image.jpg"
                                {...field}
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
                                      if (file) handleFileUpload(file, 'banner');
                                    };
                                    input.click();
                                  }}
                                  disabled={uploadingImage === 'banner'}
                                >
                                  {uploadingImage === 'banner' ? (
                                    <>
                                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-2" />
                                      Upload Image
                                    </>
                                  )}
                                </Button>
                              </div>
                              {field.value && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-600 mb-1">Preview:</div>
                                  <img 
                                    src={field.value} 
                                    alt="Banner preview" 
                                    className="w-48 h-28 object-cover rounded border border-gray-300"
                                    onLoad={() => console.log('Image loaded:', field.value)}
                                    onError={(e) => {
                                      console.log('Image failed to load:', field.value);
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">{field.value}</div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Heading (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Custom heading for this category"
                              {...field}
                            />
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
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter amounts separated by commas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Donation Cards Tab - Only show when editing existing category */}
              {category && (
                <TabsContent value="cards" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Predefined Donation Cards</CardTitle>
                      <Button
                        type="button"
                        onClick={addDonationCard}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Card
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {donationCards.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No donation cards added yet. Click "Add Card" to create predefined donation options.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {donationCards.map((card, index) => (
                          <Card key={index} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">Card {index + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDonationCard(index)}
                                  className="ml-auto text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Card Title</Label>
                                  <Input
                                    placeholder="e.g., Temple Renovation"
                                    value={card.title}
                                    onChange={(e) => updateDonationCard(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Amount (₹)</Label>
                                  <Input
                                    type="number"
                                    placeholder="1001"
                                    value={card.amount || ''}
                                    onChange={(e) => updateDonationCard(index, 'amount', Number(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Input
                                    placeholder="Brief description"
                                    value={card.description}
                                    onChange={(e) => updateDonationCard(index, 'description', e.target.value)}
                                  />
                                </div>
                              </div>
                              

                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              )}

              {/* Custom Donation Tab - Only show when editing existing category */}
              {category && (
                <TabsContent value="custom" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Donation Section</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-custom"
                        defaultChecked={true}
                      />
                      <Label htmlFor="enable-custom">Enable Custom Donation</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow donors to enter their own amount
                    </p>

                    <div>
                      <Label>Section Title</Label>
                      <Input
                        placeholder="Any Donation of Your Choice"
                        className="mt-2"
                        defaultValue="Any Donation of Your Choice"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              )}

              {/* Payment Details Tab - Only show when editing existing category */}
              {category && (
                <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank & UPI Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Account Holder Name</Label>
                        <Input
                          placeholder="International Society for Krishna Consciousness"
                          value={bankDetails?.accountName || ''}
                          onChange={(e) => setBankDetails((prev: any) => ({
                            ...prev,
                            accountName: e.target.value,
                            accountNumber: prev?.accountNumber || '',
                            bankName: prev?.bankName || '',
                            ifscCode: prev?.ifscCode || '',
                            swiftCode: prev?.swiftCode || '',
                            qrCodeUrl: prev?.qrCodeUrl || '',
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          placeholder="HDFC Bank"
                          value={bankDetails?.bankName || ''}
                          onChange={(e) => setBankDetails((prev: any) => ({
                            ...prev,
                            bankName: e.target.value,
                            accountName: prev?.accountName || '',
                            accountNumber: prev?.accountNumber || '',
                            ifscCode: prev?.ifscCode || '',
                            swiftCode: prev?.swiftCode || '',
                            qrCodeUrl: prev?.qrCodeUrl || '',
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          placeholder="50765432109876"
                          value={bankDetails?.accountNumber || ''}
                          onChange={(e) => setBankDetails((prev: any) => ({
                            ...prev,
                            accountNumber: e.target.value,
                            accountName: prev?.accountName || '',
                            bankName: prev?.bankName || '',
                            ifscCode: prev?.ifscCode || '',
                            swiftCode: prev?.swiftCode || '',
                            qrCodeUrl: prev?.qrCodeUrl || '',
                          }))}
                        />
                      </div>
                      <div>
                        <Label>IFSC Code</Label>
                        <Input
                          placeholder="HDFC0001234"
                          value={bankDetails?.ifscCode || ''}
                          onChange={(e) => setBankDetails((prev: any) => ({
                            ...prev,
                            ifscCode: e.target.value,
                            accountName: prev?.accountName || '',
                            accountNumber: prev?.accountNumber || '',
                            bankName: prev?.bankName || '',
                            swiftCode: prev?.swiftCode || '',
                            qrCodeUrl: prev?.qrCodeUrl || '',
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>SWIFT Code (Optional)</Label>
                        <Input
                          placeholder="HDFCINBB456"
                          value={bankDetails?.swiftCode || ''}
                          onChange={(e) => setBankDetails((prev: any) => ({
                            ...prev,
                            swiftCode: e.target.value,
                            accountName: prev?.accountName || '',
                            accountNumber: prev?.accountNumber || '',
                            bankName: prev?.bankName || '',
                            ifscCode: prev?.ifscCode || '',
                            qrCodeUrl: prev?.qrCodeUrl || '',
                          }))}
                        />
                      </div>
                      <div>
                        <Label>UPI QR Code</Label>
                        <div className="space-y-2">
                          <Input
                            placeholder="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=iskcon@ybl&pn=ISKCON"
                            value={bankDetails?.qrCodeUrl || ''}
                            onChange={(e) => setBankDetails((prev: any) => ({
                              ...prev,
                              qrCodeUrl: e.target.value,
                              accountName: prev?.accountName || '',
                              accountNumber: prev?.accountNumber || '',
                              bankName: prev?.bankName || '',
                              ifscCode: prev?.ifscCode || '',
                              swiftCode: prev?.swiftCode || '',
                            }))}
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
                                    handleFileUpload(file, 'qr');
                                  }
                                };
                                input.click();
                              }}
                              disabled={uploadingImage === 'qr'}
                            >
                              {uploadingImage === 'qr' ? (
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
                          {bankDetails?.qrCodeUrl && (
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
                                onClick={() => setBankDetails((prev: any) => ({
                                  ...prev,
                                  qrCodeUrl: '',
                                  accountName: prev?.accountName || '',
                                  accountNumber: prev?.accountNumber || '',
                                  bankName: prev?.bankName || '',
                                  ifscCode: prev?.ifscCode || '',
                                  swiftCode: prev?.swiftCode || '',
                                }))}
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                              >
                                ×
                              </Button>
                              <div className="text-xs text-gray-500 mt-1">{bankDetails.qrCodeUrl}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="show-payment" defaultChecked />
                      <Label htmlFor="show-payment">Show payment details section</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending
                    ? "Saving..." 
                    : category ? "Update Category" : "Create Category"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}