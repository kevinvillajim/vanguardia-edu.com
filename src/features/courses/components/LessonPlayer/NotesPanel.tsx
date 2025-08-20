import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/shared/components/ui/Button/Button";

interface Note {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
}

interface NotesPanelProps {
  courseId: string;
  lessonId: string;
  onClose: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  courseId,
  lessonId,
  onClose
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [courseId, lessonId]);

  const loadNotes = () => {
    // Cargar notas desde localStorage (en una implementación real sería del backend)
    const storageKey = `notes_${courseId}_${lessonId}`;
    const savedNotes = localStorage.getItem(storageKey);
    
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      timestamp: Date.now(),
      created_at: new Date().toISOString()
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    setNewNote('');

    // Guardar en localStorage (en una implementación real sería al backend)
    const storageKey = `notes_${courseId}_${lessonId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    
    setSaving(false);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    // Actualizar localStorage
    const storageKey = `notes_${courseId}_${lessonId}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveNote();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>📝</span>
            Notas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            ✕
          </Button>
        </div>
        
        <p className="text-xs text-gray-400">
          Toma notas durante la lección. Se guardan automáticamente.
        </p>
      </div>

      {/* New Note Input */}
      <div className="p-4 border-b border-gray-700">
        <div className="space-y-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu nota aquí... (Ctrl+Enter para guardar)"
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {newNote.length}/500 caracteres
            </span>
            <Button
              onClick={saveNote}
              disabled={!newNote.trim() || saving}
              size="sm"
              variant="primary"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Nota'}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-4xl mb-3">📝</div>
            <h4 className="text-gray-300 font-medium mb-2">No hay notas aún</h4>
            <p className="text-sm text-gray-500">
              Comienza a tomar notas durante la lección
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-700 rounded-lg p-4 relative group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {formatDate(note.created_at)}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200 text-xs"
                  >
                    🗑️
                  </button>
                </div>
                
                <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <div className="flex items-center justify-center gap-4">
            <span>{notes.length} nota{notes.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Guardado automático</span>
          </div>
        </div>
      </div>
    </div>
  );
};