"use client";

import { useState, useEffect, useRef } from 'react';
import { Task } from '../../types/Task';
import { TopBar } from '../../components/layout/TopBar';
import { MotionDiv } from '../../components/ui/motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Target,
  Clock,
  CheckCircle2,
  SkipForward,
  Settings,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  type: SessionType;
  duration: number;
  completedAt: string;
}

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  sessionType: SessionType;
  state: TimerState;
}

function TimerDisplay({ timeLeft, totalTime, sessionType, state }: TimerDisplayProps) {
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const sessionColors = {
    work: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500'
  };

  const sessionBgColors = {
    work: 'from-red-500/20 to-red-500/5',
    shortBreak: 'from-green-500/20 to-green-500/5',
    longBreak: 'from-blue-500/20 to-blue-500/5'
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-12 rounded-full bg-gradient-to-br ${sessionBgColors[sessionType]} border-4 border-border/20`}
    >
      {/* Progress Ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 200 200"
      >
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-border/20"
        />
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 90}`}
          strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
          className={`transition-all duration-1000 ${sessionColors[sessionType]}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Timer Content */}
      <div className="relative flex flex-col items-center justify-center">
        <div className={`text-6xl font-mono font-bold ${sessionColors[sessionType]} mb-2`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-lg font-medium text-muted-foreground capitalize">
          {sessionType === 'shortBreak' ? 'Short Break' : 
           sessionType === 'longBreak' ? 'Long Break' : 'Focus Time'}
        </div>
        {state === 'running' && (
          <div className="mt-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </MotionDiv>
  );
}

function TaskSelector({ 
  tasks, 
  selectedTask, 
  onTaskSelect 
}: {
  tasks: Task[];
  selectedTask: Task | null;
  onTaskSelect: (task: Task | null) => void;
}) {
  const availableTasks = tasks.filter(t => !t.completed);

  return (
    <div className="glass-enhanced p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-teal-500" />
        Focus Task
      </h3>
      
      {selectedTask ? (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{selectedTask.title}</h4>
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedTask.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                  selectedTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-green-500/20 text-green-600'
                }`}>
                  {selectedTask.priority}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedTask.pomodoroCount || 0} sessions completed
                </span>
              </div>
            </div>
            <button
              onClick={() => onTaskSelect(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No active tasks available
            </p>
          ) : (
            availableTasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskSelect(task)}
                className="w-full p-3 text-left rounded-lg border border-border/40 hover:border-border/60 hover:bg-background/50 transition-colors"
              >
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {task.pomodoroCount || 0} sessions • {task.priority} priority
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SessionHistory({ sessions }: { sessions: PomodoroSession[] }) {
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const workSessions = todaySessions.filter(s => s.type === 'work').length;
  const totalFocusTime = todaySessions
    .filter(s => s.type === 'work')
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="glass-enhanced p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-teal-500" />
        Today's Progress
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{workSessions}</div>
          <div className="text-sm text-muted-foreground">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {Math.round(totalFocusTime / 60)}m
          </div>
          <div className="text-sm text-muted-foreground">Focus Time</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Recent Sessions</h4>
        {todaySessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sessions completed today</p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {todaySessions.slice(-5).reverse().map((session, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                <div className={`w-2 h-2 rounded-full ${
                  session.type === 'work' ? 'bg-red-500' :
                  session.type === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {session.taskTitle || 'General Focus'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(session.duration / 60)}m • {
                      new Date(session.completedAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [state, setState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  const timerSettings = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    fetchTasks();
    // Initialize audio for timer completion
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleTimerComplete = async () => {
    setState('idle');
    
    // Play notification sound
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.log('Could not play notification sound');
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: sessionType === 'work' ? 'Time for a break!' : 'Ready to focus?',
        icon: '/favicon.ico'
      });
    }

    // Save session
    const session: PomodoroSession = {
      id: Date.now().toString(),
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      type: sessionType,
      duration: timerSettings[sessionType],
      completedAt: new Date().toISOString()
    };
    setSessions(prev => [...prev, session]);

    // Update task pomodoro count
    if (sessionType === 'work' && selectedTask) {
      try {
        await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pomodoroCount: (selectedTask.pomodoroCount || 0) + 1 
          })
        });
        fetchTasks();
      } catch (error) {
        console.error('Failed to update task pomodoro count:', error);
      }
    }

    // Auto-switch to next session type
    if (sessionType === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      const nextType = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setSessionType(nextType);
      setTimeLeft(timerSettings[nextType]);
    } else {
      setSessionType('work');
      setTimeLeft(timerSettings.work);
    }
  };

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleReset = () => {
    setState('idle');
    setTimeLeft(timerSettings[sessionType]);
  };

  const handleSkip = () => {
    handleTimerComplete();
  };

  const switchSession = (type: SessionType) => {
    setState('idle');
    setSessionType(type);
    setTimeLeft(timerSettings[type]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-teal-500" />
              <h1 className="text-4xl font-bold gradient-text">Focus Timer</h1>
            </div>
          </Link>
          <p className="text-muted-foreground">
            Use the Pomodoro Technique to boost your productivity
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              {/* Session Type Selector */}
              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => switchSession('work')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sessionType === 'work' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Focus
                </button>
                <button
                  onClick={() => switchSession('shortBreak')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sessionType === 'shortBreak' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => switchSession('longBreak')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sessionType === 'longBreak' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Long Break
                </button>
              </div>

              {/* Timer Display */}
              <div className="flex justify-center mb-8">
                <TimerDisplay
                  timeLeft={timeLeft}
                  totalTime={timerSettings[sessionType]}
                  sessionType={sessionType}
                  state={state}
                />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mb-8">
                {state === 'idle' || state === 'paused' ? (
                  <button
                    onClick={handleStart}
                    className="button-primary px-8 py-4 rounded-xl flex items-center gap-2 text-lg"
                  >
                    <Play className="w-6 h-6" />
                    {state === 'paused' ? 'Resume' : 'Start'}
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="button-secondary px-8 py-4 rounded-xl flex items-center gap-2 text-lg"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={handleReset}
                  className="button-secondary px-6 py-4 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
                
                <button
                  onClick={handleSkip}
                  className="button-secondary px-6 py-4 rounded-xl flex items-center gap-2"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip
                </button>
              </div>

              {/* Pomodoro Counter */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < completedPomodoros % 4 ? 'bg-red-500' : 'bg-border/40'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {completedPomodoros} pomodoros completed today
              </p>
            </MotionDiv>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TaskSelector
                tasks={tasks}
                selectedTask={selectedTask}
                onTaskSelect={setSelectedTask}
              />
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SessionHistory sessions={sessions} />
            </MotionDiv>
          </div>
        </div>
      </div>
    </main>
  );
}
