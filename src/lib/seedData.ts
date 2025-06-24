import { TaskService } from '@/services/TaskService.server';

export async function seedInitialData() {
  try {
    // Check if data already exists
    const existingTasks = await TaskService.getAll();

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

    console.log('Initial data seeded successfully!');
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}
