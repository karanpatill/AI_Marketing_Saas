'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Textarea } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Plus, FolderOpen, Calendar, Settings2, ArrowLeft } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Q3 Product Launch',
          description: 'Marketing campaign and assets for the new Q3 features.',
          status: 'active',
          created_at: '2026-07-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Rebranding Assets',
          description: 'Generating core assets for the new visual identity.',
          status: 'completed',
          created_at: '2026-06-15T09:30:00Z'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleCreate = () => {
    setIsModalOpen(false);
    setNewProject({ name: '', description: '' });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 bg-black min-h-screen text-[#E1E0CC]">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-black min-h-screen text-[#E1E0CC]">
      
      <a 
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </a>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[#E1E0CC] tracking-tight">Projects</h1>
          <p className="text-[#E1E0CC]/60 text-sm mt-1 font-light">Organize your campaigns, assets, and generation jobs into workspaces.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="bg-[#101010] border border-[#E1E0CC]/10 hover:border-[#E1E0CC]/30 transition-colors group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-[#212121] rounded-xl text-[#E1E0CC] border border-[#E1E0CC]/10">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                  {project.status}
                </Badge>
              </div>
              <h3 className="text-lg font-medium text-[#E1E0CC] mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-[#E1E0CC]/60 line-clamp-2 mb-4 font-light">
                {project.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#E1E0CC]/40 pt-4 border-t border-[#E1E0CC]/10 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 hover:text-[#E1E0CC] transition-colors">
                  <Settings2 className="w-3.5 h-3.5" />
                  Settings
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Project</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Project Name" 
            placeholder="e.g. Q4 Winter Campaign" 
            value={newProject.name}
            onChange={e => setNewProject({...newProject, name: e.target.value})}
          />
          <Textarea 
            label="Description (Optional)" 
            placeholder="What is this project about?" 
            value={newProject.description}
            onChange={e => setNewProject({...newProject, description: e.target.value})}
          />
        </div>
      </Modal>

    </div>
  );
}
