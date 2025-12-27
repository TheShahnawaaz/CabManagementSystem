import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { allocationApi } from '@/services/allocation.service';
import { VehicleSeatSelector } from './allocation/VehicleSeatSelector';
import type { CabAllocation, AssignedStudent, SeatPosition, Hall } from '@/types/allocation.types';

const HALLS = ['RK', 'VS', 'MS', 'HJB', 'LLR', 'LBS', 'PAN'] as const;

interface CabFormData {
  temp_id: string;
  cab_number: string;
  cab_type: string;
  driver_name: string;
  driver_phone: string;
  pickup_region: Hall;
  passkey: string;
  seats: {
    F1: string | null;
    M1: string | null;
    M2: string | null;
    M3: string | null;
    B1: string | null;
    B2: string | null;
    B3: string | null;
  };
}

export default function AllocationEditPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState<AssignedStudent[]>([]);
  const [cabs, setCabs] = useState<CabFormData[]>([]);
  const [cabToDelete, setCabToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have suggested allocation from navigation state
    const suggestedAllocation = (location.state as { suggestedAllocation?: { cabs: CabAllocation[] } })?.suggestedAllocation;
    
    if (suggestedAllocation) {
      // Use suggested allocation
      convertToEditFormat(suggestedAllocation.cabs || []);
      setLoading(false);
    } else {
      // Load existing allocation from DB
      loadAllocationData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const loadAllocationData = async () => {
    try {
      setLoading(true);
      const response = await allocationApi.getAllocation(tripId!);
      
      if (response.success && response.data) {
        if (response.data.has_allocation) {
          // Convert existing allocation to edit format
          convertToEditFormat(response.data.cabs || []);
        } else {
          // No allocation yet, redirect to run it first
          toast.error('No allocation found. Please run allocation first.');
          navigate(`/admin/trips/${tripId}/allocation`);
        }
      }
    } catch (error) {
      console.error('Error loading allocation:', error);
      toast.error('Failed to load allocation');
      navigate(`/admin/trips/${tripId}/allocation`);
    } finally {
      setLoading(false);
    }
  };

  const convertToEditFormat = (cabData: CabAllocation[]) => {
    // Extract all unique students
    const students: AssignedStudent[] = [];
    cabData.forEach(cab => {
      cab.assigned_students.forEach(student => {
        if (!students.find(s => s.user_id === student.user_id)) {
          students.push(student);
        }
      });
    });
    setAllStudents(students);

    // Convert cabs to form format
    const formattedCabs: CabFormData[] = cabData.map((cab, index) => {
      const seats: {
        F1: string | null;
        M1: string | null;
        M2: string | null;
        M3: string | null;
        B1: string | null;
        B2: string | null;
        B3: string | null;
      } = {
        F1: null,
        M1: null,
        M2: null,
        M3: null,
        B1: null,
        B2: null,
        B3: null,
      };

      // Map assigned students to seats
      cab.assigned_students.forEach((student, idx) => {
        const seatKeys: Array<'F1' | 'M1' | 'M2' | 'M3' | 'B1' | 'B2' | 'B3'> = ['F1', 'M1', 'M2', 'M3', 'B1', 'B2', 'B3'];
        if (idx < seatKeys.length) {
          seats[seatKeys[idx]] = student.user_id;
        }
      });

      return {
        temp_id: cab.id || cab.temp_id || `cab_${index + 1}`,
        cab_number: cab.cab_number,
        cab_type: cab.cab_type || 'Omni',
        driver_name: cab.driver_name,
        driver_phone: cab.driver_phone || '',
        pickup_region: cab.pickup_region,
        passkey: cab.passkey,
        seats,
      };
    });

    setCabs(formattedCabs);
  };

  const handleAddCab = () => {
    const newCab: CabFormData = {
      temp_id: `cab_${Date.now()}`,
      cab_number: '',
      cab_type: 'omni',
      driver_name: '',
      driver_phone: '',
      pickup_region: 'RK',
      passkey: Math.floor(1000 + Math.random() * 9000).toString(),
      seats: { F1: null, M1: null, M2: null, M3: null, B1: null, B2: null, B3: null },
    };
    setCabs([...cabs, newCab]);
    toast.success('New cab added');
  };

  const handleRemoveCab = (tempId: string) => {
    setCabs(cabs.filter(c => c.temp_id !== tempId));
    setCabToDelete(null);
    toast.success('Cab removed');
  };

  const handleCabFieldChange = (tempId: string, field: keyof CabFormData, value: string) => {
    setCabs(cabs.map(cab => 
      cab.temp_id === tempId ? { ...cab, [field]: value } : cab
    ));
  };

  const handleSeatChange = (cabId: string, seatId: SeatPosition, userId: string | null) => {
    setCabs(cabs.map(cab => 
      cab.temp_id === cabId 
        ? { ...cab, seats: { ...cab.seats, [seatId]: userId } }
        : cab
    ));
  };

  const getAvailableStudentsForCab = (cabId: string): AssignedStudent[] => {
    // Get all students assigned in other cabs
    const assignedInOtherCabs = cabs
      .filter(c => c.temp_id !== cabId)
      .flatMap(c => Object.values(c.seats))
      .filter(Boolean) as string[];

    return allStudents.filter(s => !assignedInOtherCabs.includes(s.user_id));
  };

  const handleSubmit = async () => {
    // Validation
    for (const cab of cabs) {
      if (!cab.cab_number.trim()) {
        toast.error('All cabs must have a number');
        return;
      }
      if (!cab.driver_name.trim()) {
        toast.error('All cabs must have a driver name');
        return;
      }
      if (!cab.driver_phone.trim()) {
        toast.error('All cabs must have a driver phone number');
        return;
      }
      if (!cab.cab_type.trim()) {
        toast.error('All cabs must have a cab type');
        return;
      }
    }

    // Convert to API format
    const apiCabs: CabAllocation[] = cabs.map(cab => ({
      temp_id: cab.temp_id,
      pickup_region: cab.pickup_region,
      capacity: 7,
      cab_number: cab.cab_number,
      cab_type: cab.cab_type,
      driver_name: cab.driver_name,
      driver_phone: cab.driver_phone,
      passkey: cab.passkey,
      assigned_students: Object.entries(cab.seats)
        .filter(([, userId]) => userId !== null)
        .map(([seatId, userId]) => {
          const student = allStudents.find(s => s.user_id === userId);
          if (!student) {
            console.error(`Student not found for userId: ${userId}`);
            return null;
          }
          return {
            user_id: student.user_id,
            booking_id: student.booking_id,
            name: student.name,
            email: student.email,
            profile_picture: student.profile_picture,
            hall: student.hall,
            seat_position: seatId, // Use actual seat ID (F1, M1, etc.)
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null),
    }));

    try {
      setSubmitting(true);
      const response = await allocationApi.submitAllocation(tripId!, { cabs: apiCabs });
      
      if (response.success) {
        toast.success('Allocation saved successfully!');
        navigate(`/admin/trips/${tripId}/allocation`);
      }
    } catch (error) {
      console.error('Error submitting allocation:', error);
      const message = error instanceof Error ? error.message : 'Failed to save allocation';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="p-4 sm:p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  const assignedCount = cabs.reduce((sum, cab) => 
    sum + Object.values(cab.seats).filter(Boolean).length, 0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/trips/${tripId}/allocation`)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Allocation
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Allocation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cabs.length} cabs • {assignedCount}/{allStudents.length} students assigned
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCab}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Cab
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : 'Save Allocation'}
          </Button>
        </div>
      </div>

      {/* Cabs */}
      <div className="space-y-6">
        {cabs.map((cab, index) => (
          <Card key={cab.temp_id} className="overflow-hidden">
            {/* Header */}
            <div className="bg-muted/50 px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  Cab {index + 1}
                  {cab.cab_number && (
                    <span className="text-sm sm:text-base font-mono text-muted-foreground">
                      • {cab.cab_number}
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {Object.values(cab.seats).filter(Boolean).length}/7 seats filled
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCabToDelete(cab.temp_id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 lg:gap-8">
                {/* Left: Form Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`cab_number_${cab.temp_id}`} className="text-sm font-medium">
                        Cab Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`cab_number_${cab.temp_id}`}
                        placeholder="WB-06-1234"
                        value={cab.cab_number}
                        onChange={(e) => handleCabFieldChange(cab.temp_id, 'cab_number', e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`cab_type_${cab.temp_id}`} className="text-sm font-medium">
                        Cab Type
                      </Label>
                      <Select
                        value={cab.cab_type}
                        onValueChange={(value) => handleCabFieldChange(cab.temp_id, 'cab_type', value)}
                      >
                        <SelectTrigger id={`cab_type_${cab.temp_id}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="omni">Omni</SelectItem>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="tempo">Tempo Traveller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`driver_name_${cab.temp_id}`} className="text-sm font-medium">
                      Driver Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`driver_name_${cab.temp_id}`}
                      placeholder="John Doe"
                      value={cab.driver_name}
                      onChange={(e) => handleCabFieldChange(cab.temp_id, 'driver_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`driver_phone_${cab.temp_id}`} className="text-sm font-medium">
                      Driver Phone
                    </Label>
                    <Input
                      id={`driver_phone_${cab.temp_id}`}
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={cab.driver_phone}
                      onChange={(e) => handleCabFieldChange(cab.temp_id, 'driver_phone', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`pickup_region_${cab.temp_id}`} className="text-sm font-medium">
                        Pickup Region
                      </Label>
                      <Select
                        value={cab.pickup_region}
                        onValueChange={(value) => handleCabFieldChange(cab.temp_id, 'pickup_region', value)}
                      >
                        <SelectTrigger id={`pickup_region_${cab.temp_id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HALLS.map(hall => (
                            <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`passkey_${cab.temp_id}`} className="text-sm font-medium">
                        Passkey
                      </Label>
                      <Input
                        id={`passkey_${cab.temp_id}`}
                        value={cab.passkey}
                        readOnly
                        className="font-mono bg-muted/50 border-dashed"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block">
                  <Separator orientation="vertical" className="h-full" />
                </div>
                <div className="lg:hidden">
                  <Separator orientation="horizontal" />
                </div>

                {/* Right: Vehicle Seat Selector */}
                <div className="flex items-center justify-center lg:justify-start">
                  <VehicleSeatSelector
                    seats={cab.seats}
                    availableStudents={getAvailableStudentsForCab(cab.temp_id)}
                    onSeatChange={(seatId, userId) => handleSeatChange(cab.temp_id, seatId, userId)}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Cab Dialog */}
      <AlertDialog open={!!cabToDelete} onOpenChange={() => setCabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Cab?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unassign all students from this cab. They can be reassigned to other cabs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cabToDelete && handleRemoveCab(cabToDelete)}
              className="bg-destructive"
            >
              Remove Cab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

