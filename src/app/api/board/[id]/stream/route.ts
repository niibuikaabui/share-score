import { getBoard } from '@/lib/storage';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (line: string) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(line)); } catch { closed = true; }
      };

      // 初回：現在の状態を即座に送信
      const initial = await getBoard(id);
      if (!initial) {
        send('event: notfound\ndata: {}\n\n');
        controller.close();
        return;
      }
      const { editKey: _k1, ...initialPub } = initial;
      let lastJson = JSON.stringify(initialPub);
      send(`data: ${lastJson}\n\n`);

      // 1秒ごとにBlob確認、変化があればプッシュ（最大25秒）
      const deadline = Date.now() + 25000;
      while (!closed && Date.now() < deadline) {
        await new Promise<void>(r => setTimeout(r, 1000));
        if (closed) break;
        try {
          const b = await getBoard(id);
          if (!b) break;
          const { editKey: _k2, ...pub } = b;
          const json = JSON.stringify(pub);
          if (json !== lastJson) {
            lastJson = json;
            send(`data: ${json}\n\n`);
          }
        } catch {
          break;
        }
      }

      try { controller.close(); } catch { /* already closed */ }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
