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
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
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
      const res = await fetch('/api/journals');
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
      const res = await fetch('/api/projects');
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
      const res = await fetch('/api/tasks', {
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
      const res = await fetch(`/api/tasks/${taskId}`, {
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
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
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

  // Clean payload: remove empty strings so backend receives null/undefined for optional relations
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
    const res = await fetch('/api/journals', {
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
      const res = await fetch('/api/projects', {
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
      const res = await fetch(`/api/tasks/${rawId}/status`, {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6 flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide text-white">dev_space</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'board', label: 'Kanban Board', icon: Kanban },
              { id: 'journal', label: 'Developer Journal', icon: BookOpen },
              { id: 'projects', label: 'Projects', icon: FolderKanban },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-indigo-950 text-indigo-400 border border-indigo-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Developer Workspace</p>
          <p className="text-xs text-slate-500 mt-1">Logged in as Praise</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' && 'Welcome back, Praise 👋'}
              {activeTab === 'board' && 'Task & Issue Board'}
              {activeTab === 'journal' && 'Developer Journal & Notes'}
              {activeTab === 'projects' && 'Active Projects'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'dashboard' && "Here's what you're building today."}
              {activeTab === 'board' && 'Manage workflows and track completion.'}
              {activeTab === 'journal' && 'Document solutions and architectural learnings.'}
              {activeTab === 'projects' && 'High-level project status and tracking.'}
            </p>
          </div>

          {/* Unified Single Action Button per tab */}
          <div className="flex items-center gap-3">
            {activeTab === 'projects' ? (
              <button
                onClick={() => {
                  setFormError('');
                  setIsProjectModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            ) : activeTab === 'journal' ? (
              <button
                onClick={() => {
                  setFormError('');
                  setIsJournalModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Journal Entry
              </button>
            ) : (
              <button
                onClick={() => {
                  setFormError('');
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-slate-950">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-400">Active Projects</span>
                  <div className="text-2xl font-bold text-white mt-2">{stats.activeProjects}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-amber-400">Tasks Pending</span>
                  <div className="text-2xl font-bold text-white mt-2">{stats.tasksDue}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-emerald-400">Completed Tasks</span>
                  <div className="text-2xl font-bold text-white mt-2">{stats.completedTasks}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs font-semibold text-indigo-400">Journal Entries</span>
                  <div className="text-2xl font-bold text-white mt-2">{stats.journalCount}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-white mb-4">Current Sprint Focus</h2>
                {tasks.length === 0 ? (
                  <p className="text-slate-500 text-sm">No active tasks found in the pipeline.</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div 
                        key={task.id || task._id} 
                        onClick={() => setEditingTask(task)}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer hover:border-indigo-500 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-200">{task.title}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kanban Board View */}
          {activeTab === 'board' && (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {['IDEAS', 'TODO', 'IN_PROGRESS', 'DONE'].map((columnKey) => (
                <div
                  key={columnKey}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, columnKey)}
                  className="w-72 shrink-0 bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-125 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4 pointer-events-none">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {columnKey.replace('_', ' ')}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                      {tasks.filter((t) => t.status === columnKey).length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {tasks
                      .filter((t) => t.status === columnKey)
                      .map((task) => {
                        const linkedProject = projects.find(
                          (p) => (p.id || p._id)?.toString() === task.projectId?.toString()
                        );

                        return (
                          <div
                            key={task.id || task._id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => setEditingTask({ ...task })}
                            className="p-4 bg-slate-800 border border-slate-700 rounded-xl space-y-2.5 cursor-pointer hover:border-indigo-500 transition active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-100">{task.title}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                            )}

                            {/* Project Visual Badge */}
                            {linkedProject && (
                              <div className="pt-1 flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-2 py-1 rounded-md w-fit font-medium">
                                <Folder className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span className="truncate max-w-37.5">{linkedProject.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Developer Journal View */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-slate-400">All Learning Entries ({journals.length})</h2>
              </div>

              {journals.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No journal entries written yet.</p>
                </div>
              ) : (
                journals.map((entry) => {
                  const linkedProj = projects.find((p) => (p.id || p._id)?.toString() === entry.projectId?.toString());
                  const linkedTask = tasks.find((t) => (t.id || t._id)?.toString() === entry.taskId?.toString());

                  return (
                    <div key={entry.id || entry._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-semibold text-indigo-400">{entry.title}</h3>
                          {entry.mood && (
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md flex items-center gap-1">
                              <Smile className="w-3 h-3 text-amber-400" />
                              {entry.mood}
                            </span>
                          )}
                          {linkedProj && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-md flex items-center gap-1">
                              <Folder className="w-3 h-3 text-indigo-400" />
                              {linkedProj.name}
                            </span>
                          )}
                          {linkedTask && (
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded-md flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-emerald-400" />
                              Task: {linkedTask.title}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{entry.content}</p>

                      {(entry.problem || entry.solution || entry.lesson) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                          {entry.problem && (
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">Problem</span>
                              <p className="text-xs text-slate-400">{entry.problem}</p>
                            </div>
                          )}
                          {entry.solution && (
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Solution</span>
                              <p className="text-xs text-slate-400">{entry.solution}</p>
                            </div>
                          )}
                          {entry.lesson && (
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Takeaway Lesson</span>
                              <p className="text-xs text-slate-400">{entry.lesson}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {entry.tags && (
                        <div className="flex items-center gap-2 pt-1">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <div className="flex gap-1.5 flex-wrap">
                            {entry.tags.split(',').map((tag, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800/60 text-slate-400 rounded-md">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-400">All Active Projects ({projects.length})</h2>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
                  <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => {
                    const projId = (proj.id || proj._id)?.toString();
                    const linkedTasks = tasks.filter(
                      (t) => t.projectId && t.projectId.toString() === projId
                    );
                    const completedCount = linkedTasks.filter((t) => t.status === 'DONE').length;

                    return (
                      <div key={projId} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                            <span className="text-[10px] px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-md font-semibold">
                              {proj.status || 'ACTIVE'}
                            </span>
                          </div>
                          {proj.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span>{linkedTasks.length} Tasks Linked</span>
                          <span className="text-emerald-400">{completedCount} Completed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Task Details</h2>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Project</label>
                <select
                  value={editingTask.projectId || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No Project Assigned</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                  <select
                    value={editingTask.priority || 'MEDIUM'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status Column</label>
                  <select
                    value={editingTask.status || 'IDEAS'}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IDEAS">Ideas</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask.id || editingTask._id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Task
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-400 text-xs">{formError}</div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Implement Auth Middleware"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Task scope or reproduction steps..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assign to Project (Optional)</label>
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No Project Assigned</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status Column</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IDEAS">Ideas</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Project</h2>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-400 text-xs">{formError}</div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., dev_space Web App"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Summary of project goals and scope..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Creation Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">New Journal Entry</h2>
              <button onClick={() => setIsJournalModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-400 text-xs">{formError}</div>
            )}

            <form onSubmit={handleCreateJournal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Overview</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Resolved UUID Mismatch in Express Params"
                  value={newJournal.title}
                  onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Entry Summary & Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain the technical problem and architectural decisions..."
                  value={newJournal.content}
                  onChange={(e) => setNewJournal({ ...newJournal, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Link to Project (Optional)</label>
                  <select
                    value={newJournal.projectId}
                    onChange={(e) => setNewJournal({ ...newJournal, projectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Project Linked</option>
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Link to Task (Optional)</label>
                  <select
                    value={newJournal.taskId}
                    onChange={(e) => setNewJournal({ ...newJournal, taskId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Task Linked</option>
                    {tasks.map((t) => (
                      <option key={t.id || t._id} value={t.id || t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mood / Outcome</label>
                  <select
                    value={newJournal.mood}
                    onChange={(e) => setNewJournal({ ...newJournal, mood: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Nailed it">Nailed it 🚀</option>
                    <option value="Learned something">Learned something 💡</option>
                    <option value="Tough Bug">Tough Bug 🐛</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="express, prisma, debug"
                    value={newJournal.tags}
                    onChange={(e) => setNewJournal({ ...newJournal, tags: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Optional: The problem encountered..."
                  value={newJournal.problem}
                  onChange={(e) => setNewJournal({ ...newJournal, problem: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Optional: The fix or solution..."
                  value={newJournal.solution}
                  onChange={(e) => setNewJournal({ ...newJournal, solution: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsJournalModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer">
                  Save Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}