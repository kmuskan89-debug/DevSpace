import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, GitPullRequest, CheckSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { INITIAL_NOTIFICATIONS } from '../../utils/constants';

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 my-0">Notifications & Mentions</h1>
          <p className="text-xs text-slate-400">Pull request requests, code reviews, and build statuses</p>
        </div>
        <Button variant="outline" size="sm" icon={CheckCircle2} onClick={markAllRead}>
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            hoverable={true}
            onClick={() => navigate(n.link)}
            className={`flex items-start gap-4 border transition-all ${
              !n.read ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800'
            }`}
          >
            <div className={`p-2.5 rounded-xl mt-0.5 ${!n.read ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-400'}`}>
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;
