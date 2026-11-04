import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FolderGit2,
  CheckSquare,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  CornerDownLeft,
  Sparkles
} from 'lucide-react';
import api from '../../utils/axios';
import Badge from '../common/Badge';

export function GlobalSearchModal({ isOpen, onClose, currentWorkspaceId }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setResults({ projects: [], tasks: [] });
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute search API call
  useEffect(() => {
    let isCancelled = false;

    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults({ projects: [], tasks: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: debouncedQuery });
        if (currentWorkspaceId) {
          params.append('workspaceId', currentWorkspaceId);
        }
        const res = await api.get(`/search?${params.toString()}`);
        if (!isCancelled) {
          setResults(res.data?.results || { projects: [], tasks: [] });
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (!isCancelled) {
          setResults({ projects: [], tasks: [] });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    performSearch();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, currentWorkspaceId]);

  // Flatten items for keyboard navigation
  const allItems = [
    ...results.projects.map((p) => ({ type: 'project', data: p })),
    ...results.tasks.map((t) => ({ type: 'task', data: t }))
  ];

  const handleSelect = useCallback((item) => {
    if (!item) return;
    onClose();

    if (item.type === 'project') {
      const p = item.data;
      const wsSlug = p.workspace?.slug || p.workspace?._id || currentWorkspaceId || 'default';
      navigate(`/workspace/${wsSlug}/projects/${p._id || p.id}`);
    } else if (item.type === 'task') {
      const t = item.data;
      const wsSlug = t.workspace?.slug || t.workspace?._id || currentWorkspaceId || 'default';
      const projId = t.project?._id || t.project || 'default';
      navigate(`/workspace/${wsSlug}/projects/${projId}/board?taskId=${t._id || t.id}`);
    }
  }, [navigate, onClose, currentWorkspaceId]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl border border-slate-700/80 z-10 overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
              <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by issue key (DEV-101), task title, description, project, labels..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mr-2 shrink-0" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors mr-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
              {/* Empty state when no query */}
              {!query && (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 my-0">Global Workspace Search</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Search across all your accessible projects, tasks, descriptions, and exact issue keys like <span className="font-mono text-indigo-400 font-semibold">CORE-1</span>.
                  </p>
                </div>
              )}

              {/* No results state */}
              {debouncedQuery && !isLoading && allItems.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-200 my-0">No results found</h4>
                  <p className="text-xs text-slate-400">
                    We could not find anything matching &quot;{debouncedQuery}&quot;.
                  </p>
                </div>
              )}

              {/* Categorized Projects Section */}
              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Projects ({results.projects.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.projects.map((project, idx) => {
                      const itemIndex = idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <div
                          key={project._id || project.id}
                          onClick={() => handleSelect({ type: 'project', data: project })}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 border border-indigo-500/50 text-slate-100 shadow-sm'
                              : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                              {project.key}
                            </span>
                            <div className="truncate">
                              <h5 className="text-xs font-bold text-slate-100 truncate my-0">
                                {project.name}
                              </h5>
                              {project.description && (
                                <p className="text-[11px] text-slate-400 truncate my-0">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {project.lead?.name && (
                              <span className="hidden sm:inline-flex text-[10px] text-slate-400">
                                Lead: {project.lead.name}
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categorized Tasks / Issues Section */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Issues &amp; Tasks ({results.tasks.length})</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.tasks.map((task, idx) => {
                      const itemIndex = results.projects.length + idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <div
                          key={task._id || task.id}
                          onClick={() => handleSelect({ type: 'task', data: task })}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 border border-indigo-500/50 text-slate-100 shadow-sm'
                              : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                              {task.issueKey || task.id}
                            </span>
                            <div className="truncate">
                              <h5 className="text-xs font-semibold text-slate-100 truncate my-0">
                                {task.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                {task.project?.name && (
                                  <span className="text-[10px] text-slate-500 truncate">
                                    {task.project.name}
                                  </span>
                                )}
                                {task.labels && task.labels.length > 0 && (
                                  <span className="text-[10px] text-slate-500">
                                    #{task.labels.slice(0, 2).join(' #')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge priority={task.priority} size="sm" />
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                              {task.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-800">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-800">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                    <CornerDownLeft className="w-2.5 h-2.5 inline" />
                  </kbd>
                  <span>Open</span>
                </span>
              </div>
              <span>DevSpace Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default GlobalSearchModal;

