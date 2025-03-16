/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec } from "child_process";
import { context } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import express, { Express } from "express";
import { Server } from "http";
import { resolve } from "path";
import UserService from "@application/services/UserService.js";
import SSEMiddleware from "../middleware/sseMiddleware.js";
import { createUserRoutes } from "../routes/UserRoutes.js";

export default class ServerController {
	private app: Express;
	private server: Server;

	private srcPath = resolve(import.meta.dirname, "../src/presentation/");
	private distPath = resolve(import.meta.dirname, "../dist/");
	private publicPath = resolve(import.meta.dirname, "../public/");

	constructor(
		private port: number,
		open: boolean = true
	) {
		this.app = express();

		this.app.use(express.json());

		this.app.use("/api/sse", (req, res) =>
			SSEMiddleware.createHandler(req, res)
		);

		this.app.use("/api", createUserRoutes());

		this.app.use("/dist", express.static(this.distPath));
		this.app.use("/public", express.static(this.publicPath));

		this.app.get(/\/((?!api).)*/, (req, res) =>
			res.sendFile(resolve(this.publicPath, "./index.html"))
		);

		this.build().then(() => {
			this.start();
			open ? this.open() : null;
		});

		UserService.on("change", ({ message, id, type }) => {
			SSEMiddleware.notifyClients({ message, type, id });
		});
	}

	start(): void {
		this.server = this.app.listen(this.port, () => {
			console.log(`Server listening on port ${this.port}`);
		});
	}

	open(): void {
		const openCommand = {
			win32: "start",
			linux: "xdg-open",
			darwin: "open",
		}[process.platform];

		exec(`${openCommand} http://localhost:${this.port}/`);
	}

	stop(): void {
		this.server.close();
		console.log("Server closed");
	}

	async build() {
		const ctx = await context({
			entryPoints: [resolve(this.srcPath, "./main.tsx")],
			plugins: [sassPlugin()],
			bundle: true,
			outdir: resolve(this.distPath, "./views"),
			// platform: "browser",
			target: "chrome58",
			format: "esm",
			logLevel: "error",
			sourcemap: true,
		});
		return ctx.watch();
	}
}
