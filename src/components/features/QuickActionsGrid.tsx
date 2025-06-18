"use client";

import { MotionDiv, MotionA } from "@/components/ui/motion";
import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Inbox,
  LineChart,
  PenTool,
} from "lucide-react";

const actions = [
  { icon: FileText, label: "Create Note", href: "/notes" },
  { icon: PenTool, label: "New Diary Entry", href: "/diary" },
  { icon: Calendar, label: "Open Calendar", href: "/calendar" },
  { icon: LineChart, label: "Graph View", href: "/graph" },
  { icon: CheckSquare, label: "Eisenhower Matrix", href: "/eisenhower" },
  { icon: BookOpen, label: "Habit Tracker", href: "/habits" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function QuickActionsGrid() {
  return (
    <MotionDiv
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {actions.map((action) => (
        <MotionA
          key={action.label}
          href={action.href}
          variants={item}
          className="group relative overflow-hidden card-hover p-4 rounded-xl bg-card border border-border/40 flex items-center space-x-3 smooth-hover hover:bg-card/80 min-h-[80px]"
        >
          <div className="relative z-10 flex items-center space-x-3 w-full">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <action.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-sm sm:text-base leading-tight">{action.label}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </MotionA>
      ))}
    </MotionDiv>
  );
} 