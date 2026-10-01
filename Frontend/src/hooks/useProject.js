import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../utils/constants';

export function useProject(overrideProjectId) {
  const { projectId: paramId } = useParams();
  const targetId = overrideProjectId || paramId || 'proj-auth-service';

  const project = useMemo(() => {
    const found = INITIAL_PROJECTS.find((p) => p.id === targetId);
    return found || INITIAL_PROJECTS[0];
  }, [targetId]);

  const tasks = useMemo(() => {
    return INITIAL_TASKS.filter((t) => t.projectId === project.id || targetId === 'proj-auth-service');
  }, [project.id, targetId]);

  return {
    project,
    tasks
  };
}

export default useProject;
