import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '../../../../lib/jsonDB.server';
import { Habit } from '../../../../types/Habit';

const db = new JsonDB<Habit>('habits.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habits = await db.read();
    const habit = habits.find(h => h.id === id);
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const habits = await db.read();
    const idx = habits.findIndex(h => h.id === id);
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    const updated = { 
      ...habits[idx], 
      ...body, 
      updatedAt: new Date().toISOString() 
    };
    
    habits[idx] = updated;
    await db.write(habits);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const habits = await db.read();
    const filtered = habits.filter(h => h.id !== id);
    
    if (filtered.length === habits.length) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    await db.write(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
