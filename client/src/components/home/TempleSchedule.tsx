import React, { useState } from "react";
import { Phone, MapPin, Video, X, Clock, CalendarCheck } from 'lucide-react';
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

      {/* Modern Compact Responsive Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 m-0 leading-tight">
                    Daily Temple Schedule
                  </h2>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Sri Sri Radha Rasabihari Aarti & Darshan
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close schedule modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Schedule List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[55vh]">
              {activeSchedules.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100/60 transition-colors"
                >
                  <div className="min-w-[74px] text-center px-2 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs tracking-wider shadow-2xs">
                    {item.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/60">
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2 text-center text-amber-800 text-[11px]">
                <span className="font-semibold">Temple Closed:</span> 13:00 – 16:00 & 21:00 – 04:30 (Next Day)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleSchedule;