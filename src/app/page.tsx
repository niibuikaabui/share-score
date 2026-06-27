'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/ColorPicker';
import { COLORS, isLight } from '@/lib/types';

interface TeamSetupProps {
  label: string;
  badge: string;
  name: string;
  color: string;
  onNameChange: (v: string) => void;
  onColorChange: (v: string) => void;
}

function TeamSetup({ label, badge, name, color, onNameChange, onColorChange }: TeamSetupProps) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: color,
          color: isLight(color) ? '#0f172a' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>{badge}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{label}</span>
      </div>
      <input
        value={name}
        onChange={e => onNameChange(e.target.value)}
        maxLength={20}
        placeholder="チーム名"
        style={{
          width: '100%', padding: '11px 14px', marginBottom: 14,
          background: '#0f172a', border: '1px solid #334155', borderRadius: 9,
          color: '#f1f5f9', fontSize: 15, outline: 'none',
        }}
      />
      <p style={{ fontSize: 11, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
        チームカラー
      </p>
      <ColorPicker selected={color} onChange={onColorChange} />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>(['チームA', 'チームB']);
  const [colors, setColors] = useState<string[]>([COLORS[0].hex, COLORS[5].hex]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamNames: names, teamColors: colors }),
      });
      if (!res.ok) throw new Error();
      const { id, editKey } = await res.json();
      router.push(`/edit/${id}/${editKey}`);
    } catch {
      setLoading(false);
      alert('作成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏐</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>スコアボード</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>バレーボール 3セットマッチ</p>
        </div>

        <TeamSetup
          label="チーム A" badge="A"
          name={names[0]} color={colors[0]}
          onNameChange={v => setNames([v, names[1]])}
          onColorChange={v => setColors([v, colors[1]])}
        />

        <div style={{ textAlign: 'center', fontSize: 13, color: '#334155', margin: '8px 0' }}>— VS —</div>

        <TeamSetup
          label="チーム B" badge="B"
          name={names[1]} color={colors[1]}
          onNameChange={v => setNames([names[0], v])}
          onColorChange={v => setColors([colors[0], v])}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            width: '100%', padding: 15, marginTop: 16,
            background: loading ? '#1e3a5f' : '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '作成中...' : 'スコアボードを作成 →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 16, lineHeight: 1.8 }}>
          作成後に編集URLと閲覧URLが発行されます<br />
          スコアボードは作成から <strong style={{ color: '#475569' }}>3日後</strong> に自動削除されます
        </p>
      </div>
    </main>
  );
}
