"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Calendar, Clock, Coffee, LineChart, Target } from "lucide-react";

const summaries = [
  {
    icon: Calendar,
    label: "Tasks Due Today",
    value: "3 tasks",
    color: "text-green-500",
    gradient: "from-green-500/20 to-green-500/5",
  },
  {
    icon: Clock,
    label: "Focus Time",
    value: "2h 30m",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Target,
    label: "Goals Progress",
    value: "75%",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: Coffee,
    label: "Break Time",
    value: "45m",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-orange-500/5",
  },
];

export function TodaySummary() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Today's Summary</h3>
        <LineChart className="w-5 h-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {summaries.map((summary) => (
          <MotionDiv
            key={summary.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${summary.gradient} border border-border/40`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-background/50 ${summary.color} flex-shrink-0`}>
                <summary.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{summary.label}</p>
                <p className="text-sm font-medium">{summary.value}</p>
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-background/50 border border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Daily Progress</span>
          <span className="text-sm font-medium">75%</span>
        </div>
        <div className="h-2 rounded-full bg-background/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500"
            style={{ width: "75%" }}
          />
        </div>
      </div>
    </MotionDiv>
  );
} 