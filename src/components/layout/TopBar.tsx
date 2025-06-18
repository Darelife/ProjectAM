"use client";

import { MotionHeader } from "@/components/ui/motion";
import { Bell, Command, Moon, Search, Settings, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";

export function TopBar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <MotionHeader
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-enhanced border-b border-border/40"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold gradient-text">
            Project AM
          </span>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="focus-ring pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border/40 text-sm w-64 smooth-hover hover:border-border/60"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-background/50 rounded-lg smooth-hover focus-ring">
            <Command className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-background/50 rounded-lg smooth-hover focus-ring">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-background/50 rounded-lg smooth-hover focus-ring"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 hover:bg-background/50 rounded-lg smooth-hover focus-ring">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-background/50 rounded-lg smooth-hover focus-ring">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MotionHeader>
  );
} 