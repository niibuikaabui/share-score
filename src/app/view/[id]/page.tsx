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
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let mounted = true;

    const connect = () => {
      if (!mounted) return;
      es = new EventSource(`/api/board/${id}/stream`);

      // サーバーからスコアデータが届いたら即座に反映
      es.onmessage = (event) => {
        if (!mounted) return;
        setBoard(JSON.parse(event.data) as PublicBoard);
        setStatus('ok');
      };

      // ボードが存在しない場合
      es.addEventListener('notfound', () => {
        if (!mounted) return;
        setStatus('error');
        es?.close();
        es = null;
      });

      // 接続が切れたら（Vercelのタイムアウト等）自動再接続
      es.onerror = () => {
        if (!mounted) return;
        es?.close();
        es = null;
        reconnectTimer = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
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
