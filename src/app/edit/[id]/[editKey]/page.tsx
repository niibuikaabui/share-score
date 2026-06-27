'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

  // スコアをrefで管理（タイマー内でも最新値を参照するため）
  const localScoresRef = useRef<[number, number]>([0, 0]);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/board/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: PublicBoard) => {
        setBoard(d);
        localScoresRef.current = [d.currentScores[0], d.currentScores[1]];
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  // 3秒に1回だけサーバーへスコアを同期するスロットリング
  const scheduleSync = useCallback(() => {
    if (syncTimerRef.current) return; // すでにタイマー待機中
    syncTimerRef.current = setTimeout(async () => {
      syncTimerRef.current = null;
      await fetch(`/api/board/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editKey, action: 'set_scores', scores: localScoresRef.current }),
      });
    }, 3000);
  }, [id, editKey]);

  // 保留中のスコア同期をすぐに実行する（end_set前に使用）
  const flushSync = useCallback(async () => {
    if (!syncTimerRef.current) return;
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = null;
    await fetch(`/api/board/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editKey, action: 'set_scores', scores: localScoresRef.current }),
    });
  }, [id, editKey]);

  const handleScoreChange = (teamIndex: 0 | 1, delta: 1 | -1) => {
    const scores: [number, number] = [localScoresRef.current[0], localScoresRef.current[1]];
    scores[teamIndex] = Math.max(0, Math.min(99, scores[teamIndex] + delta));
    localScoresRef.current = scores;
    setBoard(prev => prev ? { ...prev, currentScores: scores } : prev);
    scheduleSync();
  };

  const handleEndSet = async () => {
    // 未送信のスコアがあれば先に送る
    await flushSync();
    const res = await fetch(`/api/board/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editKey, action: 'end_set' }),
    });
    if (res.ok) {
      const updated: PublicBoard = await res.json();
      setBoard(updated);
      localScoresRef.current = [updated.currentScores[0], updated.currentScores[1]];
    }
  };

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
          viewUrl: typeof window !== 'undefined' ? `${window.location.origin}/view/${id}` : '',
        }}
      />
    </main>
  );
}
