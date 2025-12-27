import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, IndianRupee, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { tripApi } from '@/services/trip.service';
import type { Trip } from '@/types/trip.types';
import { getTripDetailStatus, canAccessTab, getDefaultTab } from './utils';

export default function TripDetailLayout() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine current tab from URL
  const currentPath = location.pathname.split('/').pop() || 'demand';
  const currentTab = ['demand', 'journey', 'allocation'].includes(currentPath) ? currentPath : 'demand';

  useEffect(() => {
    if (!tripId) {
      toast.error('Invalid trip ID');
      navigate('/admin/trips');
      return;
    }

    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getTripById(tripId!);
      if (response.success && response.data) {
        setTrip(response.data);
      } else {
        toast.error('Failed to load trip details');
        navigate('/admin/trips');
      }
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip details');
      navigate('/admin/trips');
    } finally {
      setLoading(false);
    }
  };

  // Access control: Check if current tab is allowed
  useEffect(() => {
    if (!trip || loading) return;

    const status = getTripDetailStatus(trip);
    
    // If trip is upcoming, redirect back to trips page
    if (status === 'upcoming') {
      toast.error('Upcoming trips cannot be viewed in detail');
      navigate('/admin/trips');
      return;
    }

    // Check if current tab is accessible
    if (!canAccessTab(currentTab as any, status, trip)) {
      // Redirect to default accessible tab
      const defaultTab = getDefaultTab(status, trip);
      navigate(`/admin/trips/${tripId}/${defaultTab}`, { replace: true });
      toast.info(`This tab is not available for this trip status`);
    }
  }, [trip, currentTab, loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="p-6 mb-6">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </Card>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const status = getTripDetailStatus(trip);
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'active-booking-closed':
        return <Badge className="bg-yellow-500">Active • Booking Closed</Badge>;
      case 'active-booking-open':
        return <Badge className="bg-green-500">Active • Booking Open</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/trips')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Button>
      </div>

      {/* Trip Info Card */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{trip.trip_title}</h1>
            {getStatusBadge()}
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Trip Date</p>
              <p className="font-medium">{format(new Date(trip.trip_date), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="font-medium">{trip.booking_count || 0} students</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">₹{trip.amount_per_person}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Booking Window</p>
              <p className="font-medium text-sm">
                {format(new Date(trip.booking_start_time), 'MMM dd, HH:mm')} -
                {format(new Date(trip.booking_end_time), 'HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {canAccessTab('demand', status, trip) && (
              <TabsTrigger value="demand" asChild>
                <Link to={`/admin/trips/${tripId}/demand`}>📊 Demand</Link>
              </TabsTrigger>
            )}
            {canAccessTab('journey', status, trip) && (
              <TabsTrigger value="journey" asChild>
                <Link to={`/admin/trips/${tripId}/journey`}>🚗 Journey</Link>
              </TabsTrigger>
            )}
            {canAccessTab('allocation', status, trip) && (
              <TabsTrigger value="allocation" asChild>
                <Link to={`/admin/trips/${tripId}/allocation`}>🎯 Allocation</Link>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Outlet context={{ trip, status, refreshTrip: fetchTripDetails }} />
    </div>
  );
}

