import chokidar from "chokidar";
import { build } from "./builder";

chokidar
  .watch(__dirname + "/../src")
  .on("all", () => build().catch(console.error));

Bun.serve({
  fetch(req) {
    let { pathname } = new URL(req.url);
    if (pathname === "/") pathname = "/index.html";
    return new Response(Bun.file(__dirname + "/../dist" + pathname));
  },
});
