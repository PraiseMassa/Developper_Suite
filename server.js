import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

//const express = require('express');
const cors = require('cors');
//const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Allow requests from live Vercel site
app.use(cors({
  origin: ['https://praisemassa-developper_suite.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// ==========================================
// 1. PROJECTS ENDPOINTS
// ==========================================

// Get all projects with task and journal counts
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

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ==========================================
// 2. TASKS (KANBAN) ENDPOINTS
// ==========================================

// Get all tasks
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

// Create new task (FIXED: JSON return & Error variables)
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
      taskData.projectId = Number(projectId);
    }

    const task = await prisma.task.create({ data: taskData });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task details (Title, Description, Priority, Status, Project)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, projectId } = req.body;
    
    const updatedTask = await prisma.task.update({
      where: { id: id },
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

// Delete task endpoint
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Full update task route
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: id }, // Pass as string directly!
      data: { status }
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task status:', error);
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

// ==========================================
// 3. JOURNAL ENTRIES ENDPOINTS
// ==========================================

// Get all journal entries
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

// Create Journal Entry Endpoint
app.post('/api/journals', async (req, res) => {
  try {
    const { title, content, tags, mood, problem, solution, lesson, projectId, taskId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and Content are required.' });
    }

    // Example Prisma backend model save:
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

// Create Project Endpoint
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