"use client";

import { MotionDiv } from "@/components/ui/motion";
import { BarChart, Clock, Target, TrendingUp } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  color: string;
}

export function FocusStats() {
  const stats: Stat[] = [
    {
      label: "Focus Time",
      value: "4h 30m",
      icon: <Clock className="w-5 h-5" />,
      change: "+15%",
      color: "text-blue-500",
    },
    {
      label: "Tasks Completed",
      value: "12/15",
      icon: <Target className="w-5 h-5" />,
      change: "+20%",
      color: "text-green-500",
    },
    {
      label: "Productivity Score",
      value: "85%",
      icon: <TrendingUp className="w-5 h-5" />,
      change: "+5%",
      color: "text-purple-500",
    },
  ];

  const weeklyData = [
    { day: "Mon", value: 75 },
    { day: "Tue", value: 85 },
    { day: "Wed", value: 65 },
    { day: "Thu", value: 90 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 70 },
    { day: "Sun", value: 60 },
  ];

  const maxValue = Math.max(...weeklyData.map((d) => d.value));

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Focus Stats</h3>
        <BarChart className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-background/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className={`text-sm ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Weekly Progress</div>
        <div className="flex items-end justify-between h-24">
          {weeklyData.map((data) => (
            <div key={data.day} className="flex flex-col items-center">
              <div
                className="w-8 rounded-t-lg bg-primary/20"
                style={{
                  height: `${(data.value / maxValue) * 100}%`,
                }}
              />
              <span className="text-xs text-muted-foreground mt-2">
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MotionDiv>
  );
} 