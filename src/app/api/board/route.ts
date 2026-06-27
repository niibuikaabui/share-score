import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { saveBoard } from '@/lib/storage';
import type { Board } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { teamNames, teamColors } = await req.json();
    if (!Array.isArray(teamNames) || !Array.isArray(teamColors)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const id = randomBytes(4).toString('hex');
    const editKey = randomBytes(8).toString('hex');

    const board: Board = {
      id,
      editKey,
      createdAt: new Date().toISOString(),
      teamNames: [
        String(teamNames[0] || 'チームA').slice(0, 20),
        String(teamNames[1] || 'チームB').slice(0, 20),
      ],
      teamColors: [
        String(teamColors[0] || '#ef4444'),
        String(teamColors[1] || '#3b82f6'),
      ],
      currentSet: 1,
      currentScores: [0, 0],
      completedSets: [],
      matchWinner: null,
    };

    await saveBoard(board);
    return NextResponse.json({ id, editKey });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
