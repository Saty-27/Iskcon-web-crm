import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { SocialLink } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  subject: z.string(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ['/api/social-links'],
  });
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: '',
    },
  });
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest('/api/contact', 'POST', data);
      
      toast({
        title: "Message Sent",
        description: "Thank you! We'll get back to you soon.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="py-16 relative" style={{ backgroundColor: 'rgb(255, 45, 85)' }}>
      {/* Decorative dots - top left */}
      <div className="absolute top-8 left-8 text-white opacity-60">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>
      
      {/* Decorative dots - top right */}
      <div className="absolute top-8 right-8 text-white opacity-60">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-white">
              Get in Touch
            </h2>
            <p className="font-opensans text-lg text-white mb-6">
              We'd love to hear from you. Reach out for inquiries, spiritual guidance, 
              or to participate in our services.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="text-2xl mr-4 text-white">
                  <i className="ri-map-pin-2-fill"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-lg mb-1 text-white">Address</h4>
                  <p className="font-opensans text-white">
                    Hare Krishna Land, Juhu, Mumbai, Maharashtra 400049, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-4 text-white">
                  <i className="ri-phone-fill"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-lg mb-1 text-white">Phone</h4>
                  <p className="font-opensans text-white">+91 22 2620 0072</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-4 text-white">
                  <i className="ri-mail-fill"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-lg mb-1 text-white">Email</h4>
                  <p className="font-opensans text-white">info@iskconjuhu.in</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-4 text-white">
                  <i className="ri-time-fill"></i>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-lg mb-1 text-white">Temple Hours</h4>
                  <p className="font-opensans text-white">Daily: 4:30 AM - 9:00 PM<br/>Special timings during festivals</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-poppins font-semibold text-lg mb-3 text-white">Connect With Us</h4>
              <div className="flex space-x-4">
                {socialLinks.filter(link => link.isActive).map((link) => (
                  <a 
                    key={link.id}
                    href={link.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
                    style={{ backgroundColor: '#4B0082', color: 'white' }}
                  >
                    {link.icon && link.icon.startsWith('/uploads/') ? (
                      <img 
                        src={link.icon} 
                        alt={`${link.platform} icon`} 
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <i className={`${link.icon || 'ri-link'} text-lg`}></i>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
            <h3 className="font-poppins font-semibold text-xl mb-6" style={{ color: '#4B0082' }}>Send us a Message</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark font-medium">Your Name</FormLabel>
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
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark font-medium">Subject</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="donation">Donation Related</SelectItem>
                          <SelectItem value="event">Event Information</SelectItem>
                          <SelectItem value="volunteer">Volunteering</SelectItem>
                          <SelectItem value="spiritual">Spiritual Guidance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark font-medium">Your Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your message here..." 
                          {...field}
                          rows={4}
                          className="focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full text-white font-poppins font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                  style={{ backgroundColor: '#4B0082' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
