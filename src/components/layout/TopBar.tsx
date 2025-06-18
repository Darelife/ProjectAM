"use client";

import { MotionHeader } from "@/components/ui/motion";
import { Bell, Settings } from "lucide-react";

export function TopBar() {
  return (
    <MotionHeader
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b border-gray-800"
    >
      <h1 className="text-xl font-bold">Project AM</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-800 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </MotionHeader>
  );
} 