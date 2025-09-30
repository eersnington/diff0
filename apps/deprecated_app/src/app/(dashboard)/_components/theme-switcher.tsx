import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@d0/ui/components/ui/select";
import { cn } from "@d0/ui/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeIcon({ theme }: { theme?: string }) {
  if (theme === "light") {
    return <Sun className="h-[14px] w-[14px]" />;
  }
  if (theme === "dark") {
    return <Moon className="h-[14px] w-[14px]" />;
  }
  return <Monitor className="h-[14px] w-[14px]" />;
}

function ThemeLabel({ theme }: { theme?: string }) {
  if (!theme) {
    return null;
  }
  return (
    <span className="font-medium text-xs">
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </span>
  );
}

export function ThemeSwitcher({ triggerClass }: { triggerClass?: string }) {
  const { theme: currentTheme, setTheme, themes } = useTheme();
  return (
    <Select
      onValueChange={(theme) => setTheme(theme as (typeof themes)[number])}
      value={currentTheme}
    >
      <SelectTrigger
        className={cn(
          "!px-2 h-6 rounded border-primary/20 bg-secondary hover:border-primary/40",
          triggerClass
        )}
      >
        <div className="flex items-start gap-2">
          <ThemeIcon theme={currentTheme} />
          <ThemeLabel theme={currentTheme} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem
            className={`font-medium text-primary/60 text-sm ${
              theme === currentTheme && "text-primary"
            }`}
            key={theme}
            value={theme}
          >
            {theme && theme.charAt(0).toUpperCase() + theme.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ThemeSwitcherHome() {
  const { setTheme, themes } = useTheme();

  const renderIcon = (theme: string) => {
    if (theme === "light") {
      return <Sun className="h-4 w-4 text-primary/80 hover:text-primary" />;
    }
    if (theme === "dark") {
      return <Moon className="h-4 w-4 text-primary/80 hover:text-primary" />;
    }
    return <Monitor className="h-4 w-4 text-primary/80 hover:text-primary" />;
  };

  return (
    <div className="flex gap-3">
      {themes.map((theme) => (
        <button
          key={theme}
          name="theme"
          onClick={() => setTheme(theme)}
          type="button"
        >
          {renderIcon(theme)}
        </button>
      ))}
    </div>
  );
}
