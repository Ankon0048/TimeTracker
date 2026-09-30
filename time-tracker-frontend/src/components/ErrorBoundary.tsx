"use client";

import React from "react";
import { Alert, Button, Container, Stack, Text } from "@mantine/core";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Container size="sm" py="xl">
          <Alert color="red" variant="light" title="Something went wrong">
            <Stack gap="md" align="flex-start">
              <Text size="sm">{this.state.error.message}</Text>
              <Button color="red" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
            </Stack>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}
