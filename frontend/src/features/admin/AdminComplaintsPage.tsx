import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Complaint } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { AlertOctagon, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Resolution modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !resolutionText.trim()) return;
    setIsResolving(true);
    try {
      await api.resolveComplaint(selectedComplaint.id, resolutionText, 'RESOLVED');
      showToast('Dispute resolved and saved.', 'success');
      setSelectedComplaint(null);
      setResolutionText('');
      await fetchComplaints();
    } catch (err: any) {
      showToast(err.message || 'Resolution failed', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Disputes & Fraud Monitoring</h1>
        <p className="text-xs text-slate-500">Review driver incident reports, inaccurate listings, and resolve disputes.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={<AlertOctagon className="w-8 h-8 text-slate-400" />}
          title="No open complaints or fraud flags"
          description="All driver dispute cases are currently resolved."
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'danger'} size="sm">
                      {c.status}
                    </Badge>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      {c.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">• Ticket #{c.id}</span>
                  </div>

                  <p className="text-xs font-semibold text-dark mt-2">{c.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span>Filed by: <strong>{c.creator_name} ({c.creator_email})</strong></span>
                    {c.parking_id && <span>• Parking ID #{c.parking_id}</span>}
                    <span>• {new Date(c.created_at).toLocaleString()}</span>
                  </div>

                  {c.resolution && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                      <strong>Resolution:</strong> {c.resolution}
                    </div>
                  )}
                </div>

                {c.status !== 'RESOLVED' && (
                  <Button
                    size="sm"
                    className="text-xs shrink-0 self-end sm:self-auto"
                    onClick={() => {
                      setSelectedComplaint(c);
                      setResolutionText('');
                    }}
                  >
                    Resolve Ticket
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Resolve Dispute Case"
        description={`Ticket #${selectedComplaint?.id} • ${selectedComplaint?.type}`}
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Action / Resolution</label>
            <textarea
              rows={4}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Detail actions taken (e.g. Host notified, coordinates updated, driver refunded, or warning issued)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedComplaint(null)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isResolving}>
              Mark as Resolved
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
