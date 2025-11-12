import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { Stat } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface StatBoxProps {
  value: number;
  suffix: string;
  label: string;
}

const StatBox: React.FC<StatBoxProps> = ({ value, suffix, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000; // Duration of animation in milliseconds
    const stepTime = duration / end;

    const timer = setInterval(() => {
      start += 1;
      if (start > end) {
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="stat-box">
      <h1 className="stat-value" style={{ fontSize: '50px' }}>
        {count} {suffix}
      </h1>
      <p className="stat-label">{label}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { data: stats = [], isLoading } = useQuery<Stat[]>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="stats-container">
        {[1, 2, 3].map((index) => (
          <div key={index} className="stat-box">
            <Skeleton className="h-16 w-32 mb-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="stats-container">
      {stats
        .filter(stat => stat.isActive)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((stat) => (
          <StatBox
            key={stat.id}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
    </div>
  );
};

export default StatsSection;