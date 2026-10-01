import React, { useState } from 'react';
import useProject from '../../hooks/useProject';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import KanbanBoard from '../../components/projects/KanbanBoard';
import TaskModal from '../../components/projects/TaskModal';
import { useToast } from '../../components/common/Toast';

export function ProjectBoardPage() {
  const { addToast } = useToast();
  const { project, tasks: initialTasks } = useProject();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState('To Do');

  const handleOpenAddTask = (status = 'To Do') => {
    setSelectedTask(null);
    setModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (savedTask) => {
    const exists = tasks.some((t) => t.id === savedTask.id);
    if (exists) {
      setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
      addToast(`Task "${savedTask.title}" updated!`, 'success');
    } else {
      setTasks([savedTask, ...tasks]);
      addToast(`Task "${savedTask.title}" created!`, 'success');
    }
  };

  const handleDeleteTask = (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    addToast(`Task ${taskId} deleted successfully`, 'error');
  };

  const handleMoveTask = (taskId, newStatus) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Banner Header */}
      <ProjectHeader project={project} onAddTask={() => handleOpenAddTask('To Do')} />

      {/* Project Nav Tabs (React Router DOM) */}
      <ProjectNavTabs taskCount={tasks.length} />

      {/* Interactive Kanban Board */}
      <KanbanBoard
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={(colId) => handleOpenAddTask(colId)}
        onMoveTask={handleMoveTask}
      />

      {/* Task Details / Edit / Delete Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        defaultStatus={modalDefaultStatus}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

export default ProjectBoardPage;
