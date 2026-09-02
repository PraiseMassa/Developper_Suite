import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

// CORS - Allow all origins since we're on same domain
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// Health Check Endpoint
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'API is running!' });
});

// ==========================================
// 1. PROJECTS ENDPOINTS
// ==========================================

app.get('/api/projects', async (req, res) => {
  try {
    console.log('Fetching projects...');
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true, journals: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    console.log(`Found ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    console.log('Creating project:', { name, description, status });
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : '',
        status: status || 'ACTIVE'
      }
    });
    console.log('Project created:', newProject.id);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
});

// ==========================================
// 2. TASKS (KANBAN) ENDPOINTS
// ==========================================

app.get('/api/tasks', async (req, res) => {
  try {
    console.log('Fetching tasks...');
    const tasks = await prisma.task.findMany({
      include: {
        project: { select: { id: true, name: true } },
        journals: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, status, projectId } = req.body;
    console.log('Creating task:', { title, projectId });
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      status: status || 'IDEAS',
      priority: priority || 'MEDIUM'
    };
    if (projectId) {
      taskData.projectId = projectId;
    }
    const task = await prisma.task.create({ data: taskData });
    console.log('Task created:', task.id);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, projectId } = req.body;
    console.log('Updating task:', id);
    
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        title: title ? title.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        priority,
        projectId: projectId ? String(projectId) : null
      }
    });
    console.log('Task updated:', id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('Updating task status:', id, 'to', status);
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });
    return res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task status:', error);
    return res.status(500).json({ error: 'Failed to update task status', details: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting task:', id);
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// ==========================================
// 3. JOURNAL ENTRIES ENDPOINTS
// ==========================================

app.get('/api/journals', async (req, res) => {
  try {
    const { publicOnly } = req.query;
    const where = publicOnly === 'true' ? { isPublic: true } : {};
    console.log('Fetching journals...');
    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${entries.length} journal entries`);
    res.json(entries);
  } catch (error) {
    console.error('Failed to fetch journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
  }
});

app.post('/api/journals', async (req, res) => {
  try {
    const { title, content, tags, mood, problem, solution, lesson, projectId, taskId } = req.body;
    console.log('Creating journal:', title);
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and Content are required.' });
    }
    const journal = await prisma.journalEntry.create({
      data: {
        title,
        content,
        tags: tags || '',
        mood: mood || 'Nailed it',
        problem: problem || null,
        solution: solution || null,
        lesson: lesson || null,
        ...(projectId && { project: { connect: { id: projectId } } }),
        ...(taskId && { task: { connect: { id: taskId } } }),
      },
    });
    console.log('Journal created:', journal.id);
    res.status(201).json(journal);
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).json({ message: error.message || 'Journal creation failed on server.' });
  }
});

// ==========================================
// 4. DASHBOARD STATS ENDPOINT
// ==========================================

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    const activeProjects = await prisma.project.count();
    const tasksDue = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } });
    const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
    const journalCount = await prisma.journalEntry.count();
    const recentTasks = await prisma.task.findMany({
      take: 5,
      where: { status: { not: 'DONE' } },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Stats fetched:', { activeProjects, tasksDue, completedTasks, journalCount });
    res.json({
      stats: { activeProjects, tasksDue, completedTasks, journalCount },
      recentTasks
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

// Export for Vercel
export default app;