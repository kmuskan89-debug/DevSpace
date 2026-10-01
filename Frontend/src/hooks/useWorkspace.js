import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { INITIAL_WORKSPACES, INITIAL_PROJECTS, INITIAL_MEMBERS, INITIAL_ACTIVITIES } from '../utils/constants';

export function useWorkspace(overrideWorkspaceId) {
  const { workspaceId: paramId } = useParams();
  const targetId = overrideWorkspaceId || paramId || 'ws-core-platform';

  const workspace = useMemo(() => {
    const found = INITIAL_WORKSPACES.find(
      (w) => w.id === targetId || w.slug === targetId
    );
    return (
      found ||
      INITIAL_WORKSPACES[0]
    );
  }, [targetId]);

  const projects = useMemo(() => {
    return INITIAL_PROJECTS.filter((p) => p.workspaceId === workspace.id);
  }, [workspace.id]);

  const members = INITIAL_MEMBERS;
  const activities = INITIAL_ACTIVITIES;

  return {
    workspace,
    projects,
    members,
    activities,
    allWorkspaces: INITIAL_WORKSPACES
  };
}

export default useWorkspace;
