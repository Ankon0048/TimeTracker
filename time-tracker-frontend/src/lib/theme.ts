import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily:
      "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "700",
  },
  components: {
    Tooltip: { defaultProps: { withArrow: true, openDelay: 300 } },
    ActionIcon: { defaultProps: { variant: "default" } },
    Modal: { defaultProps: { centered: true, overlayProps: { backgroundOpacity: 0.45, blur: 2 } } },
  },
});
