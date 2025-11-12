import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DonationCategory, insertDonationCategorySchema } from '@shared/schema';
import { donationCategoriesApi } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Extend schema to handle suggested amounts as string input
const donationCategoryFormSchema = insertDonationCategorySchema.extend({
  suggestedAmountsString: z.string().optional(),
}).omit({ suggestedAmounts: true });

type DonationCategoryFormValues = z.infer<typeof donationCategoryFormSchema>;

const DonationSections = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory | null>(null);
  const [sortKey, setSortKey] = useState<'order' | 'name'>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { toast } = useToast();
  
  // Fetch donation categories
  const { data: categories = [], isLoading } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
    queryFn: donationCategoriesApi.getAll,
  });
  
  // Create form
  const createForm = useForm<DonationCategoryFormValues>({
    resolver: zodResolver(donationCategoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      heading: '',
      isActive: true,
      order: 1,
      suggestedAmountsString: '',
    },
  });
  
  // Edit form
  const editForm = useForm<DonationCategoryFormValues>({
    resolver: zodResolver(donationCategoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      heading: '',
      isActive: true,
      order: 1,
      suggestedAmountsString: '',
    },
  });
  
  // Parse suggested amounts from string to array
  const parseSuggestedAmounts = (amountString: string): number[] => {
    if (!amountString) return [];
    
    return amountString.split(',')
      .map(amt => parseInt(amt.trim()))
      .filter(amt => !isNaN(amt) && amt > 0);
  };
  
  // Format suggested amounts from array to string
  const formatSuggestedAmounts = (amounts: number[] | undefined): string => {
    if (!amounts || amounts.length === 0) return '';
    return amounts.join(', ');
  };
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: DonationCategoryFormValues) => {
      const { suggestedAmountsString, ...rest } = data;
      const suggestedAmounts = parseSuggestedAmounts(suggestedAmountsString || '');
      
      return donationCategoriesApi.create({
        ...rest,
        suggestedAmounts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      toast({
        title: "Category Created",
        description: "The donation category has been created successfully.",
        variant: "success",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create donation category. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DonationCategoryFormValues }) => {
      const { suggestedAmountsString, ...rest } = data;
      const suggestedAmounts = parseSuggestedAmounts(suggestedAmountsString || '');
      
      return donationCategoriesApi.update(id, {
        ...rest,
        suggestedAmounts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      toast({
        title: "Category Updated",
        description: "The donation category has been updated successfully.",
        variant: "success",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update donation category. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => donationCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donation-categories'] });
      toast({
        title: "Category Deleted",
        description: "The donation category has been deleted successfully.",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete donation category. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onCreateSubmit = (data: DonationCategoryFormValues) => {
    createMutation.mutate(data);
  };
  
  const onEditSubmit = (data: DonationCategoryFormValues) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    }
  };
  
  const handleEdit = (category: DonationCategory) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl,
      heading: category.heading || '',
      isActive: category.isActive,
      order: category.order,
      suggestedAmountsString: formatSuggestedAmounts(category.suggestedAmounts || []),
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (category: DonationCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };
  
  const toggleSort = (key: 'order' | 'name') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortKey === 'order') {
      return sortDirection === 'asc' ? a.order - b.order : b.order - a.order;
    } else {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    }
  });
  
  return (
    <Layout>
      <Helmet>
        <title>Donation Sections - ISKCON Juhu Admin</title>
      </Helmet>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Donation Sections</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Category
          </Button>
        </div>
        
        {isLoading ? (
          <div className="rounded-md border">
            <div className="p-4">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-md border bg-background p-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Donation Categories Found</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              You haven't created any donation categories yet. Add a category to allow visitors to donate.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Add Your First Category
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">
                    <Button 
                      variant="ghost" 
                      className="px-2 py-1 -ml-4 h-auto font-medium"
                      onClick={() => toggleSort('order')}
                    >
                      #
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="px-2 py-1 -ml-4 h-auto font-medium"
                      onClick={() => toggleSort('name')}
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Suggested Amounts</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-32 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-center font-medium">{category.order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative h-10 w-16 overflow-hidden rounded">
                        <img 
                          src={category.imageUrl} 
                          alt={category.name}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {category.suggestedAmounts?.map((amount) => (
                          <span 
                            key={amount} 
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            ₹{amount.toLocaleString('en-IN')}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Donation Category</DialogTitle>
            <DialogDescription>
              Create a new donation category for the donations page. All fields with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional heading above donation amounts" {...field} />
                    </FormControl>
                    <FormDescription>
                      This heading will appear above the donation amount buttons
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="suggestedAmountsString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Amounts</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g. 501, 1001, 2100, 5100" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter comma-separated donation amounts (without currency symbol)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>Show this category on the website</FormDescription>
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Donation Category</DialogTitle>
            <DialogDescription>
              Update the donation category information. All fields with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional heading above donation amounts" {...field} />
                    </FormControl>
                    <FormDescription>
                      This heading will appear above the donation amount buttons
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="suggestedAmountsString"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Amounts</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g. 501, 1001, 2100, 5100" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter comma-separated donation amounts (without currency symbol)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>Show this category on the website</FormDescription>
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the donation category
              <strong> {selectedCategory?.name}</strong> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DonationSections;
