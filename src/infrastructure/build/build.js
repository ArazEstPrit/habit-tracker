import { build, context } from "esbuild";
import buildOptions from "./esbuild.config.js";

if (process.argv.includes("--watch")) {
	(await context(buildOptions)).watch();
} else {
	console.log(
		(await build(buildOptions).catch(() => process.exit(1))).metafile
	);
}
