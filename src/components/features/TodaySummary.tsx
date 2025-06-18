"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Calendar, Clock } from "lucide-react";

export function TodaySummary() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-800 rounded-lg"
    >
      <h2 className="text-lg font-medium mb-4">Today's Summary</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>3 tasks due today</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>2 hours of focus time</span>
        </div>
      </div>
    </MotionDiv>
  );
} 