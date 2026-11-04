import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  breadcrumbs = [],
  actions,
  className = ''
}) {
  return (
    <div className={`space-y-2 pb-4 border-b border-[#E8E8E5] dark:border-[#353535] ${className}`}>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-[#A0A0A0]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#252525] dark:text-[#F2F2F2] font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-[#999999]" />}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-[#252525] dark:text-[#F2F2F2] shrink-0" />}
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
              {title}
            </h1>
            {badge && (
              <span className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;

