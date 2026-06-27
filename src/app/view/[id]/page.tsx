'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Scoreboard from '@/components/Scoreboard';
import type { PublicBoard } from '@/lib/types';

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading');

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/board/${id}`);
        if (!res.ok) { setStatus('error'); return; }
        setBoard(await res.json());
        setStatus('ok');
      } catch {
        setStatus('error');
      }
    };

    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#475569' }}>読み込み中...</p>
      </div>
    );
  }

  if (status === 'error' || !board) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontSize: 20, color: '#64748b' }}>スコアボードが見つかりません</p>
        <a href="/" style={{ color: '#3b82f6', fontSize: 14 }}>新しく作成する →</a>
      </div>
    );
  }

  return (
    <main>
      <Scoreboard board={board} />
    </main>
  );
}
