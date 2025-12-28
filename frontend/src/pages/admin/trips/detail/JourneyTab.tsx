import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Car, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface JourneyLog {
  student_name: string;
  student_email: string;
  scan_time: string | null;
  scanned: boolean;
}

interface CabJourney {
  cab_id: string;
  cab_number: string;
  pickup_region: string;
  capacity: number;
  allocated_count: number;
  outbound_logs: JourneyLog[];
  return_logs: JourneyLog[];
}

export default function JourneyTab() {
  const { tripId } = useParams<{ tripId: string }>();
  const [journeys, setJourneys] = useState<CabJourney[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const response = await tripApi.getTripJourneys(tripId!);
      // if (response.success && response.data) {
      //   setJourneys(response.data);
      // }

      // Mock data for now
      setTimeout(() => {
        setJourneys([
          {
            cab_id: "1",
            cab_number: "WB-06-1234",
            pickup_region: "RK",
            capacity: 7,
            allocated_count: 7,
            outbound_logs: [
              {
                student_name: "John Doe",
                student_email: "john@example.com",
                scan_time: new Date().toISOString(),
                scanned: true,
              },
              {
                student_name: "Jane Smith",
                student_email: "jane@example.com",
                scan_time: new Date().toISOString(),
                scanned: true,
              },
              {
                student_name: "Mike Johnson",
                student_email: "mike@example.com",
                scan_time: null,
                scanned: false,
              },
            ],
            return_logs: [
              {
                student_name: "John Doe",
                student_email: "john@example.com",
                scan_time: new Date().toISOString(),
                scanned: true,
              },
              {
                student_name: "Jane Smith",
                student_email: "jane@example.com",
                scan_time: null,
                scanned: false,
              },
            ],
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching journeys:", error);
      toast.error("Failed to load journey data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Journey Data</h3>
          <p className="text-muted-foreground">
            No QR scans have been recorded yet for this trip.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Journey Tracking</h2>
        <p className="text-muted-foreground mt-1">
          Cab-wise QR scan records for pickup and dropoff
        </p>
      </div>

      {journeys.map((journey) => (
        <Card key={journey.cab_id} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="text-xl font-bold">{journey.cab_number}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Region: {journey.pickup_region}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1">
              {journey.allocated_count} / {journey.capacity} students
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outbound Journey */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Outbound (Pickup)
              </h4>
              <div className="space-y-2">
                {journey.outbound_logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      {log.scanned ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">{log.student_name}</span>
                    </div>
                    {log.scan_time ? (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.scan_time), "HH:mm")}
                      </span>
                    ) : (
                      <span className="text-xs text-red-500">No scan</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Return Journey */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Return (Dropoff)
              </h4>
              <div className="space-y-2">
                {journey.return_logs.length > 0 ? (
                  journey.return_logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {log.scanned ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm">{log.student_name}</span>
                      </div>
                      {log.scan_time ? (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.scan_time), "HH:mm")}
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">No scan</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending return journey
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
