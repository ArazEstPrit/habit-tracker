import { Request, Response } from "express";

export default class SSEMiddleware {
	private static readonly clients: Set<Response> = new Set();

	static createHandler(req: Request, res: Response) {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		console.log("Client connected to SSE");
		this.clients.add(res);

		this.notifyClients({ type: "hidden", id: "init", message: "" });

		req.on("close", () => {
			console.log("Client disconnected from SSE");
			this.clients.delete(res);
		});
	}

	static notifyClients(data: { type: string; message: string; id?: string }) {
		Array.from(this.clients).map(client =>
			client.write("data: " + JSON.stringify(data) + "\n\n")
		);
	}
}
