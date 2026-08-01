import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { Notification } from '../../types';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data || [];

  const typeColors: Record<string, string> = {
    info: 'bg-bright/20 text-bright',
    success: 'bg-xgreen/20 text-xgreen',
    warning: 'bg-xgold/20 text-xgold',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="teko text-3xl font-bold tracking-widest text-white">NOTIFICATIONS</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => markAllRead()}
            className="text-xs text-bright font-bold hover:text-white transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : !notifications.length ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card-dark p-4 flex items-start gap-3 transition-all ${
                !n.isRead ? 'border-bright/30' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.info}`}>
                {n.type === 'success' ? '✓' : n.type === 'error' ? '✗' : '!'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-bold text-sm">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-bright flex-shrink-0" />
                  )}
                </div>
                <p className="text-muted text-xs leading-relaxed">{n.message}</p>
                <p className="text-muted text-[11px] mt-1">{format(new Date(n.createdAt), 'dd MMM yyyy HH:mm')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
