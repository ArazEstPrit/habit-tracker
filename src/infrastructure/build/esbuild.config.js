export default {
	entryPoints: ["./src/main.ts"],
	bundle: true,
	outdir: "./dist/",
	format: "esm",
	platform: "node",
	packages: "external",
	metafile: true,
	logLevel: "warning",
	sourcemap: true,
};
