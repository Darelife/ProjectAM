"use client";

import { MotionDiv } from "@/components/ui/motion";
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskService } from "@/services/TaskService";
import { Task } from "@/types/Task";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = await TaskService.getByDate(today);
      setTasks(todayTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await TaskService.create({
          title: newTask.trim(),
          description: "",
          dueDate: today,
          priority: "medium",
          linkedNoteIds: [],
          tags: [],
          calendarDate: today,
          completed: false,
        });
        await loadTasks();
        setNewTask("");
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await TaskService.update(id, { completed: !completed });
      await loadTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskService.delete(id);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks for today</p>
            <p className="text-sm">Add your first task above</p>
          </div>
        ) : (
          tasks.map((task) => (
            <MotionDiv
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group gradient-border p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`p-1 rounded-full transition-colors ${task.completed
                      ? "text-teal-500 hover:text-teal-400"
                      : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <span
                    className={`text-lg ${task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                      }`}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                  {task.priority && (
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </MotionDiv>
          ))
        )}
      </div>
    </MotionDiv>
  );
} 