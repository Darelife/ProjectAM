"use client";

import { 
  Calendar,
  CheckSquare,
  FileText,
  Home,
  Network,
  Settings,
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    name: "Home",
    href: "/",
    icon: Home
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar
  },
  {
    name: "Notes",
    href: "/notes",
    icon: FileText
  },
  {
    name: "Graph",
    href: "/graph",
    icon: Network
  },
  {
    name: "Habits",
    href: "/habits",
    icon: Target
  },
  {
    name: "Pomodoro",
    href: "/pomodoro",
    icon: Zap
  },
  {
    name: "Diary",
    href: "/diary",
    icon: FileText
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">Project AM</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150
                    ${isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors duration-150"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
