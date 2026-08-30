import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Lock, ArrowRight, Home } from 'lucide-react';

const adminLoginFormSchema = z.object({
  username: z.string().min(1, { message: 'Username / User ID is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

const AdminLogin = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, user, isPendingLogin } = useAuth();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const getRedirectPath = (u: any) => {
    if (!u) return '/admin';
    if (u.role === 'super_admin') return '/admin';
    const perms: string[] = u.permissions || [];
    if (perms.includes('*') || perms.includes('dashboard.view')) return '/admin';
    if (perms.some(p => p.startsWith('donations'))) return '/admin/donations';
    if (perms.some(p => p.startsWith('chat'))) return '/admin/chat';
    if (perms.some(p => p.startsWith('gallery'))) return '/admin/gallery';
    if (perms.some(p => p.startsWith('events'))) return '/admin/events';
    if (perms.some(p => p.startsWith('videos'))) return '/admin/videos';
    if (perms.some(p => p.startsWith('banners'))) return '/admin/banners';
    if (perms.some(p => p.startsWith('users'))) return '/admin/users';
    return '/admin';
  };

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        setLocation(getRedirectPath(user));
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      const result = await login({
        username: data.username.trim(),
        password: data.password,
      });

      const userRole = result?.user?.role;
      if (userRole !== 'super_admin' && userRole !== 'admin') {
        toast({
          title: "Access Restricted",
          description: "This portal is reserved for authorized administrators only.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin Access Granted",
        description: `Welcome back, ${result.user.name || result.user.username}!`,
      });

      const targetPath = getRedirectPath(result.user);
      setTimeout(() => {
        setLocation(targetPath);
      }, 300);
    } catch (err: any) {
      toast({
        title: "Authentication Failed",
        description: err?.message || "Invalid Admin User ID or Password.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal Sign In - ISKCON Juhu</title>
      </Helmet>

      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-900/60 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-9 h-9 text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in with your administrative credentials
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Username / User ID */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-purple-400" /> User ID / Username
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter admin username" 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 text-sm"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-purple-400" /> Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter admin password" 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 mt-2"
                  disabled={isPendingLogin}
                >
                  {isPendingLogin ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to Admin Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
                <Home className="w-3.5 h-3.5" /> Return to Website Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
