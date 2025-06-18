"use client";

import { useState, useEffect } from 'react';
import { Task } from '../../types/Task';
import { TopBar } from '../../components/layout/TopBar';
import { MotionDiv } from '../../components/ui/motion';
import { 
  Plus, 
  Target, 
  Clock, 
  Users, 
  Trash2,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown
} from 'lucide-react';

interface QuadrantProps {
  title: string;
  description: string;
  tasks: Task[];
  quadrant: Task['eisenhowerQuadrant'];
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onTaskMove: (taskId: string, newQuadrant: Task['eisenhowerQuadrant']) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

function TaskCard({ 
  task, 
  onToggle, 
  onDelete 
}: { 
  task: Task; 
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  const priorityColors = {
    low: 'border-green-500/30',
    medium: 'border-yellow-500/30',
    high: 'border-red-500/30'
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-lg bg-background/50 border ${priorityColors[task.priority]} card-hover cursor-grab active:cursor-grabbing`}
      drag
      onDragStart={(_event, _info) => {
        // Optionally handle drag start for Framer Motion here
      }}
      onPointerDown={(e) => {
        // Store the task id in a custom data attribute for drop targets
        (e.target as HTMLElement).setAttribute('data-task-id', task.id);
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 transition-colors hover:scale-110"
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground hover:text-primary" />
            )}
          </button>
          
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full bg-current/10 ${
                task.priority === 'high' ? 'text-red-500' :
                task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {task.priority}
              </span>
              
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 hover:bg-background/50 rounded transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </MotionDiv>
  );
}

function Quadrant({ 
  title, 
  description, 
  tasks, 
  quadrant, 
  icon, 
  color, 
  bgColor,
  onTaskMove,
  onTaskToggle,
  onTaskDelete 
}: QuadrantProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && quadrant) {
      onTaskMove(taskId, quadrant);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-enhanced p-6 rounded-xl min-h-[400px] transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-primary/50 bg-primary/5' : bgColor
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${color} bg-current/10`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-3 group">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              Drop tasks here or click + to add
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40">
        <div className="text-xs text-muted-foreground text-center">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>
    </MotionDiv>
  );
}

export default function EisenhowerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newQuadrant: Task['eisenhowerQuadrant']) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eisenhowerQuadrant: newQuadrant })
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task quadrant:', error);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getTasksByQuadrant = (quadrant: Task['eisenhowerQuadrant']) => {
    return tasks.filter(task => task.eisenhowerQuadrant === quadrant);
  };

  const getTasksWithoutQuadrant = () => {
    return tasks.filter(task => !task.eisenhowerQuadrant);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <TopBar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading tasks...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-teal-500" />
              <div>
                <h1 className="text-4xl font-bold gradient-text">Eisenhower Matrix</h1>
                <p className="text-muted-foreground mt-1">
                  Prioritize tasks by urgency and importance
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Drag tasks between quadrants
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-red-500" />
              <span>Urgent + Important</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              <span>Not Urgent + Important</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownRight className="w-4 h-4 text-yellow-500" />
              <span>Urgent + Not Important</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDown className="w-4 h-4 text-gray-500" />
              <span>Neither</span>
            </div>
          </div>
        </MotionDiv>

        {/* Unassigned Tasks */}
        {getTasksWithoutQuadrant().length > 0 && (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-enhanced p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-muted-foreground" />
                Unassigned Tasks
                <span className="text-sm text-muted-foreground font-normal">
                  (Drag to appropriate quadrant)
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getTasksWithoutQuadrant().map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          </MotionDiv>
        )}

        {/* Eisenhower Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Quadrant
            title="Do First"
            description="Urgent and Important"
            tasks={getTasksByQuadrant('do')}
            quadrant="do"
            icon={<ArrowUpRight className="w-5 h-5" />}
            color="text-red-500"
            bgColor="bg-red-500/5 border-red-500/20"
            onTaskMove={handleTaskMove}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
          />

          <Quadrant
            title="Schedule"
            description="Important, Not Urgent"
            tasks={getTasksByQuadrant('schedule')}
            quadrant="schedule"
            icon={<Clock className="w-5 h-5" />}
            color="text-blue-500"
            bgColor="bg-blue-500/5 border-blue-500/20"
            onTaskMove={handleTaskMove}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
          />

          <Quadrant
            title="Delegate"
            description="Urgent, Not Important"
            tasks={getTasksByQuadrant('delegate')}
            quadrant="delegate"
            icon={<Users className="w-5 h-5" />}
            color="text-yellow-500"
            bgColor="bg-yellow-500/5 border-yellow-500/20"
            onTaskMove={handleTaskMove}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
          />

          <Quadrant
            title="Eliminate"
            description="Neither Urgent nor Important"
            tasks={getTasksByQuadrant('delete')}
            quadrant="delete"
            icon={<Trash2 className="w-5 h-5" />}
            color="text-gray-500"
            bgColor="bg-gray-500/5 border-gray-500/20"
            onTaskMove={handleTaskMove}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
          />
        </div>

        {/* Statistics */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-red-500">{getTasksByQuadrant('do').length}</div>
            <div className="text-xs text-muted-foreground">Do First</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-500">{getTasksByQuadrant('schedule').length}</div>
            <div className="text-xs text-muted-foreground">Schedule</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-500">{getTasksByQuadrant('delegate').length}</div>
            <div className="text-xs text-muted-foreground">Delegate</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-gray-500">{getTasksByQuadrant('delete').length}</div>
            <div className="text-xs text-muted-foreground">Eliminate</div>
          </div>
        </MotionDiv>
      </div>
    </main>
  );
}
