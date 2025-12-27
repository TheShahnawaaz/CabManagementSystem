import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Car, Plus, Users, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Trip } from '@/types/trip.types';
import type { TripDetailStatus } from './utils';

interface AllocationTabContext {
  trip: Trip;
  status: TripDetailStatus;
  refreshTrip: () => void;
}

interface HallDemandSummary {
  hall: string;
  student_count: number;
  cabs_needed: number;
}

interface CabAllocation {
  cab_id: string;
  cab_number: string;
  pickup_region: string;
  capacity: number;
  allocated_count: number;
  students: Array<{ id: string; name: string; email: string }>;
}

export default function AllocationTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trip, refreshTrip } = useOutletContext<AllocationTabContext>();
  const [demandSummary, setDemandSummary] = useState<HallDemandSummary[]>([]);
  const [allocations, setAllocations] = useState<CabAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchAllocationData();
  }, [tripId]);

  const fetchAllocationData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls
      // const response = await tripApi.getAllocationData(tripId!);
      // if (response.success && response.data) {
      //   setDemandSummary(response.data.demand_summary);
      //   setAllocations(response.data.allocations);
      // }

      // Mock data for now
      setTimeout(() => {
        setDemandSummary([
          { hall: 'RK', student_count: 15, cabs_needed: 3 },
          { hall: 'PAN', student_count: 8, cabs_needed: 2 },
          { hall: 'LBS', student_count: 20, cabs_needed: 3 },
          { hall: 'VS', student_count: 10, cabs_needed: 2 },
        ]);
        setAllocations([
          {
            cab_id: '1',
            cab_number: 'WB-06-1234',
            pickup_region: 'RK',
            capacity: 7,
            allocated_count: 7,
            students: [
              { id: '1', name: 'John Doe', email: 'john@example.com' },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error('Error fetching allocation data:', error);
      toast.error('Failed to load allocation data');
      setLoading(false);
    }
  };

  const handleRunAllocation = async () => {
    try {
      setAllocating(true);
      // TODO: Implement API call
      // const response = await tripApi.runAllocation(tripId!);
      // if (response.success) {
      //   toast.success('Allocation completed successfully!');
      //   fetchAllocationData();
      //   refreshTrip();
      // }

      // Mock success
      setTimeout(() => {
        toast.success('Allocation algorithm executed successfully!');
        setAllocating(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error running allocation:', error);
      toast.error('Failed to run allocation');
      setAllocating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  const totalCabsNeeded = demandSummary.reduce((sum, d) => sum + d.cabs_needed, 0);
  const totalCabsAdded = allocations.length;
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_count, 0);
  const totalStudents = demandSummary.reduce((sum, d) => sum + d.student_count, 0);

  return (
    <div className="space-y-6">
      {/* Demand Summary */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Demand Summary</h2>
            <p className="text-muted-foreground mt-1">
              Hall-wise cab requirements based on student bookings
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {totalCabsNeeded} cabs needed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {demandSummary.map((demand) => (
            <Card key={demand.hall} className="p-4 border-2">
              <h3 className="font-bold text-lg mb-2">Hall: {demand.hall}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium">{demand.student_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cabs Needed:</span>
                  <span className="font-bold text-blue-500">{demand.cabs_needed}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Allocation Actions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Cab Allocation</h2>
            <p className="text-muted-foreground mt-1">
              {totalCabsAdded === 0
                ? 'Add cabs and run allocation algorithm'
                : `${totalCabsAdded} cabs added • ${totalAllocated}/${totalStudents} students allocated`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Cab
            </Button>
            <Button size="lg" onClick={handleRunAllocation} disabled={allocating}>
              <Wand2 className="w-4 h-4 mr-2" />
              {allocating ? 'Running...' : 'Auto Allocate'}
            </Button>
          </div>
        </div>

        {allocations.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Cabs Added Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add cabs manually or let the system allocate automatically
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add First Cab
              </Button>
              <Button onClick={handleRunAllocation} disabled={allocating}>
                <Wand2 className="w-4 h-4 mr-2" />
                Auto Allocate Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((allocation) => (
              <Card key={allocation.cab_id} className="p-4 border-2">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-bold text-lg">{allocation.cab_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        Region: {allocation.pickup_region}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={allocation.allocated_count === allocation.capacity ? 'default' : 'secondary'}
                    >
                      {allocation.allocated_count} / {allocation.capacity} seats
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View Students
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Student List Preview */}
                {allocation.students.length > 0 && (
                  <div className="mt-3 p-3 bg-muted/50 rounded border">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Allocated Students ({allocation.allocated_count})
                    </p>
                    <div className="space-y-1">
                      {allocation.students.slice(0, 2).map((student) => (
                        <p key={student.id} className="text-sm text-muted-foreground">
                          • {student.name}
                        </p>
                      ))}
                      {allocation.allocated_count > 2 && (
                        <p className="text-sm text-muted-foreground italic">
                          + {allocation.allocated_count - 2} more...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

