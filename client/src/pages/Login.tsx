import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import useAuth, { AuthApiError } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, UserCheck } from 'lucide-react';

const emailLoginFormSchema = z.object({
  email: z.string().min(1, { message: 'Email address is required' }).email({ message: 'Please enter a valid email address' }),
});

type EmailLoginFormValues = z.infer<typeof emailLoginFormSchema>;

const Login = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, user, isPendingLogin } = useAuth();
  
  const emailForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Check URL params for pre-filled email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      emailForm.setValue('email', emailParam);
    }
  }, [emailForm]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user && !isPendingLogin) {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');
      
      if (redirectPath) {
        setLocation(redirectPath);
      } else {
        if (user.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/profile');
        }
      }
    }
  }, [isAuthenticated, user, isPendingLogin, setLocation]);
  
  const onEmailSubmit = async (data: EmailLoginFormValues) => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    
    try {
      const result = await login({ email: data.email.trim() });
      
      toast({
        title: "Welcome Back!",
        description: `Logged in successfully as ${result?.user?.name || result?.user?.email}`,
      });
      
      setTimeout(() => {
        if (redirectPath) {
          setLocation(redirectPath);
        } else if (result?.user?.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/profile');
        }
      }, 300);
    } catch (err: any) {
      if (err instanceof AuthApiError && err.notRegistered) {
        toast({
          title: "Account Not Found",
          description: "This email is not registered yet. Redirecting to registration...",
        });
        setTimeout(() => {
          setLocation(`/register?email=${encodeURIComponent(data.email.trim())}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ''}`);
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: err?.message || "Could not log in with this email. Please check and try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - ISKCON Juhu</title>
        <meta name="description" content="Login to your ISKCON Juhu account to manage donations, track receipts, and connect with temple events." />
      </Helmet>

      <Header />

      <main className="min-h-[85vh] bg-gradient-to-b from-orange-50/50 via-white to-gray-50 py-16 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-orange-100">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <UserCheck className="w-8 h-8" />
              </div>

              <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                Devotee Sign In
              </h1>
              <p className="font-opensans text-sm text-gray-600">
                Enter your registered email address to access your profile and donation receipts.
              </p>
            </div>

            {/* Email-Only Login Form */}
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-orange-500" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="devotee@example.com" 
                          {...field} 
                          className="h-12 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-base"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-poppins font-semibold text-base rounded-xl transition-all shadow-md hover:shadow-lg mt-2 flex items-center justify-center gap-2"
                  disabled={isPendingLogin}
                >
                  {isPendingLogin ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Email...</span>
                    </div>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Registration Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account yet?{' '}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                  Register Here
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

export default Login;
