import { Bell, AlertCircle, Clock } from 'lucide-react';

const VARIANT_STYLES = {
  info: {
    card: 'bg-wa-dark text-white',
    subtitle: 'text-green-300',
    icon: Bell,
  },
  error: {
    card: 'bg-red-900 text-white',
    subtitle: 'text-red-200',
    icon: AlertCircle,
  },
  warning: {
    card: 'bg-amber-900 text-white',
    subtitle: 'text-amber-100',
    icon: Clock,
  },
};

export default function AppToast({ toast }) {
  const visible = Boolean(toast?.show);
  const isCenter = toast?.position === 'center';
  const variant = VARIANT_STYLES[toast?.variant] ?? VARIANT_STYLES.info;
  const Icon = variant.icon;

  const card = (
    <div
      className={`rounded-2xl p-5 flex items-start gap-4 shadow-2xl min-w-[300px] max-w-md ${variant.card}`}
    >
      <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold leading-snug">{toast?.title ?? ''}</p>
        {toast?.message ? (
          <p className={`text-sm mt-1.5 leading-relaxed ${variant.subtitle}`}>{toast.message}</p>
        ) : null}
        {toast?.hint ? (
          <p className="text-xs mt-2 text-white/60">{toast.hint}</p>
        ) : null}
      </div>
    </div>
  );

  if (isCenter) {
    return (
      <div
        id="appToastOverlay"
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-300 ${
          visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-live="assertive"
        aria-hidden={!visible}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10">{card}</div>
      </div>
    );
  }

  return (
    <div
      id="appToastNotification"
      className={`fixed top-6 left-1/2 z-[60] transition-all duration-300 ${
        visible
          ? 'opacity-100 -translate-x-1/2 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-x-1/2 -translate-y-2 pointer-events-none'
      }`}
    >
      {card}
    </div>
  );
}
