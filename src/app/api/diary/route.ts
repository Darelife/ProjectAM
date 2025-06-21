import { NextRequest, NextResponse } from 'next/server';
import { DiaryService } from '../../../services/DiaryService.server';
import { DiaryEntrySchema } from '../../../types/DiaryEntry';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const mood = searchParams.get('mood');
    const search = searchParams.get('search');

    if (date) {
      const entries = await DiaryService.getByDate(date);
      return NextResponse.json(entries);
    }

    if (mood) {
      const entries = await DiaryService.getByMood(mood as any);
      return NextResponse.json(entries);
    }

    if (search) {
      const entries = await DiaryService.searchEntries(search);
      return NextResponse.json(entries);
    }

    const entries = await DiaryService.getAll();
    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Diary fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Ensure required fields have defaults
    const entryData = {
      title: body.title,
      content: body.content,
      mood: body.mood || 'neutral',
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || [],
      linkedNoteIds: body.linkedNoteIds || [],
    };
    
    const entry = await DiaryService.create(entryData);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error('Diary creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
