import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban,
  BookOpen,
  FolderKanban,
  Clock,
  FileText,
  Sparkles,
  Plus,
  X,
  Tag,
  Smile,
  Folder,
  CheckSquare,
  Trash2
} from 'lucide-react';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [stats, setStats] = useState({ activeProjects: 0, tasksDue: 0, completedTasks: 0, journalCount: 0 });
  const [tasks, setTasks] = useState([]);
  const [journals, setJournals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formError, setFormError] = useState('');

  // Task Creation Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'IDEAS',
    projectId: ''
  });

  // Task Edit Modal State
  const [editingTask, setEditingTask] = useState(null);

  // Journal Creation Modal State
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [newJournal, setNewJournal] = useState({
    title: '',
    content: '',
    tags: 'bugfix, learnings',
    mood: 'Nailed it',
    problem: '',
    solution: '',
    lesson: '',
    projectId: '',
    taskId: ''
  });

  // Project Creation Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchStats();
    fetchTasks();
    fetchJournals();
    fetchProjects();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard/stats`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      if (!res.ok) return setTasks([]);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks([]);
    }
  };

  const fetchJournals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/journals`);
      if (!res.ok) return setJournals([]);
      const data = await res.json();
      setJournals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch journals:', err);
      setJournals([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      if (!res.ok) return setProjects([]);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
    }
  };

  // Task Handlers
  const handleCreateTask = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    if (!newTask.title.trim()) return;
    const payload = { ...newTask };
    if (!payload.projectId) delete payload.projectId;
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'IDEAS', projectId: '' });
        setIsTaskModalOpen(false);
        await Promise.all([fetchTasks(), fetchStats()]);
      } else {
        const errText = await res.text();
        setFormError(`Server Error (${res.status}): Task creation failed.`);
      }
    } catch (err) {
      setFormError('Network error connecting to API.');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    const taskId = editingTask.id || editingTask._id;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask)
      });
      if (res.ok) {
        setEditingTask(null);
        await Promise.all([fetchTasks(), fetchStats()]);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setEditingTask(null);
        await Promise.all([fetchTasks(), fetchStats()]);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Journal Handlers
  const handleCreateJournal = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    if (!newJournal.title.trim() || !newJournal.content.trim()) return;
    const payload = {
      title: newJournal.title.trim(),
      content: newJournal.content.trim(),
      tags: newJournal.tags || '',
      mood: newJournal.mood || 'Nailed it',
      problem: newJournal.problem.trim() || null,
      solution: newJournal.solution.trim() || null,
      lesson: newJournal.lesson.trim() || null,
      projectId: newJournal.projectId ? newJournal.projectId : null,
      taskId: newJournal.taskId ? newJournal.taskId : null,
    };
    try {
      const res = await fetch(`${API_URL}/api/journals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewJournal({
          title: '',
          content: '',
          tags: 'bugfix, learnings',
          mood: 'Nailed it',
          problem: '',
          solution: '',
          lesson: '',
          projectId: '',
          taskId: ''
        });
        setIsJournalModalOpen(false);
        await Promise.all([fetchJournals(), fetchStats()]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setFormError(errorData.message || `Server Error (${res.status}): Journal creation failed.`);
      }
    } catch (err) {
      setFormError('Network error connecting to API.');
    }
  };

  // Project Handlers
  const handleCreateProject = async (e) => {
    if (e) e.preventDefault();
    setFormError('');
    if (!newProject.name.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setNewProject({ name: '', description: '', status: 'ACTIVE' });
        setIsProjectModalOpen(false);
        await Promise.all([fetchProjects(), fetchStats()]);
      } else {
        setFormError(`Server Error (${res.status}): Project creation failed.`);
      }
    } catch (err) {
      setFormError('Network error connecting to API.');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, task) => {
    const taskId = task.id || task._id;
    if (!taskId) return;
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const rawId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('taskId');
    if (!rawId || rawId === 'NaN') return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        const currentId = (t.id || t._id)?.toString();
        return currentId === rawId ? { ...t, status: targetStatus } : t;
      })
    );

    try {
      const res = await fetch(`${API_URL}/api/tasks/${rawId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) {
        await fetchTasks();
      } else {
        await fetchStats();
      }
    } catch (err) {
      await fetchTasks();
    }
  };

  // The rest of your JSX remains the SAME as before
  // ... (keep all the JSX from your original App.jsx)
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* ... all your existing JSX ... */}
    </div>
  );
}