"use client";

import { useState, useEffect } from 'react';
import { Task } from '../../types/Task';
import { TopBar } from '../../components/layout/TopBar';
import { MotionDiv } from '../../components/ui/motion';
import { TaskForm } from '../../components/features/TaskForm';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

function CalendarDay({ 
  day, 
  onDayClick, 
  selectedDate 
}: { 
  day: CalendarDay; 
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}) {
  const isSelected = selectedDate && 
    day.date.toDateString() === selectedDate.toDateString();
  
  const completedTasks = day.tasks.filter(t => t.completed).length;
  const totalTasks = day.tasks.length;
  const hasHighPriority = day.tasks.some(t => t.priority === 'high' && !t.completed);
  
  return (
    <button
      onClick={() => onDayClick(day.date)}
      className={`
        p-2 min-h-[80px] rounded-lg border transition-all duration-200 hover:scale-105
        ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'}
        ${day.isToday ? 'ring-2 ring-teal-500 bg-teal-500/10' : ''}
        ${isSelected ? 'bg-primary/20 border-primary' : 'border-border/40 hover:border-border/60'}
        ${totalTasks > 0 ? 'bg-background/80' : 'bg-background/40'}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${day.isToday ? 'text-teal-500' : ''}`}>
            {day.date.getDate()}
          </span>
          {hasHighPriority && (
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          )}
        </div>
        
        {totalTasks > 0 && (
          <div className="flex-1 flex flex-col justify-end">
            <div className="space-y-1">
              {day.tasks.slice(0, 2).map((task, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-1 rounded truncate ${
                    task.completed 
                      ? 'bg-green-500/20 text-green-600 line-through' 
                      : task.priority === 'high'
                      ? 'bg-red-500/20 text-red-600'
                      : task.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  {task.title}
                </div>
              ))}
              {totalTasks > 2 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{totalTasks - 2} more
                </div>
              )}
            </div>
            
            {totalTasks > 0 && (
              <div className="mt-1 text-xs text-muted-foreground text-center">
                {completedTasks}/{totalTasks}
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function TaskSidebar({ 
  selectedDate, 
  tasks, 
  onTaskToggle, 
  onTaskDelete,
  onCreateTask
}: {
  selectedDate: Date | null;
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onCreateTask: () => void;
}) {
  if (!selectedDate) {
    return (
      <div className="glass-enhanced p-6 rounded-xl">
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
          <p className="text-muted-foreground text-sm">
            Click on a date to view and manage tasks
          </p>
        </div>
      </div>
    );
  }

  const dayTasks = tasks.filter(task => {
    if (!task.calendarDate && !task.dueDate) return false;
    const taskDate = new Date(task.calendarDate || task.dueDate!);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="glass-enhanced p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={onCreateTask}
          className="button-primary p-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {dayTasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No tasks for this day</p>
            <button 
              onClick={onCreateTask}
              className="button-primary px-4 py-2 rounded-lg mt-3 text-sm"
            >
              Add Task
            </button>
          </div>
        ) : (
          dayTasks.map((task) => (
            <MotionDiv
              key={task.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg border card-hover ${
                task.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                task.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                'border-green-500/30 bg-green-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className="mt-0.5 transition-colors hover:scale-110"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                      'bg-green-500/20 text-green-600'
                    }`}>
                      {task.priority}
                    </span>
                    
                    {task.eisenhowerQuadrant && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                        {task.eisenhowerQuadrant}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </MotionDiv>
          ))
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

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

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editing) {
        // Update existing task
        await fetch(`/api/tasks/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } else {
        // Create new task
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      }
      
      fetchTasks();
      setShowCreateModal(false);
      setEditing(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditing(null);
  };

  const handleCreateTask = () => {
    setEditing(null);
    setShowCreateModal(true);
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayTasks = tasks.filter(task => {
        if (!task.calendarDate && !task.dueDate) return false;
        const taskDate = new Date(task.calendarDate || task.dueDate!);
        return taskDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

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
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-teal-500" />
                <h1 className="text-4xl font-bold gradient-text">Calendar</h1>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-enhanced p-6 rounded-xl"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{monthName}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 text-sm hover:bg-background/50 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <CalendarDay
                    key={index}
                    day={day}
                    onDayClick={setSelectedDate}
                    selectedDate={selectedDate}
                  />
                ))}
              </div>
            </MotionDiv>
          </div>

          {/* Task Sidebar */}
          <div className="lg:col-span-1">
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TaskSidebar
                selectedDate={selectedDate}
                tasks={tasks}
                onTaskToggle={handleTaskToggle}
                onTaskDelete={handleTaskDelete}
                onCreateTask={handleCreateTask}
              />
            </MotionDiv>
          </div>
        </div>

        {/* Quick Stats */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-teal-500">
              {tasks.filter(t => t.calendarDate || t.dueDate).length}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled Tasks</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-500">
              {tasks.filter(t => t.completed && (t.calendarDate || t.dueDate)).length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-red-500">
              {tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < new Date();
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-500">
              {tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                const today = new Date();
                const dueDate = new Date(t.dueDate);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays >= 0;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Due This Week</div>
          </div>
        </MotionDiv>

        {/* Task Form Modal */}
        <TaskForm
          task={editing}
          isOpen={showCreateModal || editing !== null}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          selectedDate={selectedDate}
        />
      </div>
    </main>
  );
}
