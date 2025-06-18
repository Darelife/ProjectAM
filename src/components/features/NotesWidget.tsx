"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Remember to update the project documentation",
      timestamp: new Date(),
    },
    {
      id: "2",
      content: "Schedule team meeting for next week",
      timestamp: new Date(),
    },
  ]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([
        { id: Date.now().toString(), content: newNote.trim(), timestamp: new Date() },
        ...notes,
      ]);
      setNewNote("");
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
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
              <p className="pr-8 text-foreground">{note.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {note.timestamp.toLocaleTimeString()}
              </p>
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
    </MotionDiv>
  );
} 