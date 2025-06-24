import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '../../../../../lib/jsonDB.server';
import { Habit } from '../../../../../types/Habit';

const db = new JsonDB<Habit>('habits.json');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    const habits = await db.read();
    const habit = habits.find(h => h.id === id);
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Update completions record
    const newCompletions: Record<string, boolean> = { ...habit.completions, [date]: true };
    
    const updated = {
      ...habit,
      completions: newCompletions,
      totalCompletions: Object.keys(newCompletions).filter(d => newCompletions[d]).length,
      updatedAt: new Date().toISOString()
    };
    
    const idx = habits.findIndex(h => h.id === id);
    habits[idx] = updated;
    await db.write(habits);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error marking habit complete:', error);
    return NextResponse.json({ error: 'Failed to mark habit complete' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    const habits = await db.read();
    const habit = habits.find(h => h.id === id);
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const newCompletions: Record<string, boolean> = { ...habit.completions };
    delete newCompletions[date];
    
    const updated = {
      ...habit,
      completions: newCompletions,
      totalCompletions: Object.keys(newCompletions).filter(d => newCompletions[d]).length,
      updatedAt: new Date().toISOString()
    };
    
    const idx = habits.findIndex(h => h.id === id);
    habits[idx] = updated;
    await db.write(habits);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error marking habit incomplete:', error);
    return NextResponse.json({ error: 'Failed to mark habit incomplete' }, { status: 500 });
  }
}
