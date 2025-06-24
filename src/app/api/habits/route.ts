import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '../../../lib/jsonDB.server';
import { Habit, HabitSchema, CreateHabitData } from '../../../types/Habit';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<Habit>('habits.json');

export async function GET() {
  try {
    const habits = await db.read();
    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const habitData: CreateHabitData = body;
    
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      totalCompletions: 0,
      completions: {},
      tags: habitData.tags || [],
      targetFrequency: habitData.targetFrequency || 7,
    };
    
    HabitSchema.parse(newHabit);
    const habits = await db.read();
    habits.push(newHabit);
    await db.write(habits);
    
    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
