import * as fs from "node:fs";
import { readdir } from "node:fs/promises";

export const build = async () => {
  const outdir = __dirname + "/../dist";

  try {
    fs.rmdirSync(outdir, { recursive: true });
  } catch (err) { }

  //
  // build index
  {
    const result = await Bun.build({
      entrypoints: [__dirname + "/../src/index.ts"],
      outdir,
      loader: { ".vert": "text", ".frag": "text" },
    });

    if (!result.success) {
      console.log(...result.logs);
      throw new Error("build failed");
    }
  }

  //
  // copy index html
  {
    const htmlContent = await Bun.file(__dirname + "/../src/index.html").text();
    Bun.write(outdir + "/index.html", htmlContent);
  }

  //
  // copy public dir
  {
    const publicdir = __dirname + "/../public";
    for (const f of await readdir(publicdir, { recursive: true })) {
      const file = Bun.file(publicdir + "/" + f);
      if (await file.exists()) await Bun.write(outdir + "/" + f, file);
    }
  }
};
