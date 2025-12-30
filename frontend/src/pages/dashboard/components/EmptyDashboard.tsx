/**
 * Empty Dashboard State
 *
 * Shown when user has no bookings yet
 */

import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyDashboard() {
  return (
    <div className="space-y-6">
      {/* Empty Next Trip Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next Trip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Upcoming Trips</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any trips scheduled yet
            </p>
            <Button asChild>
              <Link to="/trips">
                Browse Available Trips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty Quick Actions still visible */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Get Started</h2>
        <p className="text-muted-foreground mb-4">
          Book your first Friday prayer trip to see your dashboard come to life!
        </p>
      </div>
    </div>
  );
}
