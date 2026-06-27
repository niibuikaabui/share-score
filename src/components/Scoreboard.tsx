'use client';

import type { PublicBoard } from '@/lib/types';

interface EditCallbacks {
  onScoreChange: (teamIndex: 0 | 1, delta: 1 | -1) => void;
  onEndSet: () => void;
  onCopyUrl: () => void;
  copied: boolean;
  editUrl: string;
}

interface Props {
  board: PublicBoard;
  editCallbacks?: EditCallbacks;
}

const S = {
  wrap: { maxWidth: 540, margin: '0 auto', padding: '24px 16px 48px' } as const,
  center: { textAlign: 'center' as const },
  badge: {
    display: 'inline-block', background: '#1e293b', border: '1px solid #334155',
    color: '#64748b', fontSize: 11, padding: '3px 12px', borderRadius: 999,
    marginBottom: 14, letterSpacing: '0.05em',
  } as const,
  matchLabel: { fontSize: 13, color: '#475569', marginBottom: 4, letterSpacing: '0.05em' } as const,
  setLabel: { fontSize: 22, fontWeight: 700, color: '#94a3b8' } as const,
  teamsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 8,
    marginBottom: 28, alignItems: 'start',
  } as const,
  teamName: { fontSize: 16, fontWeight: 700, color: '#cbd5e1', marginBottom: 12 } as const,
  dotsRow: { display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 6 } as const,
  dotsLabel: { fontSize: 11, color: '#475569' } as const,
  btnRow: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 } as const,
  colon: { fontSize: 64, fontWeight: 300, color: '#334155', textAlign: 'center' as const, paddingTop: 40 } as const,
  historyBox: { background: '#1e293b', borderRadius: 14, padding: 18, marginBottom: 24 } as const,
  historyTitle: {
    fontSize: 11, color: '#475569', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, marginBottom: 14,
  } as const,
  historyRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 0', borderBottom: '1px solid #0f172a',
  } as const,
  historyRowLast: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' } as const,
  setName: { fontSize: 12, color: '#475569', width: 44, flexShrink: 0 } as const,
  scoresRow: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 } as const,
  scoreNum: (color: string) => ({
    fontSize: 22, fontWeight: 800, minWidth: 36, textAlign: 'center' as const, color,
  }),
  sep: { color: '#334155', fontSize: 14 } as const,
  winnerBadge: (color: string) => ({
    fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999,
    background: color + '22', color,
  }),
  actionsRow: { display: 'flex', gap: 12, marginBottom: 20 } as const,
  btnCopy: {
    flex: 1, padding: 13, background: '#1e293b', border: '1px solid #334155',
    color: '#94a3b8', borderRadius: 10, fontSize: 14, cursor: 'pointer',
  } as const,
  btnEnd: {
    flex: 1, padding: 13, background: '#3b82f6', border: 'none',
    color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  } as const,
  urlBox: {
    background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: 10, padding: '12px 16px',
  } as const,
  urlLabel: {
    fontSize: 10, color: '#334155', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, marginBottom: 4,
  } as const,
  urlText: { fontSize: 12, color: '#475569', wordBreak: 'break-all' as const } as const,
};

function ScoreBtn({ onClick, children, color }: { onClick: () => void; children: string; color: string }) {
  return (
    <button onClick={onClick} style={{
      width: 52, height: 52, borderRadius: '50%', border: 'none',
      background: color, fontSize: 26, fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
    }}>
      {children}
    </button>
  );
}

export default function Scoreboard({ board, editCallbacks }: Props) {
  const isEdit = !!editCallbacks;
  const [colorA, colorB] = board.teamColors;
  const [nameA, nameB] = board.teamNames;
  const winsA = board.completedSets.filter(s => s.winner === 0).length;
  const winsB = board.completedSets.filter(s => s.winner === 1).length;

  return (
    <div style={S.wrap}>
      {/* 閲覧バッジ */}
      {!isEdit && (
        <div style={S.center}>
          <span style={S.badge}>👁 閲覧のみ</span>
        </div>
      )}

      {/* ヘッダー */}
      <div style={{ ...S.center, marginBottom: 28 }}>
        <p style={S.matchLabel}>3セットマッチ</p>
        <p style={S.setLabel}>
          {board.matchWinner !== null ? '試合終了' : `第 ${board.currentSet} セット`}
        </p>
      </div>

      {/* 勝利バナー */}
      {board.matchWinner !== null && (
        <div style={{
          ...S.center, padding: '16px 24px', borderRadius: 16, marginBottom: 24,
          background: board.teamColors[board.matchWinner] + '22',
          color: board.teamColors[board.matchWinner], fontSize: 20, fontWeight: 800,
        }}>
          🏆 {board.teamNames[board.matchWinner]} の勝利！
        </div>
      )}

      {/* スコア */}
      <div style={S.teamsGrid}>
        {/* チームA */}
        <div style={S.center}>
          <p style={S.teamName}>{nameA}</p>
          <p style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -4, marginBottom: 14, color: colorA }}>
            {board.currentScores[0]}
          </p>
          <div style={S.dotsRow}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 13, height: 13, borderRadius: '50%',
                background: i < winsA ? colorA : '#1e293b',
                border: `1.5px solid ${i < winsA ? colorA : '#334155'}`,
              }} />
            ))}
          </div>
          <p style={S.dotsLabel}>{winsA}セット取得</p>
          {isEdit && board.matchWinner === null && (
            <div style={S.btnRow}>
              <ScoreBtn onClick={() => editCallbacks.onScoreChange(0, -1)} color="#334155">−</ScoreBtn>
              <ScoreBtn onClick={() => editCallbacks.onScoreChange(0, 1)} color="#22c55e">＋</ScoreBtn>
            </div>
          )}
        </div>

        <div style={S.colon}>:</div>

        {/* チームB */}
        <div style={S.center}>
          <p style={S.teamName}>{nameB}</p>
          <p style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -4, marginBottom: 14, color: colorB }}>
            {board.currentScores[1]}
          </p>
          <div style={S.dotsRow}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 13, height: 13, borderRadius: '50%',
                background: i < winsB ? colorB : '#1e293b',
                border: `1.5px solid ${i < winsB ? colorB : '#334155'}`,
              }} />
            ))}
          </div>
          <p style={S.dotsLabel}>{winsB}セット取得</p>
          {isEdit && board.matchWinner === null && (
            <div style={S.btnRow}>
              <ScoreBtn onClick={() => editCallbacks.onScoreChange(1, -1)} color="#334155">−</ScoreBtn>
              <ScoreBtn onClick={() => editCallbacks.onScoreChange(1, 1)} color="#22c55e">＋</ScoreBtn>
            </div>
          )}
        </div>
      </div>

      {/* セット履歴 */}
      <div style={S.historyBox}>
        <p style={S.historyTitle}>セット履歴</p>
        {board.completedSets.map((set, i) => (
          <div key={i} style={i < board.completedSets.length - 1 ? S.historyRow : { ...S.historyRow, borderBottom: board.matchWinner === null ? '1px solid #0f172a' : 'none' }}>
            <span style={S.setName}>SET {i + 1}</span>
            <div style={S.scoresRow}>
              <span style={S.scoreNum(set.winner === 0 ? colorA : '#334155')}>{set.scores[0]}</span>
              <span style={S.sep}>−</span>
              <span style={S.scoreNum(set.winner === 1 ? colorB : '#334155')}>{set.scores[1]}</span>
            </div>
            <span style={S.winnerBadge(set.winner === 0 ? colorA : colorB)}>
              {board.teamNames[set.winner].slice(0, 6)}
            </span>
          </div>
        ))}
        {board.matchWinner === null && (
          <div style={{ ...S.historyRowLast, opacity: 0.6 }}>
            <span style={S.setName}>SET {board.currentSet}</span>
            <div style={S.scoresRow}>
              <span style={S.scoreNum('#94a3b8')}>{board.currentScores[0]}</span>
              <span style={S.sep}>−</span>
              <span style={S.scoreNum('#94a3b8')}>{board.currentScores[1]}</span>
            </div>
            <span style={{ fontSize: 12, color: '#475569', background: '#0f172a', padding: '2px 10px', borderRadius: 999 }}>
              進行中
            </span>
          </div>
        )}
      </div>

      {/* 編集アクション */}
      {isEdit && (
        <>
          <div style={S.actionsRow}>
            <button onClick={editCallbacks.onCopyUrl} style={S.btnCopy}>
              {editCallbacks.copied ? '✓ コピーしました' : '📋 閲覧URLをコピー'}
            </button>
            {board.matchWinner === null && (
              <button onClick={editCallbacks.onEndSet} style={S.btnEnd}>
                セット終了 →
              </button>
            )}
          </div>
          <div style={S.urlBox}>
            <p style={S.urlLabel}>編集URL（このページのURL）</p>
            <p style={S.urlText}>{editCallbacks.editUrl}</p>
          </div>
        </>
      )}

      {/* 閲覧: 更新インジケータ */}
      {!isEdit && (
        <p style={{ ...S.center, fontSize: 12, color: '#334155', marginTop: 20 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#22c55e', marginRight: 6, verticalAlign: 'middle',
            animation: 'pulse 2s infinite',
          }} />
          2秒ごとに自動更新
        </p>
      )}
    </div>
  );
}
