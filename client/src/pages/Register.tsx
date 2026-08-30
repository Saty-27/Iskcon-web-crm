import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, User, Lock, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(6, { message: 'Please enter a valid phone number' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
  address: z.string().min(3, { message: 'Please enter your address' }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledFromLogin, setPrefilledFromLogin] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { register, isAuthenticated, user, isPendingRegister } = useAuth();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      address: '',
    },
  });

  // Check URL params for pre-filled email from login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      form.setValue('email', emailParam);
      // Auto-suggest a clean username from email prefix (e.g. devotee from devotee@gmail.com)
      const usernameSuggestion = emailParam.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      if (!form.getValues('username')) {
        form.setValue('username', usernameSuggestion);
      }
      setPrefilledFromLogin(true);
    }
  }, [form]);

  // If already authenticated, redirect straight to profile or target page (never show login)
  useEffect(() => {
    if (isAuthenticated && user && !isSubmitting && !isPendingRegister) {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');
      if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        window.location.href = user.role === 'admin' ? '/admin' : '/profile';
      }
    }
  }, [isAuthenticated, user, isSubmitting, isPendingRegister]);
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    
    try {
      const result = await register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        username: data.username.trim(),
        password: data.password,
        address: data.address.trim(),
      });
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to ISKCON Juhu! You are now logged in.",
      });
      
      // Directly log user in and take them to their profile/target page without visiting login
      setTimeout(() => {
        if (redirectPath) {
          window.location.href = redirectPath;
        } else if (result?.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/profile';
        }
      }, 300);
    } catch (error: any) {
      let errorMessage = error?.message || "There was an error creating your account. Please try again.";
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Create an Account - ISKCON Juhu</title>
        <meta name="description" content="Register an account with ISKCON Juhu to manage your donations, track 80G tax exemptions, and receive temple blessings." />
      </Helmet>
      
      <Header />
      
      <main className="min-h-[85vh] bg-gradient-to-b from-orange-50/50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <UserPlus className="w-8 h-8" />
              </div>
              <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="font-opensans text-sm text-gray-600">
                Join our spiritual community to easily donate, track receipts, and receive 80G certificates.
              </p>

              {/* Informative notice if redirected from login */}
              {prefilledFromLogin && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>
                    Your email is not registered yet. Please complete these details to set up your account.
                  </span>
                </div>
              )}
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                        <User className="w-4 h-4 text-orange-500" /> Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Radheshyam Das" 
                          {...field} 
                          className="h-11 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-orange-500" /> Email Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="e.g. devotee@example.com" 
                            {...field} 
                            className="h-11 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-orange-500" /> Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="e.g. +91 98765 43210" 
                            {...field} 
                            className="h-11 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                          <User className="w-4 h-4 text-orange-500" /> Username
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                            className="h-11 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-orange-500" /> Password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Create a password" 
                            {...field} 
                            className="h-11 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-500" /> Full Address (Postal / Street)
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Flat 101, Krishna Heights, Juhu, Mumbai - 400049" 
                          {...field} 
                          rows={2}
                          className="rounded-xl focus:ring-orange-500 focus:border-orange-500 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold text-base rounded-xl transition-all shadow-md hover:shadow-lg mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account & Logging in...</span>
                    </div>
                  ) : (
                    "Register & Continue"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="font-opensans text-sm text-gray-600">
                Already registered? {' '}
                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                  Login with Email
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Register;
