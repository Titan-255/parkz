import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, PlusCircle, QrCode, Play, Pause, 
  Eye, Star, Clock, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../../api/client';
import { ParkingSpace, QRCodeData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { QRViewer } from '../../components/common/QRViewer';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';

export const OwnerParkingPage: React.FC = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // QR Modal state
  const [selectedQRSpace, setSelectedQRSpace] = useState<ParkingSpace | null>(null);
  const [qrToken, setQrToken] = useState<QRCodeData | null>(null);

  const fetchSpaces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOwnerParking();
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

  const handleToggleStatus = async (space: ParkingSpace) => {
    const newStatus = space.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateParking(space.id, { status: newStatus });
      showToast(`Parking space ${newStatus.toLowerCase()} successfully`, 'success');
      await fetchSpaces();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleOpenQR = async (space: ParkingSpace) => {
    setSelectedQRSpace(space);
    try {
      const qrData = await api.getParkingQR(space.id);
      setQrToken(qrData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-dark tracking-tight">My Parking Spaces</h1>
          <p className="text-xs text-slate-500">Manage your listed facilities, active statuses, and entrance QR passes.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchSpaces}>
            Refresh
          </Button>
          <Link to="/owner/parking/new">
            <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Add Space
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : spaces.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-slate-400" />}
          title="No parking spaces listed"
          description="You haven't added any parking spaces yet. List your unused driveway or commercial lot to start earning."
          actionText="Add Parking Space"
          onAction={() => window.location.assign('/owner/parking/new')}
        />
      ) : (
        <div className="space-y-4">
          {spaces.map((space) => {
            const photo = space.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a';

            return (
              <Card key={space.id} className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <img
                      src={photo}
                      alt={space.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant={
                            space.verification_status === 'APPROVED'
                              ? 'success'
                              : space.verification_status === 'REJECTED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {space.verification_status}
                        </Badge>

                        <Badge
                          variant={space.status === 'ACTIVE' ? 'primary' : 'neutral'}
                          size="sm"
                        >
                          {space.status}
                        </Badge>
                      </div>

                      <h3 className="text-sm font-bold text-dark truncate">{space.name}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{space.address}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-2">
                        <span className="font-bold text-primary">₹{space.price_per_hour}/hr</span>
                        <span>• {space.total_spaces} Bays</span>
                        <span>• {space.vehicle_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<QrCode className="w-4 h-4 text-slate-600" />}
                      onClick={() => handleOpenQR(space)}
                    >
                      Entrance QR
                    </Button>

                    <Button
                      variant={space.status === 'ACTIVE' ? 'outline' : 'secondary'}
                      size="sm"
                      icon={space.status === 'ACTIVE' ? <Pause className="w-4 h-4 text-amber-600" /> : <Play className="w-4 h-4" />}
                      onClick={() => handleToggleStatus(space)}
                    >
                      {space.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Entrance QR Code Modal */}
      <Modal
        isOpen={!!selectedQRSpace}
        onClose={() => setSelectedQRSpace(null)}
        title="Official Entrance QR Pass"
        description="Place or print this QR pass at your parking facility entrance for arriving drivers to scan."
      >
        {selectedQRSpace && qrToken && (
          <QRViewer
            value={qrToken.secure_token}
            title={selectedQRSpace.name}
            subtitle={selectedQRSpace.address}
            size={220}
          />
        )}
      </Modal>
    </div>
  );
};
