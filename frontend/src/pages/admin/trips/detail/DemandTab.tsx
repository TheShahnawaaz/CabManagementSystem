import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Trip } from '@/types/trip.types';
import type { TripDetailStatus } from './utils';

interface DemandTabContext {
  trip: Trip;
  status: TripDetailStatus;
  refreshTrip: () => void;
}

interface StudentDemand {
  id: string;
  name: string;
  email: string;
  booking_id: string;
  created_at: string;
}

interface HallDemand {
  hall: string;
  student_count: number;
  students: StudentDemand[];
}

export default function DemandTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip } = useOutletContext<DemandTabContext>();
  const [demands, setDemands] = useState<HallDemand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemand();
  }, [tripId]);

  const fetchDemand = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const response = await tripApi.getTripDemand(tripId!);
      // if (response.success && response.data) {
      //   setDemands(response.data);
      // }
      
      // Mock data for now
      setTimeout(() => {
        setDemands([
          {
            hall: 'RK',
            student_count: 15,
            students: [
              { id: '1', name: 'John Doe', email: 'john@example.com', booking_id: 'BK001', created_at: new Date().toISOString() },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', booking_id: 'BK002', created_at: new Date().toISOString() },
            ],
          },
          {
            hall: 'PAN',
            student_count: 8,
            students: [
              { id: '3', name: 'Mike Johnson', email: 'mike@example.com', booking_id: 'BK003', created_at: new Date().toISOString() },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Error fetching demand:', error);
      toast.error('Failed to load demand data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (demands.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground">
            No students have booked this trip yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Demand</h2>
          <p className="text-muted-foreground mt-1">
            Hall-wise breakdown of student bookings
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Total: {demands.reduce((sum, d) => sum + d.student_count, 0)} students
        </Badge>
      </div>

      {demands.map((demand) => (
        <Card key={demand.hall} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Hall: {demand.hall}</h3>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {demand.student_count} {demand.student_count === 1 ? 'student' : 'students'}
            </Badge>
          </div>

          <div className="space-y-3">
            {demand.students.map((student, index) => (
              <div
                key={student.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-muted-foreground">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">#{student.booking_id}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

