import { NextRequest, NextResponse } from 'next/server';
import { JsonDB } from '../../../lib/jsonDB.server';
import { Note, NoteSchema, CreateNoteData } from '../../../types/Note';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<Note>('notes.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const graph = searchParams.get('graph');
    
    const notes = await db.read();
    
    // Handle graph data request
    if (graph === 'true') {
      return NextResponse.json(generateGraphData(notes));
    }
    
    let filteredNotes = notes;
    
    if (search) {
      const lowerQuery = search.toLowerCase();
      filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (tag) {
      filteredNotes = filteredNotes.filter(note => note.tags.includes(tag));
    }
    
    return NextResponse.json(filteredNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// Helper function to generate graph data
function generateGraphData(notes: Note[]) {
  const nodes = notes.map(note => ({
    id: note.id,
    title: note.title,
    tags: note.tags,
    size: Math.max(10, Math.min(30, note.content.length / 50)), // Size based on content length
    color: getNodeColor(note.tags)
  }));

  const links: Array<{ source: string; target: string; strength: number }> = [];
  
  for (const note of notes) {
    // Process explicit linkedNoteIds
    for (const linkedId of note.linkedNoteIds) {
      if (notes.find(n => n.id === linkedId)) {
        links.push({
          source: note.id,
          target: linkedId,
          strength: 1
        });
      }
    }
    
    // Process backlinks from content using [[Note Name]] syntax
    const backlinks = extractBacklinks(note.content);
    for (const backlinkTitle of backlinks) {
      const targetNote = notes.find(n => n.title === backlinkTitle);
      if (targetNote && targetNote.id !== note.id) {
        // Avoid duplicate links
        const existingLink = links.find(l => 
          (l.source === note.id && l.target === targetNote.id) ||
          (l.source === targetNote.id && l.target === note.id)
        );
        
        if (!existingLink) {
          links.push({
            source: note.id,
            target: targetNote.id,
            strength: 0.8
          });
        }
      }
    }
  }

  return { nodes, links };
}

// Helper function to extract backlinks
function extractBacklinks(content: string): string[] {
  const backlinkRegex = /\[\[([^\]]+)\]\]/g;
  const matches = [];
  let match;
  
  while ((match = backlinkRegex.exec(content)) !== null) {
    matches.push(match[1].trim());
  }
  
  return matches;
}

// Helper function to get node color based on tags
function getNodeColor(tags: string[]): string {
  if (tags.includes('project')) return '#10b981'; // green
  if (tags.includes('meeting')) return '#3b82f6'; // blue
  if (tags.includes('idea')) return '#8b5cf6'; // purple
  if (tags.includes('important')) return '#ef4444'; // red
  if (tags.includes('daily')) return '#f59e0b'; // amber
  return '#06b6d4'; // teal (default)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const noteData: CreateNoteData = body;
    
    const now = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      tags: noteData.tags || [],
      linkedNoteIds: noteData.linkedNoteIds || [],
    };
    
    NoteSchema.parse(newNote);
    const notes = await db.read();
    notes.push(newNote);
    await db.write(notes);
    
    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
