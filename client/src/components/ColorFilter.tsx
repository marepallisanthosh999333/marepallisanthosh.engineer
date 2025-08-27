import React, { useState, useEffect } from 'react';

export type FilterSettings = {
  hue: number;
  saturate: number;
  brightness: number;
  contrast: number;
  sepia: number;
};

type Props = {
  value: FilterSettings;
  onChange: (next: FilterSettings) => void;
};

const presets: { name: string; settings: FilterSettings }[] = [
  { name: 'Default', settings: { hue: 0, saturate: 100, brightness: 100, contrast: 100, sepia: 0 } },
  { name: 'Warm', settings: { hue: 15, saturate: 120, brightness: 105, contrast: 105, sepia: 6 } },
  { name: 'Cool', settings: { hue: 200, saturate: 120, brightness: 95, contrast: 100, sepia: 0 } },
  { name: 'High Contrast', settings: { hue: 0, saturate: 140, brightness: 100, contrast: 130, sepia: 0 } },
  { name: 'Monochrome', settings: { hue: 0, saturate: 0, brightness: 100, contrast: 110, sepia: 0 } },
];

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 py-2">{children}</div>;
}

const ColorFilter: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        // Ctrl/Cmd+F to toggle filter UI
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const update = (patch: Partial<FilterSettings>) => onChange({ ...value, ...patch });

  return (
    <div>
      <button
        aria-label="Color filter settings"
        title="Color filter (Ctrl/Cmd+F)"
        onClick={() => setOpen(o => !o)}
        className="fixed right-4 bottom-4 z-50 bg-white/90 backdrop-blur text-gray-900 p-2 rounded-lg shadow-md border"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
        </svg>
      </button>

      {open && (
        <div className="fixed right-4 bottom-16 z-50 w-80 bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Color Filter</h3>
            <button onClick={() => { onChange(presets[0].settings); setOpen(false); }} className="text-xs text-blue-600">Reset</button>
          </div>

          <div className="mt-3 text-xs">
            <Row>
              <label className="w-20">Hue</label>
              <input type="range" min={0} max={360} value={value.hue} onChange={e => update({ hue: Number(e.target.value) })} className="flex-1" />
              <div className="w-10 text-right">{value.hue}°</div>
            </Row>

            <Row>
              <label className="w-20">Saturate</label>
              <input type="range" min={0} max={300} value={value.saturate} onChange={e => update({ saturate: Number(e.target.value) })} className="flex-1" />
              <div className="w-10 text-right">{value.saturate}%</div>
            </Row>

            <Row>
              <label className="w-20">Brightness</label>
              <input type="range" min={0} max={200} value={value.brightness} onChange={e => update({ brightness: Number(e.target.value) })} className="flex-1" />
              <div className="w-10 text-right">{value.brightness}%</div>
            </Row>

            <Row>
              <label className="w-20">Contrast</label>
              <input type="range" min={0} max={200} value={value.contrast} onChange={e => update({ contrast: Number(e.target.value) })} className="flex-1" />
              <div className="w-10 text-right">{value.contrast}%</div>
            </Row>

            <Row>
              <label className="w-20">Sepia</label>
              <input type="range" min={0} max={100} value={value.sepia} onChange={e => update({ sepia: Number(e.target.value) })} className="flex-1" />
              <div className="w-10 text-right">{value.sepia}%</div>
            </Row>

            <div className="mt-3">
              <div className="text-xs font-semibold mb-2">Presets</div>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.name} onClick={() => onChange(p.settings)} className="px-2 py-1 text-xs bg-gray-100 rounded border">{p.name}</button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Tip: press <span className="font-mono">Ctrl/Cmd+F</span> to toggle.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorFilter;
