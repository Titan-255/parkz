import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ParkingSpace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle2, XCircle, Pause, Play, Eye, Building2, MapPin } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminParkingPage: React.FC = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const { showToast } = useToast();

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminParking();
      setSpaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.approveParking(id);
      showToast('Parking space approved and published to drivers!', 'success');
      await fetchSpaces();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectParking(id);
      showToast('Parking space rejected.', 'info');
      await fetchSpaces();
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    }
  };

  const handleSuspend = async (id: number) => {
    try {
      await api.suspendParking(id);
      showToast('Parking space suspended.', 'info');
      await fetchSpaces();
    } catch (err: any) {
      showToast(err.message || 'Suspension failed', 'error');
    }
  };

  const filteredSpaces = spaces.filter((s) => {
    if (activeTab === 'PENDING') return s.verification_status === 'PENDING';
    if (activeTab === 'APPROVED') return s.verification_status === 'APPROVED';
    if (activeTab === 'REJECTED') return s.verification_status === 'REJECTED';
    return true;
  });

  const tabs = [
    { id: 'ALL', label: 'All Listings', count: spaces.length },
    { id: 'PENDING', label: 'Pending Approval', count: spaces.filter((s) => s.verification_status === 'PENDING').length },
    { id: 'APPROVED', label: 'Approved & Active', count: spaces.filter((s) => s.verification_status === 'APPROVED').length },
    { id: 'REJECTED', label: 'Rejected', count: spaces.filter((s) => s.verification_status === 'REJECTED').length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-dark tracking-tight">Parking Verification Queue</h1>
        <p className="text-xs text-slate-500">Inspect submitted spaces, address coordinates, and issue approval for driver search indexing.</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-slate-400" />}
          title="No spaces in this queue"
          description="There are currently no parking space listings matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredSpaces.map((s) => {
            const photo = s.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';

            return (
              <Card key={s.id} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <img
                      src={photo}
                      alt={s.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant={
                            s.verification_status === 'APPROVED'
                              ? 'success'
                              : s.verification_status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {s.verification_status}
                        </Badge>
                        <span className="text-xs text-slate-400">• Host ID #{s.owner_id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-dark truncate">{s.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{s.address}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2 font-medium">
                        <span className="text-primary font-bold">₹{s.price_per_hour}/hr</span>
                        <span>• {s.total_spaces} Bays</span>
                        <span>• {s.vehicle_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end shrink-0">
                    {s.verification_status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleApprove(s.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => handleReject(s.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {s.verification_status === 'APPROVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                        icon={<Pause className="w-4 h-4" />}
                        onClick={() => handleSuspend(s.id)}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
