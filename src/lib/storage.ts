import type { Board } from './types';

const EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;
const IS_VERCEL = process.env.VERCEL === '1';

// ── Local filesystem (development) ──
async function getLocalBoard(id: string): Promise<Board | null> {
  const { readFile } = await import('fs/promises');
  const { join } = await import('path');
  try {
    const content = await readFile(join(process.cwd(), 'data', `${id}.json`), 'utf8');
    return JSON.parse(content) as Board;
  } catch {
    return null;
  }
}

async function saveLocalBoard(board: Board): Promise<void> {
  const { mkdir, writeFile } = await import('fs/promises');
  const { join } = await import('path');
  const dir = join(process.cwd(), 'data');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${board.id}.json`), JSON.stringify(board), 'utf8');
}

// ── Vercel Blob (production) ──
// private access = no CDN cache → fresh reads every time
async function getBlobBoard(id: string): Promise<Board | null> {
  const { get } = await import('@vercel/blob');
  try {
    const result = await get(`boards/${id}.json`, { access: 'private' });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as Board;
  } catch {
    return null;
  }
}

async function saveBlobBoard(board: Board): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(`boards/${board.id}.json`, JSON.stringify(board), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ── Public API ──
export async function getBoard(id: string): Promise<Board | null> {
  if (!/^[0-9a-f]{8}$/.test(id)) return null;
  const board = IS_VERCEL ? await getBlobBoard(id) : await getLocalBoard(id);
  if (!board) return null;
  if (Date.now() - new Date(board.createdAt).getTime() > EXPIRY_MS) return null;
  return board;
}

export async function saveBoard(board: Board): Promise<void> {
  if (IS_VERCEL) await saveBlobBoard(board);
  else await saveLocalBoard(board);
}
