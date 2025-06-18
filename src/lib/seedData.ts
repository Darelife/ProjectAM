import { TaskService } from '@/services/TaskService';
import { HabitService } from '@/services/HabitService';
import { NoteService } from '@/services/NoteService';

export async function seedInitialData() {
  try {
    // Check if data already exists
    const existingTasks = await TaskService.getAll();
    const existingHabits = await HabitService.getAll();
    const existingNotes = await NoteService.getAll();

    // Seed tasks if none exist
    if (existingTasks.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      await TaskService.create({
        title: "Complete project proposal",
        description: "Finalize the quarterly project proposal document",
        dueDate: today,
        priority: "high",
        linkedNoteIds: [],
        tags: ["work", "urgent"],
        calendarDate: today,
        completed: false,
      });

      await TaskService.create({
        title: "Review team feedback",
        description: "Go through feedback from the team retrospective",
        dueDate: today,
        priority: "medium",
        linkedNoteIds: [],
        tags: ["team", "feedback"],
        calendarDate: today,
        completed: false,
      });

      await TaskService.create({
        title: "Update documentation",
        description: "Update the API documentation with recent changes",
        dueDate: tomorrow,
        priority: "low",
        linkedNoteIds: [],
        tags: ["docs", "api"],
        calendarDate: tomorrow,
        completed: false,
      });
    }

    // Seed habits if none exist
    if (existingHabits.length === 0) {
      await HabitService.create({
        name: "Morning Exercise",
        description: "30 minutes of physical activity to start the day",
        icon: "🏃",
        color: "bg-gradient-to-r from-blue-500 to-cyan-500",
        targetFrequency: 5,
        tags: ["health", "morning"],
        completions: {},
        weeklyProgress: [true, true, false, true, false, false, false],
      });

      await HabitService.create({
        name: "Read for 30 minutes",
        description: "Daily reading to expand knowledge and relax",
        icon: "📚",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        targetFrequency: 7,
        tags: ["learning", "relaxation"],
        completions: {},
        weeklyProgress: [true, true, true, true, true, false, true],
      });

      await HabitService.create({
        name: "Meditate",
        description: "10 minutes of mindfulness meditation",
        icon: "🧘",
        color: "bg-gradient-to-r from-green-500 to-emerald-500",
        targetFrequency: 7,
        tags: ["mindfulness", "wellness"],
        completions: {},
        weeklyProgress: [false, true, true, false, true, true, true],
      });
    }

    // Seed notes if none exist
    if (existingNotes.length === 0) {
      await NoteService.create({
        title: "Project Ideas",
        content: "List of potential project ideas for the next quarter:\n\n1. User dashboard redesign\n2. Mobile app optimization\n3. API performance improvements\n4. New feature: dark mode\n5. Integration with third-party services",
        tags: ["projects", "planning", "ideas"],
        linkedNoteIds: [],
      });

      await NoteService.create({
        title: "Meeting Notes - Team Sync",
        content: "Weekly team sync meeting notes:\n\n- Discussed current sprint progress\n- Reviewed upcoming deadlines\n- Assigned new tasks to team members\n- Planned next week's priorities\n- Addressed any blockers or concerns",
        tags: ["meetings", "team", "sync"],
        linkedNoteIds: [],
      });

      await NoteService.create({
        title: "Learning Goals",
        content: "Personal learning objectives for this quarter:\n\n- Master React 18 features\n- Learn TypeScript advanced patterns\n- Explore Next.js 13+ features\n- Practice system design concepts\n- Improve testing strategies",
        tags: ["learning", "goals", "development"],
        linkedNoteIds: [],
      });
    }

    console.log('Initial data seeded successfully!');
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}
