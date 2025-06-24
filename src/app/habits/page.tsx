"use client";

import { useState, useEffect } from "react";
import { MotionDiv } from "@/components/ui/motion";
import { 
  Plus, 
  Target, 
  Calendar,
  Flame,
  Trophy,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  Filter,
  Search,
  BarChart3,
  Zap,
  X,
  Save
} from "lucide-react";
import { HabitService } from "@/services/HabitService";
import { Habit, CreateHabitData, HabitWithStreaks, addStreaksToHabit } from "@/types/Habit";
import Link from 'next/link';
import { TopBar } from '../../components/layout/TopBar';

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HABIT_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500", 
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-teal-500 to-blue-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500"
];

const HABIT_ICONS = ["🏃", "📚", "🧘", "💧", "🏋️", "🎯", "✍️", "🎵", "🥗", "😴", "🎨", "📱", "🌱", "🍎"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStreaks[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithStreaks | null>(null);
  const [newHabit, setNewHabit] = useState<CreateHabitData>({
    name: "",
    description: "",
    icon: "🎯",
    color: `bg-gradient-to-r ${HABIT_COLORS[0]}`,
    targetFrequency: 7,
    tags: [],
    completions: {},
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habitsData = await HabitService.getAll();
      // Add calculated streaks to each habit
      const habitsWithStreaks = habitsData.map(habit => addStreaksToHabit(habit));
      setHabits(habitsWithStreaks);
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewHabit({
      name: "",
      description: "",
      icon: "🎯",
      color: `bg-gradient-to-r ${HABIT_COLORS[0]}`,
      targetFrequency: 7,
      tags: [],
      completions: {},
    });
    setEditingHabit(null);
  };

  const handleSaveHabit = async () => {
    try {
      if (!newHabit.name.trim()) return;
      
      if (editingHabit) {
        await HabitService.update(editingHabit.id, newHabit);
      } else {
        await HabitService.create(newHabit);
      }
      
      await loadHabits();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to save habit:", error);
    }
  };

  const handleEditHabit = (habit: HabitWithStreaks) => {
    setNewHabit({
      name: habit.name,
      description: habit.description || "",
      icon: habit.icon || "🎯",
      color: habit.color || `bg-gradient-to-r ${HABIT_COLORS[0]}`,
      targetFrequency: habit.targetFrequency,
      tags: habit.tags,
      completions: habit.completions,
    });
    setEditingHabit(habit);
    setShowAddForm(true);
  };

  const toggleHabitDay = async (habitId: string, dateStr: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      if (habit.completions[dateStr]) {
        await HabitService.markIncomplete(habitId, dateStr);
      } else {
        await HabitService.markComplete(habitId, dateStr);
      }
      
      await loadHabits();
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    
    try {
      await HabitService.delete(habitId);
      await loadHabits();
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case "active":
        return habit.streak > 0;
      case "completed":
        // Check if habit was completed enough times this week
        const today = new Date();
        const currentWeekDates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - today.getDay() + i);
          currentWeekDates.push(date.toISOString().split('T')[0]);
        }
        const weekCompletions = currentWeekDates.filter(date => habit.completions[date]).length;
        return weekCompletions >= habit.targetFrequency;
      default:
        return true;
    }
  });

  const getHabitProgress = (habit: HabitWithStreaks) => {
    const today = new Date();
    const lastYearDays = [];
    
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      lastYearDays.push(date.toISOString().split('T')[0]);
    }
    
    const completed = lastYearDays.filter(date => habit.completions[date]).length;
    return Math.min((completed / 365) * 100, 100);
  };

  const generateYearGrid = (habit: HabitWithStreaks) => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() + 1); // Start from exactly one year ago
    
    // Find the first Sunday on or before one year ago
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks = [];
    const currentDate = new Date(startDate);
    
    // Generate 53 weeks (GitHub style)
    for (let week = 0; week < 53; week++) {
      const weekData = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCompleted = Boolean(habit.completions[dateStr]);
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isFuture = currentDate > today;
        
        // Get day name and formatted date for tooltip
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        weekData.push({
          date: dateStr,
          completed: isCompleted,
          isToday,
          isFuture,
          dayName,
          formattedDate,
          month: currentDate.getMonth(),
          dayOfMonth: currentDate.getDate()
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(weekData);
    }
    
    return weeks;
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    
    // Count habits completed today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completions[today]).length;
    
    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);

    return { totalHabits, activeStreaks, completedToday, totalCompletions };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="h-16"></div>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
                  Habit Tracker
                </h1>
                <p className="text-muted-foreground mt-2">
                  Build consistency, track progress, achieve your goals
                </p>
              </div>
            </Link>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="button-primary flex items-center gap-2 px-6 py-3 rounded-xl card-hover"
            >
              <Plus className="w-5 h-5" />
              New Habit
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as typeof selectedFilter)}
              className="px-4 py-3 rounded-xl glass-effect border border-border/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all min-w-[160px]"
            >
              <option value="all">All Habits</option>
              <option value="active">Active Streaks</option>
              <option value="completed">Weekly Goals Met</option>
            </select>
          </div>
        </MotionDiv>

        {/* Stats Overview */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-effect rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <Target className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h3 className="font-semibold">Total Habits</h3>
                <p className="text-2xl font-bold">{stats.totalHabits}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Active Streaks</h3>
                <p className="text-2xl font-bold">{stats.activeStreaks}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold">Best Streak</h3>
                <p className="text-2xl font-bold">{Math.max(...habits.map(h => h.bestStreak), 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Last 7 Days</h3>
                <p className="text-2xl font-bold">
                  {(() => {
                    const last7Days: string[] = [];
                    const today = new Date();
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date(today);
                      date.setDate(today.getDate() - i);
                      last7Days.push(date.toISOString().split('T')[0]);
                    }
                    return habits.reduce((acc, h) => 
                      acc + last7Days.filter(date => h.completions[date]).length, 0
                    );
                  })()}
                </p>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredHabits.map((habit, index) => (
            <MotionDiv
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="glass-effect rounded-xl p-6 shadow-xl card-hover group"
            >
              {/* Habit Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${habit.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{habit.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditHabit(habit)}
                    className="p-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Activity this year</span>
                  <span className="font-medium">
                    {Object.values(habit.completions).filter(Boolean).length} total
                  </span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${getHabitProgress(habit)}%` }}
                  />
                </div>
              </div>

              {/* GitHub-style Year Grid */}
              <div className="mb-6">
                {/* Title and year */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium">
                    {Object.values(habit.completions).filter(Boolean).length} contributions in the last year
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Learn how we count contributions
                  </span>
                </div>
                
                {/* Main grid container */}
                <div className="bg-background/30 rounded-lg p-4 border border-border/20">
                  {/* Month labels */}
                  <div className="flex mb-2">
                    <div className="w-8"></div> {/* Space for day labels */}
                    <div className="flex-1">
                      {/* <div className="grid grid-cols-12 gap-0 text-xs text-muted-foreground">
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => (
                          <div key={month} className="text-center">{month}</div>
                        ))}
                      </div> */}
                    </div>
                  </div>
                  
                  {/* Main grid with day labels */}
                  <div className="flex">
                    {/* Day of week labels */}
                    {/* <div className="w-8 flex flex-col justify-between text-xs text-muted-foreground pr-2">
                      <div className="h-3"></div>
                      <div>Mon</div>
                      <div className="h-3"></div>
                      <div>Wed</div>
                      <div className="h-3"></div>
                      <div>Fri</div>
                      <div className="h-3"></div>
                    </div> */}
                    
                    {/* Contribution grid */}
                    <div className="flex-1 overflow-x-auto">
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: "repeat(53, minmax(0, 1fr))",
                          gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                        }}
                      >
                        {(() => {
                          // Transpose the weeks array to loop by day first, then week (column-major order)
                          const yearGrid = generateYearGrid(habit);
                          const daysInWeek = 7;
                          const weeksCount = yearGrid.length;
                          let cells: JSX.Element[] = [];
                          for (let dayIndex = 0; dayIndex < daysInWeek; dayIndex++) {
                            for (let weekIndex = 0; weekIndex < weeksCount; weekIndex++) {
                              const day = yearGrid[weekIndex][dayIndex];
                              if (!day) continue;
                              // Determine color for empty blocks
                              let cellClass = "";
                              if (day.isFuture) {
                                cellClass = "bg-[#181818] border border-[#181818] cursor-not-allowed opacity-50";
                              } else if (day.completed) {
                                cellClass = "bg-green-500 hover:bg-green-400 shadow-sm";
                              } else {
                                cellClass = "bg-[#181818] border border-[#181818] hover:border-green-400/50 hover:bg-green-500/20";
                              }
                              cells.push(
                                <button
                                  key={day.date}
                                  onClick={() => !day.isFuture && toggleHabitDay(habit.id, day.date)}
                                  disabled={day.isFuture}
                                  className={`w-full aspect-square rounded-sm transition-all duration-200 hover:scale-110 ${cellClass} ${day.isToday ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-background" : ""}`}
                                  title={`${day.dayName}, ${day.formattedDate}: ${day.completed ? "Completed" : "Not completed"}`}
                                  style={{
                                    minWidth: "16px",
                                    minHeight: "16px",
                                    maxWidth: "24px",
                                    maxHeight: "24px",
                                  }}
                                />
                              );
                            }
                          }
                          return cells;
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      Contributions in the last year
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Less</span>
                      <div className="w-3 h-3 rounded-sm bg-[#181818] border border-[#181818]"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                      <span className="text-xs text-muted-foreground">More</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habit Stats */}
              <div className="flex items-center justify-between text-sm pt-3 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span className="font-medium">{habit.streak}</span>
                  <span className="text-muted-foreground">streak</span>
                </div>
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{habit.bestStreak}</span>
                  <span className="text-muted-foreground">best</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-500">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">{habit.totalCompletions}</span>
                  <span className="text-muted-foreground">total</span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* Empty State */}
        {filteredHabits.length === 0 && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "No habits found" : "Start Your Journey"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms or filters" 
                  : "Create your first habit and start building consistency today!"
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="button-primary px-6 py-3 rounded-xl card-hover"
                >
                  Create Your First Habit
                </button>
              )}
            </div>
          </MotionDiv>
        )}

        {/* Add/Edit Habit Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingHabit ? "Edit Habit" : "Create New Habit"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="e.g., Morning Exercise"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    placeholder="What does this habit involve?"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Choose an Icon</label>
                  <div className="grid grid-cols-7 gap-2">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewHabit({ ...newHabit, icon })}
                        className={`p-3 rounded-xl text-xl hover:scale-105 transition-all duration-200 ${
                          newHabit.icon === icon 
                            ? "bg-teal-500 text-white shadow-lg scale-105" 
                            : "bg-background/50 border border-border/50 hover:border-teal-500/50"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Color Theme</label>
                  <div className="grid grid-cols-4 gap-3">
                    {HABIT_COLORS.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => setNewHabit({ ...newHabit, color: `bg-gradient-to-r ${color}` })}
                        className={`h-12 rounded-xl bg-gradient-to-r ${color} hover:scale-105 transition-all duration-200 ${
                          newHabit.color === `bg-gradient-to-r ${color}` ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Target Frequency (times per week)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={newHabit.targetFrequency}
                      onChange={(e) => setNewHabit({ ...newHabit, targetFrequency: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-background/50 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="min-w-[3rem] text-center">
                      <span className="text-xl font-bold text-teal-500">{newHabit.targetFrequency}</span>
                      <span className="text-sm text-muted-foreground block">
                        {newHabit.targetFrequency === 7 ? "daily" : `${newHabit.targetFrequency}/week`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50 hover:bg-background/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHabit}
                  disabled={!newHabit.name.trim()}
                  className="flex-1 button-primary px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 card-hover"
                >
                  <Save className="w-5 h-5" />
                  {editingHabit ? "Save Changes" : "Create Habit"}
                </button>
              </div>
            </MotionDiv>
          </div>
        )}
      </div>
    </div>
  );
}
