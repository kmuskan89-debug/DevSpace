import React from 'react';
import useWorkspace from '../../hooks/useWorkspace';
import ActivityFeed from '../../components/workspace/ActivityFeed';

export function WorkspaceActivityPage() {
  const { activities } = useWorkspace();

  return (
    <div className="space-y-6">
      <ActivityFeed activities={activities} />
    </div>
  );
}

export default WorkspaceActivityPage;
