import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import { getErrorMessage } from '../../api/client';

interface Setting {
  id: string; key: string; value: string; label?: string; group: string;
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<Setting[]>({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data.data),
  });

  const saveMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminApi.updateSetting(key, value),
    onSuccess: () => { toast('success', 'Setting saved!'); qc.invalidateQueries({ queryKey: ['admin-settings'] }); },
    onError: (e) => toast('error', getErrorMessage(e)),
  });

  const settings = data || [];
  const groups = [...new Set(settings.map(s => s.group))];

  const groupLabels: Record<string, string> = {
    general: '⚙️ General',
    financial: '💰 Financial Limits',
    contact: '📞 Contact Settings',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="teko text-4xl font-bold tracking-widest text-white">SYSTEM SETTINGS</h1>
        <p className="text-muted text-sm">Configure application settings</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        groups.map(group => (
          <div key={group} className="card-dark p-5 rounded-2xl">
            <h2 className="teko text-xl font-bold text-white mb-4">{groupLabels[group] || group.toUpperCase()}</h2>
            <div className="space-y-4">
              {settings.filter(s => s.group === group).map(setting => (
                <div key={setting.key} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      {setting.label || setting.key}
                    </label>
                    <input
                      className="input-xbet"
                      defaultValue={setting.value}
                      onChange={e => setEdits(prev => ({ ...prev, [setting.key]: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={() => saveMut.mutate({ key: setting.key, value: edits[setting.key] ?? setting.value })}
                    disabled={saveMut.isPending || !(setting.key in edits)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-blue text-sm self-end disabled:opacity-40"
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
