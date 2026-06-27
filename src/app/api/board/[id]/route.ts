import { NextRequest, NextResponse } from 'next/server';
import { getBoard, saveBoard } from '@/lib/storage';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const board = await getBoard(id);
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { editKey: _k, ...pub } = board;
  return NextResponse.json(pub);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const board = await getBoard(id);
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { editKey, action, teamIndex, scores } = await req.json();
  if (editKey !== board.editKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  if (board.matchWinner !== null) {
    return NextResponse.json({ error: 'Match finished' }, { status: 400 });
  }

  switch (action) {
    case 'set_scores':
      if (Array.isArray(scores) && scores.length === 2) {
        board.currentScores = [
          Math.max(0, Math.min(99, Math.round(Number(scores[0])))),
          Math.max(0, Math.min(99, Math.round(Number(scores[1])))),
        ];
      }
      break;
    case 'score_up':
      if (teamIndex === 0 || teamIndex === 1)
        board.currentScores[teamIndex] = Math.min(99, board.currentScores[teamIndex] + 1);
      break;
    case 'score_down':
      if (teamIndex === 0 || teamIndex === 1)
        board.currentScores[teamIndex] = Math.max(0, board.currentScores[teamIndex] - 1);
      break;
    case 'end_set': {
      const [s0, s1] = board.currentScores;
      const winner: 0 | 1 = s0 >= s1 ? 0 : 1;
      board.completedSets.push({ scores: [s0, s1], winner });
      const w0 = board.completedSets.filter(s => s.winner === 0).length;
      const w1 = board.completedSets.filter(s => s.winner === 1).length;
      if (w0 >= 2) board.matchWinner = 0;
      else if (w1 >= 2) board.matchWinner = 1;
      else { board.currentSet += 1; board.currentScores = [0, 0]; }
      break;
    }
  }

  await saveBoard(board);
  const { editKey: _k, ...pub } = board;
  return NextResponse.json(pub);
}
