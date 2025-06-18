"use client";import { useEffect, useState } from 'react';import { Task } from '../../types/Task';import { TopBar } from '../../components/layout/TopBar';import { MotionDiv } from '../../components/ui/motion';import {   Plus,   Search,   Calendar,   Target,   Edit3,   Trash2,   CheckCircle2,   Circle,  Tag} from 'lucide-react';interface TaskCardProps {  task: Task;  onEdit: (task: Task) => void;  onDelete: (id: string) => void;  onToggle: (id: string) => void;}function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {  const priorityColors = {    low: 'border-green-500/30 bg-green-500/5',    medium: 'border-yellow-500/30 bg-yellow-500/5',    high: 'border-red-500/30 bg-red-500/5'  };  const priorityTextColors = {    low: 'text-green-500',    medium: 'text-yellow-500',    high: 'text-red-500'  };  return (    <MotionDiv      initial={{ opacity: 0, y: 20 }}      animate={{ opacity: 1, y: 0 }}      className={`glass-enhanced p-6 rounded-xl border-l-4 ${priorityColors[task.priority]} card-hover`}    >      <div className="flex items-start justify-between">        <div className="flex items-start space-x-4 flex-1">          <button            onClick={() => onToggle(task.id)}            className="mt-1 transition-colors hover:scale-110"          >            {task.completed ? (              <CheckCircle2 className="w-5 h-5 text-green-500" />            ) : (              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />            )}          </button>                    <div className="flex-1">            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>              {task.title}            </h3>            {task.description && (              <p className="text-muted-foreground text-sm mt-1">{task.description}</p>            )}                        <div className="flex items-center gap-4 mt-3 text-xs">              <span className={`px-2 py-1 rounded-full ${priorityTextColors[task.priority]} bg-current/10`}>                {task.priority}              </span>                            {task.eisenhowerQuadrant && (                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">                  {task.eisenhowerQuadrant}                </span>              )}                            {task.dueDate && (                <div className="flex items-center gap-1 text-muted-foreground">                  <Calendar className="w-3 h-3" />                  {new Date(task.dueDate).toLocaleDateString()}                </div>              )}                            {task.tags.length > 0 && (                <div className="flex items-center gap-1">                  <Tag className="w-3 h-3 text-muted-foreground" />                  <span className="text-muted-foreground">                    {task.tags.slice(0, 2).join(', ')}                    {task.tags.length > 2 && ` +${task.tags.length - 2}`}                  </span>                </div>              )}            </div>          </div>        </div>                <div className="flex items-center gap-2">          <button            onClick={() => onEdit(task)}            className="p-2 hover:bg-background/50 rounded-lg transition-colors"          >            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-primary" />          </button>          <button            onClick={() => onDelete(task.id)}            className="p-2 hover:bg-background/50 rounded-lg transition-colors"          >            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />          </button>        </div>      </div>    </MotionDiv>  );}export default function TasksPage() {  const [tasks, setTasks] = useState<Task[]>([]);  const [filter, setFilter] = useState<{ tag?: string; quadrant?: string; date?: string; search?: string }>({});  const [editing, setEditing] = useState<Task | null>(null);  const [showCreateModal, setShowCreateModal] = useState(false);  useEffect(() => {    fetchTasks();  }, [filter]);  const fetchTasks = async () => {    try {      let url = '/api/tasks';      const params = new URLSearchParams();      if (filter.tag) params.append('tag', filter.tag);      if (filter.quadrant) params.append('quadrant', filter.quadrant);      if (filter.date) params.append('date', filter.date);      if (filter.search) params.append('search', filter.search);            if (params.toString()) url += `?${params.toString()}`;            const res = await fetch(url);      const data = await res.json();      setTasks(data);    } catch (error) {      console.error('Failed to fetch tasks:', error);    }  };  const handleToggleComplete = async (id: string) => {    const task = tasks.find(t => t.id === id);    if (!task) return;        try {      await fetch(`/api/tasks/${id}`, {        method: 'PATCH',        headers: { 'Content-Type': 'application/json' },        body: JSON.stringify({ completed: !task.completed })      });      fetchTasks();    } catch (error) {      console.error('Failed to toggle task:', error);    }  };  const handleDelete = async (id: string) => {    try {      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });      fetchTasks();    } catch (error) {      console.error('Failed to delete task:', error);    }  };  const filteredTasks = tasks.filter(task => {    if (filter.search) {      const searchLower = filter.search.toLowerCase();      return task.title.toLowerCase().includes(searchLower) ||             task.description?.toLowerCase().includes(searchLower) ||             task.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    return true;
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
            <h1 className="text-4xl font-bold gradient-text">Tasks</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="button-primary px-6 py-3 rounded-xl flex items-center gap-2 smooth-hover"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
              />
            </div>
            
            <select
              value={filter.quadrant || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, quadrant: e.target.value || undefined }))}
              className="px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
            >
              <option value="">All Quadrants</option>
              <option value="do">Do</option>
              <option value="schedule">Schedule</option>
              <option value="delegate">Delegate</option>
              <option value="delete">Delete</option>
            </select>

            <select
              value={filter.tag || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, tag: e.target.value || undefined }))}
              className="px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
            >
              <option value="">All Tags</option>
              {Array.from(new Set(tasks.flatMap(t => t.tags))).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            <input
              type="date"
              value={filter.date || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, date: e.target.value || undefined }))}
              className="px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
            />
          </div>
        </MotionDiv>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first task!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="button-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            </MotionDiv>
          ) : (
            filteredTasks.map((task, index) => (
              <MotionDiv
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  onToggle={handleToggleComplete}
                />
              </MotionDiv>
            ))
          )}
        </div>
      </div>
    </main>
  );
}