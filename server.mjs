import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./dist-latest/", import.meta.url));
const port = Number(process.env.PORT || 5174);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const normalizedPath = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
    const filePath = join(root, normalizedPath);
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    const fallback = await readFile(join(root, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(fallback);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Quvoryx Finance Prototype running at http://127.0.0.1:${port}`);
});
