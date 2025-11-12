import React, { useState } from "react";
import { Phone, MapPin, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Schedule } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const TempleSchedule: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  // Add/remove body class when modal opens/closes
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
  });

  const activeSchedules = schedules
    .filter(schedule => schedule.isActive)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  if (isLoading) {
    return (
      <div className="temple-schedule-container">
        <Skeleton className="h-12 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="temple-action-buttons">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-10 w-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="temple-schedule-container">
      <div className="temple-schedule-header">
        <h1 onClick={() => setModalOpen(true)} style={{ cursor: "pointer" }}>
          View Temple Schedule
        </h1>
      </div>

      <p className="temple-closed-times">
        Closed from 13:00 - 16:00 and 21:00 - 04:30 (Next day)
      </p>

      <div className="temple-action-buttons">
        <button
          onClick={() => window.location.href = "tel:+912226206860"}
          className="temple-button"
        >
          <Phone size={14} className="icon" />
          <span className="label">Call Us</span>
        </button>

        <button
          onClick={() => window.open("https://www.google.com/maps/place/International+Society+for+Krishna+Consciousness%C2%AE+(ISKCON%C2%AE+-+Juhu)/@19.113016,72.8243873,17z/data=!3m1!4b1!4m5!3m4!1s0x3be7c9e83c34362f:0x6d7c69d4f830e48!8m2!3d19.113016!4d72.826576?hl=en-US", "_blank")}
          className="temple-button"
        >
          <MapPin size={14} className="icon" />
          <span className="label">Navigation</span>
        </button>

        <button
          onClick={() => window.open("https://youtube.com/@iskconstreaming", "_blank")}
          className="temple-button"
        >
          <Video size={14} className="icon" />
          <span className="label">Watch Live</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Temple Schedule</h2>

            <div className="temple-schedule-columns">
              {activeSchedules.map((item) => (
                <div key={item.id} className="temple-schedule-item">
                  <div className="temple-schedule-time">{item.time}</div>
                  <div className="temple-schedule-details">
                    <div className="temple-schedule-title">{item.title}</div>
                    <div className="temple-schedule-description">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="close-button" onClick={() => setModalOpen(false)}>
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleSchedule;