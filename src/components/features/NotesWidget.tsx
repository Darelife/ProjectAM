"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Plus, Trash2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { NoteService } from "@/services/NoteService";
import { Note } from "@/types/Note";

export function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentNotes();
  }, []);

  const loadRecentNotes = async () => {
    try {
      const recentNotes = await NoteService.getRecent(3);
      setNotes(recentNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (newNote.trim()) {
      try {
        await NoteService.create({
          title: newNote.trim().split(' ').slice(0, 5).join(' '), // Use first 5 words as title
          content: newNote.trim(),
          tags: [],
          linkedNoteIds: [],
        });
        await loadRecentNotes();
        setNewNote("");
      } catch (error) {
        console.error("Failed to add note:", error);
      }
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await NoteService.delete(id);
      await loadRecentNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addNote()}
          placeholder="Add a quick note..."
          className="input-focus flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={addNote}
          className="button-primary p-3 rounded-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm">Add your first note above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <MotionDiv
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group gradient-border p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-all duration-300"
            >
              <div className="relative">
                <h4 className="font-medium text-foreground pr-8 mb-1">{note.title}</h4>
                <p className="text-sm text-muted-foreground pr-8 line-clamp-2">
                  {note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </MotionDiv>
          ))}
        </div>
      )}
    </MotionDiv>
  );
} 