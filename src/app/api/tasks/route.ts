import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '../../../services/TaskService';
import { TaskSchema } from '../../../types/Task';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const date = searchParams.get('date');
  const quadrant = searchParams.get('quadrant');

  if (id) {
    const task = await TaskService.getById(id);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(task);
  }
  if (date) {
    const tasks = await TaskService.getByDate(date);
    return NextResponse.json(tasks);
  }
  if (quadrant) {
    const tasks = await TaskService.getByQuadrant(quadrant as any);
    return NextResponse.json(tasks);
  }
  const tasks = await TaskService.getAll();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const parsed = TaskSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(body);
    const task = await TaskService.create(parsed);
    return NextResponse.json(task, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const body = await req.json();
  try {
    const updated = await TaskService.update(id, body);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const deleted = await TaskService.delete(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
} 