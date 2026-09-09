import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

interface QRViewerProps {
  value: string;
  title?: string;
  subtitle?: string;
  size?: number;
  showActions?: boolean;
}

export const QRViewer: React.FC<QRViewerProps> = ({
  value,
  title,
  subtitle,
  size = 200,
  showActions = true,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm" ref={printRef}>
      {title && <h4 className="text-base font-bold text-dark mb-1">{title}</h4>}
      {subtitle && <p className="text-xs text-slate-500 max-w-xs mb-5">{subtitle}</p>}

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-subtle mb-4">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/favicon.svg",
            x: undefined,
            y: undefined,
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 mb-4 max-w-full overflow-hidden text-ellipsis">
        <span>{value}</span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-dark p-1">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Pass
          </Button>
          <Button variant="secondary" size="sm" icon={<Copy className="w-4 h-4" />} onClick={handleCopy}>
            Copy Token
          </Button>
        </div>
      )}
    </div>
  );
};
