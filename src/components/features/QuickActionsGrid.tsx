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
  { icon: Inbox, label: "Inbox", href: "/inbox" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function QuickActionsGrid() {
  return (
    <MotionDiv
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {actions.map((action) => (
        <MotionA
          key={action.label}
          href={action.href}
          variants={item}
          className="card-hover p-6 rounded-xl bg-card border border-border/40 flex items-center space-x-4"
        >
          <action.icon className="w-6 h-6 text-primary" />
          <span className="text-lg font-medium">{action.label}</span>
        </MotionA>
      ))}
    </MotionDiv>
  );
} 