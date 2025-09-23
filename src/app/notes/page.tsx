'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface Note {
  id: number;
  content: string;
  created_at: string;
}

interface JwtPayload {
  userId: number;
  role: 'admin' | 'member';
  tenantSlug: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [limitError, setLimitError] = useState('');
  const [user, setUser] = useState<JwtPayload | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUser(decoded);
    } catch (e) {
      console.error("Invalid token:", e);
      localStorage.removeItem('authToken');
      router.push('/login');
      return;
    }

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/notes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(response.data);
      } catch (err) {
        toast.error('Failed to fetch notes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [router]);

  const handleCreateNote = async (e: FormEvent) => {
    e.preventDefault();
    setLimitError('');
    if (!newNoteContent.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/notes', 
        { content: newNoteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([response.data, ...notes]);
      setNewNoteContent('');
      toast.success('Note created successfully!');
    } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data.message || 'Failed to create note.';
        toast.error(errorMessage);
        if (axiosError.response?.status === 403) {
            setLimitError(errorMessage);
        }
    }
  };
  
  const handleDeleteNote = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
        return;
    }
    try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`/api/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(notes.filter(note => note.id !== id));
        toast.success('Note deleted.');
    } catch (err) {
        toast.error('Failed to delete note.');
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    const toastId = toast.loading('Upgrading subscription...');
    try {
        const token = localStorage.getItem('authToken');
        await axios.post(`/api/tenants/${user.tenantSlug}/upgrade`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Upgrade successful! You now have unlimited notes.', { id: toastId });
        setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
        toast.error('Upgrade failed. Please try again.', { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">My Notes</h1>
            <button onClick={() => { localStorage.removeItem('authToken'); router.push('/'); }} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                Sign out
            </button>
        </div>
        
        <form onSubmit={handleCreateNote} className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
            <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 bg-gray-700 text-gray-200 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows={3}
            />
            <button type="submit" className="mt-3 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                Add Note
            </button>
        </form>

        {limitError && (
            <div className="mb-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg shadow-lg">
                <p>{limitError}</p>
                {limitError.includes('limit') && user?.role === 'admin' && (
                    <button onClick={handleUpgrade} className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500">
                        Upgrade to Pro
                    </button>
                )}
            </div>
        )}
        
        <div className="space-y-4">
            {!isLoading && notes.length === 0 && (
                <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <p className="text-gray-400">You have no notes yet.</p>
                    <p className="font-medium text-gray-300 mt-1">Create your first one above!</p>
                </div>
            )}
            {notes.map(note => (
                <div key={note.id} className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 flex justify-between items-start">
                    <p className="text-gray-300 break-words whitespace-pre-wrap flex-1">{note.content}</p>
                    <button onClick={() => handleDeleteNote(note.id)} className="ml-4 text-sm font-medium text-red-500 hover:text-red-400 flex-shrink-0 transition-colors">
                       Delete
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}