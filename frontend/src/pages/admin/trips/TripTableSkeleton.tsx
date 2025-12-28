import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TripTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-8 w-[70px]" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Trip Title</TableHead>
              <TableHead>Trip Date</TableHead>
              <TableHead>Booking Window</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[180px]" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-[150px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[40px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-[150px]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Skeleton className="h-4 w-[80px]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
