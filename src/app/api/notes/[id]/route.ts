import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '../../../../lib/jsonDB.server';
import { Note } from '../../../../types/Note';

const db = new JsonDB<Note>('notes.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notes = await db.read();
    const note = notes.find(n => n.id === id);
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const notes = await db.read();
    const idx = notes.findIndex(n => n.id === id);
    
    if (idx === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    const updated = { 
      ...notes[idx], 
      ...body, 
      updatedAt: new Date().toISOString() 
    };
    
    notes[idx] = updated;
    await db.write(notes);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notes = await db.read();
    const filtered = notes.filter(n => n.id !== id);
    
    if (filtered.length === notes.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    await db.write(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
