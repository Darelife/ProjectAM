'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types/Database';
import { TaskService } from '@/services';
import { TaskForm } from '@/components/features/TaskForm';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await TaskService.getAll();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSave = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const updatedTask = await TaskService.update(editingTask.id, taskData);
        if (updatedTask) {
          setTasks(tasks.map(task => 
            task.id === editingTask.id ? updatedTask : task
          ));
        }
      } else {
        const newTask = await TaskService.create(taskData as any);
        setTasks([newTask, ...tasks]);
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.update(id, updates);
      if (updatedTask) {
        setTasks(tasks.map(task => 
          task.id === id ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskDelete = async (id: string) => {
    try {
      await TaskService.delete(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-notion-card rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-notion-card rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-notion-text mb-2">Tasks</h1>
            <p className="text-notion-text-secondary">
              Manage and track your tasks efficiently
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-notion-accent text-white rounded-lg hover:bg-opacity-80 transition-colors"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSave}
      />

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6">
        {(['all', 'pending', 'completed'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption
                ? 'bg-notion-accent text-white'
                : 'text-notion-text-secondary hover:text-notion-text hover:bg-notion-card'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === 'all' && ` (${tasks.length})`}
            {filterOption === 'pending' && ` (${tasks.filter(t => !t.completed).length})`}
            {filterOption === 'completed' && ` (${tasks.filter(t => t.completed).length})`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-notion-text-secondary mb-4">
              {filter === 'all' && 'No tasks found. Create your first task above!'}
              {filter === 'pending' && 'No pending tasks. Great job!'}
              {filter === 'completed' && 'No completed tasks yet.'}
            </div>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-notion-card rounded-lg p-4 border border-notion-border transition-all hover:border-notion-border-hover ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => handleTaskUpdate(task.id, { completed: !task.completed })}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? 'bg-notion-accent border-notion-accent'
                      : 'border-notion-border hover:border-notion-accent'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${
                      task.completed 
                        ? 'text-notion-text-secondary line-through' 
                        : 'text-notion-text'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-900/20 text-red-400 border border-red-800/30'
                        : task.priority === 'medium'
                        ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/30'
                        : 'bg-green-900/20 text-green-400 border border-green-800/30'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`text-sm mb-2 ${
                      task.completed 
                        ? 'text-notion-text-secondary line-through' 
                        : 'text-notion-text-secondary'
                    }`}>
                      {task.description}
                    </p>
                  )}

                  {task.due_date && (
                    <div className="text-xs text-notion-text-secondary">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsFormOpen(true);
                    }}
                    className="p-1 text-notion-text-secondary hover:text-notion-accent transition-colors"
                    title="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleTaskDelete(task.id)}
                    className="p-1 text-notion-text-secondary hover:text-red-400 transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
