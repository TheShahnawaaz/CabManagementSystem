import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { formatPhoneNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { tripApi } from '@/services/trip.service';
import type { HallDemand } from '@/types/trip.types';

export default function DemandTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const [demands, setDemands] = useState<HallDemand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDemand = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getTripDemand(tripId!);
      if (response.success && response.data) {
        setDemands(response.data);
      }
    } catch (error) {
      console.error('Error fetching demand:', error);
      toast.error('Failed to load demand data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

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

      <Tabs defaultValue={demands[0]?.hall} className="w-full">
        <TabsList>
          {demands.map((demand) => (
            <TabsTrigger key={demand.hall} value={demand.hall}>
              {demand.hall} ({demand.student_count})
            </TabsTrigger>
          ))}
        </TabsList>

        {demands.map((demand) => (
          <TabsContent key={demand.hall} value={demand.hall} className="mt-6">
            <ItemGroup className="rounded-lg border">
              {demand.students.map((student, index) => (
                <div key={student.id}>
                  <Item className="p-4">
                    <ItemMedia>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.profile_picture || undefined} />
                        <AvatarFallback className="text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent className="gap-0.5">
                      <ItemTitle className="text-base font-semibold">
                        {student.name}
                      </ItemTitle>
                      <ItemDescription className="text-sm">
                        {student.email}
                      </ItemDescription>
                      <ItemDescription className="text-sm flex items-center gap-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{formatPhoneNumber(student.phone_number)}</span>
                      </ItemDescription>
                      <ItemDescription className="text-xs mt-1 text-muted-foreground">
                        Booked: {format(new Date(student.created_at), 'dd MMM yyyy, HH:mm')}
                      </ItemDescription>
                    </ItemContent>
                    <ItemContent className="flex-none items-end">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{student.booking_id}
                      </Badge>
                    </ItemContent>
                  </Item>
                  {index !== demand.students.length - 1 && <ItemSeparator />}
                </div>
              ))}
            </ItemGroup>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
