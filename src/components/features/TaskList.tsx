"use client";

import { MotionDiv } from "@/components/ui/motion";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Complete project proposal", completed: false },
    { id: "2", text: "Review pull requests", completed: true },
    { id: "3", text: "Update documentation", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), text: newTask.trim(), completed: false },
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="input-focus flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={addTask}
          className="button-primary p-3 rounded-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <MotionDiv
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group gradient-border p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`p-1 rounded-full transition-colors ${task.completed
                    ? "text-green-500 hover:text-green-400"
                    : "text-muted-foreground hover:text-primary"
                  }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <span
                className={`flex-1 text-lg ${task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                  }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </MotionDiv>
        ))}
      </div>
    </MotionDiv>
  );
} 