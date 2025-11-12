import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Calendar, Users, DollarSign } from 'lucide-react';
import AdminLayout from "@/components/admin/Layout";
import EventModal from './EventModal';
import type { Event } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const EventsAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/events/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Success', description: 'Event deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    },
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">Loading events...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Event Management</h1>
            <p className="text-muted-foreground">
              Create and manage comprehensive donation events with full control
            </p>
          </div>
          <Button onClick={handleCreateEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Created</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Start by creating your first comprehensive donation event with predefined cards, 
                  custom donation options, and payment details.
                </p>
                <Button onClick={handleCreateEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge variant={event.isActive ? "default" : "secondary"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleteEventMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {event.customDonationEnabled ? "Custom donations enabled" : "Fixed amounts only"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {event.suggestedAmounts && event.suggestedAmounts.length > 0 
                          ? `${event.suggestedAmounts.length} suggested amounts`
                          : "No suggested amounts"
                        }
                      </span>
                    </div>
                  </div>
                  
                  {event.suggestedAmounts && event.suggestedAmounts.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Suggested Amounts:</div>
                      <div className="flex flex-wrap gap-2">
                        {event.suggestedAmounts.map((amount, index) => (
                          <Badge key={index} variant="outline">
                            ₹{amount.toLocaleString()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.readMoreUrl && (
                    <div className="mt-4">
                      <a 
                        href={event.readMoreUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Read more about this event →
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={editingEvent}
        />
      </div>
    </AdminLayout>
  );
};

export default EventsAdmin;