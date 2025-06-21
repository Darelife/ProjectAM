import { NextRequest, NextResponse } from 'next/server';
import { DiaryService } from '../../../../services/DiaryService.server';

export const dynamic = 'force-static';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await DiaryService.getById(id);
    if (!entry) {
      return NextResponse.json({ error: 'Diary entry not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Diary fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const entry = await DiaryService.update(id, updates);
    
    if (!entry) {
      return NextResponse.json({ error: 'Diary entry not found' }, { status: 404 });
    }
    
    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Diary update error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await DiaryService.delete(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Diary entry not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Diary delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
