"use client";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "@/components/ui/shadcn-io/theme-switcher";

const ThemeSwitcherOption = () => {
  const { theme, setTheme } = useTheme();
  return (
    <ThemeSwitcher
      onChange={setTheme}
      value={theme as "light" | "dark" | "system"}
    />
  );
};
export default ThemeSwitcherOption;
