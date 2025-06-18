"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Note {
  id: string;
  content: string;
  timestamp: string;
}

export function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Remember to update project documentation",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      content: "Schedule team meeting for next week",
      timestamp: "11:45 AM",
    },
  ]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setNotes([
        {
          id: Date.now().toString(),
          content: newNote,
          timestamp,
        },
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Quick Notes</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addNote()}
            placeholder="Add a new note..."
            className="flex-1 px-4 py-2 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={addNote}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <MotionDiv
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start justify-between p-3 rounded-lg bg-background/50"
            >
              <div className="flex-1">
                <p className="text-sm">{note.content}</p>
                <span className="text-xs text-muted-foreground">
                  {note.timestamp}
                </span>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionDiv>
  );
} 