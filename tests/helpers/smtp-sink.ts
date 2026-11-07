import net from "node:net";

export type ReceivedEmail = { from: string; to: string[]; subject: string; text: string; html: string; raw: string };

function decodeQuotedPrintable(input: string): string {
  const joined = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  for (let i = 0; i < joined.length; i++) {
    const ch = joined[i]!;
    if (ch === "=" && /^[0-9A-Fa-f]{2}$/.test(joined.slice(i + 1, i + 3))) {
      bytes.push(parseInt(joined.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(...Buffer.from(ch, "utf8"));
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

function decodeBody(headers: string, body: string): string {
  const enc = /content-transfer-encoding:\s*([^\r\n;]+)/i.exec(headers)?.[1]?.trim().toLowerCase();
  if (enc === "quoted-printable") return decodeQuotedPrintable(body);
  if (enc === "base64") return Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
  return body;
}

function splitHeaders(part: string): [string, string] {
  const i = part.search(/\r?\n\r?\n/);
  if (i < 0) return [part, ""];
  const sep = /\r?\n\r?\n/.exec(part.slice(i))![0];
  return [part.slice(0, i), part.slice(i + sep.length)];
}

export function parseEmail(raw: string): Pick<ReceivedEmail, "subject" | "text" | "html"> {
  const [headers, body] = splitHeaders(raw);
  const unfolded = headers.replace(/\r?\n[ \t]+/g, " ");
  const rawSubject = /^subject:\s*(.*)$/im.exec(unfolded)?.[1] ?? "";
  const subject = rawSubject.replace(/=\?utf-8\?([bq])\?([^?]*)\?=/gi, (_m, kind: string, data: string) =>
    kind.toLowerCase() === "b" ? Buffer.from(data, "base64").toString("utf8") : decodeQuotedPrintable(data.replace(/_/g, " ")),
  );
  const boundary = /boundary="?([^";\r\n]+)"?/i.exec(unfolded)?.[1];
  let text = "";
  let html = "";
  if (boundary) {
    for (const part of body.split(`--${boundary}`)) {
      const [ph, pb] = splitHeaders(part.replace(/^\r?\n/, ""));
      if (/content-type:\s*text\/plain/i.test(ph)) text = decodeBody(ph, pb);
      if (/content-type:\s*text\/html/i.test(ph)) html = decodeBody(ph, pb);
    }
  } else if (/content-type:\s*text\/html/i.test(headers)) {
    html = decodeBody(headers, body);
  } else {
    text = decodeBody(headers, body);
  }
  return { subject, text, html };
}

/** A tiny real SMTP server (no TLS, no auth) that records every message it is given. */
export async function startSmtpSink() {
  const received: ReceivedEmail[] = [];
  const sockets = new Set<net.Socket>();

  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => undefined);
    let buffer = "";
    let inData = false;
    let data = "";
    let from = "";
    let to: string[] = [];
    socket.write("220 sink ESMTP\r\n");

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end < 0) return;
          data += buffer.slice(0, end);
          buffer = buffer.slice(end + 5);
          inData = false;
          const raw = data.replace(/^\./gm, "");
          received.push({ from, to, raw, ...parseEmail(raw) });
          data = "";
          socket.write("250 OK queued\r\n");
          continue;
        }
        const eol = buffer.indexOf("\r\n");
        if (eol < 0) return;
        const line = buffer.slice(0, eol);
        buffer = buffer.slice(eol + 2);
        const cmd = line.slice(0, 4).toUpperCase();
        if (cmd === "EHLO") socket.write("250-sink\r\n250 8BITMIME\r\n");
        else if (cmd === "HELO") socket.write("250 sink\r\n");
        else if (cmd === "MAIL") {
          from = /<([^>]*)>/.exec(line)?.[1] ?? "";
          to = [];
          socket.write("250 OK\r\n");
        } else if (cmd === "RCPT") {
          to.push(/<([^>]*)>/.exec(line)?.[1] ?? "");
          socket.write("250 OK\r\n");
        } else if (cmd === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (cmd === "QUIT") {
          socket.write("221 Bye\r\n");
          socket.end();
        } else if (cmd === "RSET" || cmd === "NOOP") socket.write("250 OK\r\n");
        else socket.write("502 Not implemented\r\n");
      }
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as net.AddressInfo).port;

  return {
    port,
    received,
    /** Waits until `count` messages exist (or fails). */
    async waitFor(count: number, timeoutMs = 8000) {
      const start = Date.now();
      while (received.length < count) {
        if (Date.now() - start > timeoutMs) throw new Error(`expected ${count} email(s), got ${received.length}`);
        await new Promise((r) => setTimeout(r, 50));
      }
      return received;
    },
    async stop() {
      for (const s of sockets) s.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
