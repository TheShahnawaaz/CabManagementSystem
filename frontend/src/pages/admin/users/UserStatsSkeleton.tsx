import { StatCard, StatCardGrid } from "@/components/ui/stat-card";

export function UserStatsSkeleton() {
  return (
    <StatCardGrid columns={4} className="mb-6">
      {[...Array(4)].map((_, i) => (
        <StatCard
          key={i}
          value={0}
          label="Loading..."
          loading
          variant="stacked"
          description="Loading..."
        />
      ))}
    </StatCardGrid>
  );
}
