import { green } from "https://deno.land/std@0.91.0/fmt/colors.ts";
import { exists } from "https://deno.land/std@0.91.0/fs/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v6.5.0/mod.ts";
import logger from "https://deno.land/x/oak_logger/mod.ts";
import { transform } from "https://cdn.skypack.dev/sucrase";

const router = new Router();

// Menu Page
router.get("/", async (context) => {
  const projectRoot = `${Deno.cwd()}/projects`;
  const projects = [];
  for await (const project of Deno.readDir(projectRoot)) {
    projects.push(project.name);
  }

  context.response.body = await renderFileToString(
    `${Deno.cwd()}/app/index.ejs`,
    {
      projects,
    },
  );

  context.response.type = "html";
});

// Project Page
router.get("/projects/:name/index.html", async (context) => {
  context.response.body = await renderFileToString(
    `${Deno.cwd()}/projects/${context.params.name}/index.ejs`,
    {
      project: context.params.name,
    },
  );

  context.response.type = "html";
});

const app = new Application();

app.use(logger.logger);
app.use(logger.responseTime);

app.use(router.routes());
app.use(router.allowedMethods());

// Static assets
app.use(async (context, next) => {
  await next();
  const projectRoot = `${Deno.cwd()}`;
  const pathName = context.request.url.pathname;
  const filePath = `${projectRoot}${pathName}`;

  // Use Sucrase to transform typescript to javascript on the fly
  if (pathName.endsWith(".ts") && await exists(filePath)) {
    const fileContents = await Deno.readTextFile(filePath);
    try {
      const transformed = transform(fileContents, {
        transforms: ["typescript"],
      });
      context.response.body = transformed.code;
      context.response.headers.set("Content-type", "text/javascript");
    } catch (e) {
      console.error(e);
    }
  } else {
    await send(context, context.request.url.pathname, {
      root: projectRoot,
    });
  }
});

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    green(`🧙 Gamedev Projects listening on: ${hostname}:${port}`),
  );
});

await app.listen({ hostname: "127.0.0.1", port: 8000 });
