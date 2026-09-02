import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

// Allowed Origins Setup
const allowedOrigins = [
  'https://praisemassa-developpersuite.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ==========================================
// 1. PROJECTS ENDPOINTS
// ==========================================
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: { tasks: true, journals: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, status } = req.body;
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
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ==========================================
// 2. TASKS (KANBAN) ENDPOINTS
// ==========================================
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: { select: { id: true, name: true } },
        journals: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, status, projectId } = req.body;
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
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, projectId } = req.body;
    
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
    res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status }
    });
    return res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task status:', error);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ==========================================
// 3. JOURNAL ENTRIES ENDPOINTS
// ==========================================
app.get('/api/journals', async (req, res) => {
  try {
    const { publicOnly } = req.query;
    const where = publicOnly === 'true' ? { isPublic: true } : {};
    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

app.post('/api/journals', async (req, res) => {
  try {
    const { title, content, tags, mood, problem, solution, lesson, projectId, taskId } = req.body;
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
    const activeProjects = await prisma.project.count();
    const tasksDue = await prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } });
    const completedTasks = await prisma.task.count({ where: { status: 'DONE' } });
    const journalCount = await prisma.journalEntry.count();
    const recentTasks = await prisma.task.findMany({
      take: 5,
      where: { status: { not: 'DONE' } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      stats: { activeProjects, tasksDue, completedTasks, journalCount },
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DevSpace Server running on http://localhost:${PORT}`);
});
export default app;