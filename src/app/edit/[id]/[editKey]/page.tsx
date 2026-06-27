'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Scoreboard from '@/components/Scoreboard';
import type { PublicBoard } from '@/lib/types';

function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#475569' }}>読み込み中...</p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <p style={{ fontSize: 20, color: '#64748b' }}>スコアボードが見つかりません</p>
      <a href="/" style={{ color: '#3b82f6', fontSize: 14 }}>新しく作成する →</a>
    </div>
  );
}

export default function EditPage() {
  const { id, editKey } = useParams<{ id: string; editKey: string }>();
  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/board/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: PublicBoard) => { setBoard(d); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, [id]);

  const callAction = useCallback(async (action: string, teamIndex?: number) => {
    const res = await fetch(`/api/board/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editKey, action, teamIndex }),
    });
    if (res.ok) setBoard(await res.json());
  }, [id, editKey]);

  const handleScoreChange = (teamIndex: 0 | 1, delta: 1 | -1) => {
    // Optimistic update, fire-and-forget sync
    setBoard(prev => {
      if (!prev) return prev;
      const scores: [number, number] = [prev.currentScores[0], prev.currentScores[1]];
      scores[teamIndex] = Math.max(0, Math.min(99, scores[teamIndex] + delta));
      return { ...prev, currentScores: scores };
    });
    fetch(`/api/board/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editKey, action: delta === 1 ? 'score_up' : 'score_down', teamIndex }),
    });
  };

  const handleEndSet = () => callAction('end_set');

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/view/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      prompt('閲覧URLをコピーしてください:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') return <Loading />;
  if (status === 'error' || !board) return <NotFound />;

  return (
    <main>
      <Scoreboard
        board={board}
        editCallbacks={{
          onScoreChange: handleScoreChange,
          onEndSet: handleEndSet,
          onCopyUrl: handleCopyUrl,
          copied,
          editUrl: typeof window !== 'undefined' ? window.location.href : '',
        }}
      />
    </main>
  );
}
