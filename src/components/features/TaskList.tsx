"use client";

import { CheckCircle2, Circle, Plus, Trash2, Calendar, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskService } from "@/services";
import { Database } from "@/types/Database";
import Link from "next/link";

type Task = Database['public']['Tables']['tasks']['Row'];

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
          due_date: today,
          priority: "medium",
          linked_note_ids: [],
          tags: [],
          calendar_date: today,
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

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-6">
      {/* Add new task */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="input-field flex-1"
        />
        <button
          onClick={addTask}
          disabled={!newTask.trim()}
          className="btn-clean px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No tasks for today</p>
          <p className="text-sm">Add your first task above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Pending ({pendingTasks.length})
              </h4>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 p-3 rounded-lg hover-subtle"
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground truncate">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {task.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Completed ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 p-3 rounded-lg hover-subtle opacity-75"
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className="text-green-500 hover:text-green-400 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-muted-foreground line-through truncate">
                        {task.title}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View all tasks link */}
          <div className="pt-4 border-t border-border">
            <Link 
              href="/tasks"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all tasks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 