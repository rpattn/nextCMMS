export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div aria-busy="true" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 18,
            height: 18,
            border: '2px solid var(--mui-palette-divider)',
            borderTopColor: 'var(--mui-palette-text-secondary)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'wo-spin 0.8s linear infinite'
          }}
        />
        <span style={{ color: 'var(--mui-palette-text-secondary)' }}>Loading work orders…</span>
      </div>
      <style>{`@keyframes wo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

