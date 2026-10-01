export const INITIAL_USER = {
  id: 'usr-1',
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex.rivera@devspace.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Lead Architect & Senior Developer',
  github: 'alexrivera-dev',
  bio: 'Full-stack software engineer building distributed cloud applications & developer tools.',
  status: 'online',
  preferences: {
    theme: 'dark',
    emailNotifications: true,
    desktopNotifications: true,
    codeTheme: 'vs-dark'
  }
};

export const INITIAL_WORKSPACES = [
  {
    id: 'ws-core-platform',
    name: 'DevSpace Core Platform',
    slug: 'core-platform',
    description: 'Next-gen developer collaboration microservices and cloud orchestrator infrastructure.',
    icon: 'Layers',
    color: 'from-indigo-500 to-purple-600',
    visibility: 'Public',
    techStack: ['React', 'Node.js', 'Go', 'Docker', 'Kubernetes'],
    memberCount: 14,
    projectCount: 4,
    openIssues: 18,
    starred: true,
    updatedAt: '10 mins ago',
    owner: 'Alex Rivera'
  },
  {
    id: 'ws-ai-copilot',
    name: 'AI Code Assistant & CLI',
    slug: 'ai-copilot',
    description: 'Intelligent code generation, automated review agent & CLI developer toolchain.',
    icon: 'Cpu',
    color: 'from-cyan-500 to-blue-600',
    visibility: 'Private',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'TypeScript', 'Rust'],
    memberCount: 8,
    projectCount: 3,
    openIssues: 12,
    starred: true,
    updatedAt: '1 hour ago',
    owner: 'Sarah Chen'
  },
  {
    id: 'ws-mobile-suite',
    name: 'DevSpace Mobile & Desktop',
    slug: 'mobile-suite',
    description: 'Cross-platform mobile and Electron desktop app for real-time pull request reviews.',
    icon: 'Smartphone',
    color: 'from-emerald-500 to-teal-600',
    visibility: 'Internal',
    techStack: ['React Native', 'Electron', 'TailwindCSS', 'GraphQL'],
    memberCount: 6,
    projectCount: 2,
    openIssues: 7,
    starred: false,
    updatedAt: '3 hours ago',
    owner: 'David Kim'
  },
  {
    id: 'ws-design-system',
    name: 'UI System & Component SDK',
    slug: 'design-system',
    description: 'Accessible theme tokens, atomic UI library, and Storybook components for DevSpace applications.',
    icon: 'Palette',
    color: 'from-amber-500 to-rose-600',
    visibility: 'Public',
    techStack: ['React', 'TailwindCSS', 'Storybook', 'Figma'],
    memberCount: 5,
    projectCount: 2,
    openIssues: 4,
    starred: false,
    updatedAt: '1 day ago',
    owner: 'Elena Rostova'
  }
];

export const INITIAL_PROJECTS = [
  {
    id: 'proj-auth-service',
    workspaceId: 'ws-core-platform',
    name: 'OAuth2 & Auth Gateway Service',
    description: 'Stateless JWT authentication gateway, MFA integration, and GitHub OAuth bridge.',
    status: 'Active',
    priority: 'High',
    progress: 78,
    techStack: ['Node.js', 'Express', 'Redis', 'JWT'],
    lead: 'Alex Rivera',
    openTasksCount: 6,
    completedTasksCount: 19,
    githubRepo: 'devspace/auth-gateway-service',
    updatedAt: '25 mins ago'
  },
  {
    id: 'proj-realtime-collab',
    workspaceId: 'ws-core-platform',
    name: 'Real-time WebSockets Engine',
    description: 'CRDT-based collaborative editing server supporting live pair programming & code cursors.',
    status: 'In Progress',
    priority: 'Urgent',
    progress: 60,
    techStack: ['Go', 'WebSockets', 'Redis', 'Docker'],
    lead: 'David Kim',
    openTasksCount: 9,
    completedTasksCount: 14,
    githubRepo: 'devspace/realtime-collab-engine',
    updatedAt: '2 hours ago'
  },
  {
    id: 'proj-dashboard-v2',
    workspaceId: 'ws-core-platform',
    name: 'Frontend Developer Workspace v2',
    description: 'Modern single-page React frontend dashboard with Tailwind CSS styling and modular routing.',
    status: 'In Progress',
    priority: 'Medium',
    progress: 85,
    techStack: ['React', 'Vite', 'TailwindCSS', 'React Router'],
    lead: 'Elena Rostova',
    openTasksCount: 3,
    completedTasksCount: 22,
    githubRepo: 'devspace/web-dashboard-v2',
    updatedAt: 'Just now'
  },
  {
    id: 'proj-agent-runner',
    workspaceId: 'ws-ai-copilot',
    name: 'LLM Context Agent & Parser',
    description: 'Context builder that indexes git repos and creates embeddings for code search.',
    status: 'Active',
    priority: 'High',
    progress: 45,
    techStack: ['Python', 'LangChain', 'ChromaDB', 'FastAPI'],
    lead: 'Sarah Chen',
    openTasksCount: 8,
    completedTasksCount: 10,
    githubRepo: 'devspace/agent-context-runner',
    updatedAt: '4 hours ago'
  }
];

export const INITIAL_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@devspace.io',
    role: 'Workspace Owner',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    commits: 342,
    prMerged: 48,
    joinedDate: 'Jan 12, 2025'
  },
  {
    id: 'mem-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@devspace.io',
    role: 'Admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    commits: 215,
    prMerged: 31,
    joinedDate: 'Feb 04, 2025'
  },
  {
    id: 'mem-3',
    name: 'David Kim',
    email: 'david.kim@devspace.io',
    role: 'Maintainer',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    commits: 189,
    prMerged: 24,
    joinedDate: 'Mar 19, 2025'
  },
  {
    id: 'mem-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@devspace.io',
    role: 'Frontend Lead',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    commits: 164,
    prMerged: 29,
    joinedDate: 'Apr 02, 2025'
  },
  {
    id: 'mem-5',
    name: 'Marcus Vance',
    email: 'marcus.vance@devspace.io',
    role: 'Contributor',
    status: 'Invited',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    commits: 0,
    prMerged: 0,
    joinedDate: 'Pending invitation'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-101',
    projectId: 'proj-auth-service',
    title: 'Implement PKCE flow for mobile OAuth authorization',
    description: 'Add Proof Key for Code Exchange (PKCE) security to prevent authorization code injection attacks on mobile clients.',
    status: 'In Progress',
    priority: 'High',
    assignee: {
      id: 'mem-1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    tags: ['Security', 'OAuth', 'Backend'],
    dueDate: 'Oct 5, 2026',
    commentsCount: 2,
    branch: 'feature/oauth-pkce-flow',
    subtasks: [
      { id: 'sub-1', text: 'Generate crypto code_verifier and code_challenge', completed: true },
      { id: 'sub-2', text: 'Implement SHA-256 (S256) hash verification', completed: true },
      { id: 'sub-3', text: 'Add PKCE integration specs to auth router', completed: false }
    ],
    comments: [
      {
        id: 'c-1',
        user: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'PKCE spec implementation looks solid. Ensure we validate code_challenge_method == S256.',
        time: '2 hours ago'
      },
      {
        id: 'c-2',
        user: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Good call. Added SHA256 validation in the authorization code exchange handler.',
        time: '45 mins ago'
      }
    ],
    history: [
      { id: 'h-1', user: 'Alex Rivera', action: 'created task', time: '1 day ago' },
      { id: 'h-2', user: 'David Kim', action: 'changed status to In Progress', time: '5 hours ago' },
      { id: 'h-3', user: 'Alex Rivera', action: 'added subtask "Add PKCE integration specs"', time: '2 hours ago' }
    ]
  },
  {
    id: 'task-102',
    projectId: 'proj-auth-service',
    title: 'Add Rate limiting middleware using Redis token bucket',
    description: 'Enforce rate limits per API key and user IP address to protect auth endpoints against brute force attempts.',
    status: 'To Do',
    priority: 'High',
    assignee: {
      id: 'mem-2',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    tags: ['Redis', 'Middleware', 'Performance'],
    dueDate: 'Oct 8, 2026',
    commentsCount: 1,
    branch: 'feature/redis-rate-limiter',
    subtasks: [
      { id: 'sub-4', text: 'Setup Redis token bucket sliding window Lua script', completed: true },
      { id: 'sub-5', text: 'Add 429 Too Many Requests response headers', completed: false }
    ],
    comments: [
      {
        id: 'c-3',
        user: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Let us use a sliding window log in Redis to handle burst spikes smoothly.',
        time: '3 hours ago'
      }
    ],
    history: [
      { id: 'h-4', user: 'Sarah Chen', action: 'created task', time: '2 days ago' },
      { id: 'h-5', user: 'Sarah Chen', action: 'set priority to High', time: '1 day ago' }
    ]
  },
  {
    id: 'task-103',
    projectId: 'proj-auth-service',
    title: 'Write automated unit & integration tests for JWT validation',
    description: 'Increase test coverage for expired token revocation, key rotation, and malformed header handling.',
    status: 'Code Review',
    priority: 'Medium',
    assignee: {
      id: 'mem-3',
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    tags: ['Testing', 'Jest', 'CI/CD'],
    dueDate: 'Oct 3, 2026',
    commentsCount: 2,
    branch: 'test/jwt-revocation-specs',
    subtasks: [
      { id: 'sub-6', text: 'Unit tests for key rotation algorithm', completed: true },
      { id: 'sub-7', text: 'Integration tests for revoked token blacklist', completed: true }
    ],
    comments: [
      {
        id: 'c-4',
        user: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        content: 'All 46 specs passed in pipeline build #148!',
        time: '1 hour ago'
      }
    ],
    history: [
      { id: 'h-6', user: 'David Kim', action: 'created task', time: '3 days ago' },
      { id: 'h-7', user: 'David Kim', action: 'moved status to Code Review', time: '1 hour ago' }
    ]
  },
  {
    id: 'task-104',
    projectId: 'proj-auth-service',
    title: 'Migrate session tokens from cookies to Bearer header standard',
    description: 'Clean up legacy session cookie handlers and standardize authorization header parsing across API routers.',
    status: 'Done',
    priority: 'Low',
    assignee: {
      id: 'mem-1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    tags: ['Refactor', 'API'],
    dueDate: 'Sep 28, 2026',
    commentsCount: 1,
    branch: 'chore/bearer-token-standard',
    subtasks: [
      { id: 'sub-8', text: 'Remove legacy CookieSession middleware', completed: true },
      { id: 'sub-9', text: 'Update Authorization: Bearer token parser', completed: true }
    ],
    comments: [
      {
        id: 'c-5',
        user: 'Alex Rivera',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Merged into main branch and deployed to production.',
        time: '1 day ago'
      }
    ],
    history: [
      { id: 'h-8', user: 'Alex Rivera', action: 'created task', time: '5 days ago' },
      { id: 'h-9', user: 'Alex Rivera', action: 'marked task as Done', time: '1 day ago' }
    ]
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-1',
    user: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'commit',
    action: 'pushed commit',
    target: 'c8f419b: fix(auth): refresh token rotation race condition',
    workspace: 'DevSpace Core Platform',
    project: 'OAuth2 & Auth Gateway Service',
    time: '14 mins ago'
  },
  {
    id: 'act-2',
    user: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    type: 'pull_request',
    action: 'opened pull request #42',
    target: 'feat(ui): add responsive sidebar & dark theme tokens',
    workspace: 'DevSpace Core Platform',
    project: 'Frontend Developer Workspace v2',
    time: '42 mins ago'
  },
  {
    id: 'act-3',
    user: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'review',
    action: 'approved pull request #39',
    target: 'feat(agent): stream token generation via Server-Sent Events',
    workspace: 'AI Code Assistant & CLI',
    project: 'LLM Context Agent & Parser',
    time: '2 hours ago'
  },
  {
    id: 'act-4',
    user: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'task',
    action: 'moved task to Code Review',
    target: 'Write automated unit & integration tests for JWT validation',
    workspace: 'DevSpace Core Platform',
    project: 'OAuth2 & Auth Gateway Service',
    time: '3 hours ago'
  },
  {
    id: 'act-5',
    user: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'deploy',
    action: 'deployed build #148',
    target: 'staging-v2.devspace.io (Success)',
    workspace: 'DevSpace Core Platform',
    project: 'Frontend Developer Workspace v2',
    time: '5 hours ago'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Pull Request Review Requested',
    message: 'Sarah Chen requested your code review on PR #42 "feat(ui): add responsive sidebar & dark theme tokens"',
    time: '15 mins ago',
    read: false,
    type: 'review',
    link: '/workspace/ws-core-platform/projects/proj-dashboard-v2'
  },
  {
    id: 'notif-2',
    title: 'Assigned to New Task',
    message: 'David Kim assigned you to task "Implement PKCE flow for mobile OAuth authorization"',
    time: '1 hour ago',
    read: false,
    type: 'task',
    link: '/workspace/ws-core-platform/projects/proj-auth-service/board'
  },
  {
    id: 'notif-3',
    title: 'Build Passed',
    message: 'Pipeline #148 (main branch) passed all 46 unit tests in 1m 24s.',
    time: '4 hours ago',
    read: true,
    type: 'ci',
    link: '/workspace/ws-core-platform/activity'
  },
  {
    id: 'notif-4',
    title: 'Workspace Invitation Accepted',
    message: 'Elena Rostova accepted your invitation to join "DevSpace Core Platform"',
    time: '1 day ago',
    read: true,
    type: 'member',
    link: '/workspace/ws-core-platform/members'
  }
];
