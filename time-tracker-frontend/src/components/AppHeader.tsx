"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Container, Group, Text, ThemeIcon } from "@mantine/core";
import { Clock } from "lucide-react";
import { RunningTasksPanel } from "@/components/RunningTasksPanel";

export function AppHeader() {
  const pathname = usePathname();
  const onProjects = pathname?.startsWith("/projects");

  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--mantine-color-body)",
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Container fluid px={{ base: "md", sm: "xl" }} py="sm">
        <Group justify="space-between" wrap="nowrap">
          <Link href="/projects" style={{ textDecoration: "none" }}>
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon size="lg" radius="md" variant="light">
                <Clock size={20} />
              </ThemeIcon>
              <Text fw={700} size="lg" c="var(--mantine-color-text)">
                TimeTracker
              </Text>
            </Group>
          </Link>
          <Group gap="sm" wrap="nowrap">
            <Button
              component={Link}
              href="/projects"
              variant={onProjects ? "light" : "subtle"}
              color={onProjects ? "blue" : "gray"}
            >
              Projects
            </Button>
            <RunningTasksPanel />
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
