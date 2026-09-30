import { Paper, Skeleton, Stack } from "@mantine/core";

export function CardSkeleton() {
  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="xs">
        <Skeleton h={20} w="40%" />
        <Skeleton h={14} w="90%" />
        <Skeleton h={14} w="70%" />
      </Stack>
    </Paper>
  );
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Stack>
  );
}
