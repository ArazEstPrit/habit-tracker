import { WebSocket, WebSocketServer } from "ws";
import UserService from "@application/services/UserService.js";
import User from "@core/user/User.js";
import { EventEmitter } from "events";
import { DiscoveryService } from "./DiscoveryService.js";

const DEFAULT_PORT = 8381;

export class SyncService extends EventEmitter {
	private wsServer?: WebSocketServer;
	private peers = new Set<WebSocket>();
	private isSyncing = false;
	public discovery: DiscoveryService;

	constructor(private port = DEFAULT_PORT) {
		super();
		this.discovery = new DiscoveryService(() => UserService.getUser()?.id);
		this.initialize();
	}

	private initialize() {
		UserService.on("change", msg => {
			if (msg.id === "refreshUser")
				this.handleUserChange(UserService.getUser());
		});
		UserService.on("register", () => this.initNetwork());
		this.initNetwork();
	}

	private async initNetwork() {
		const currentUser = UserService.getUser();
		if (currentUser) {
			console.log(
				`[SyncService] Initializing network for user ${currentUser?.id}`
			);
			const existingServers = await this.discovery.findServersWithUsers();
			existingServers.forEach(ip =>
				this.connectToPeer(`ws://${ip}:${this.port}`)
			);
			// if (existingServers.length === 0) {
			this.startServer();
			// }
			this.discovery.startListening();
		}
	}

	public findServersWithUsers(): Promise<string[]> {
		return this.discovery.findServersWithUsers();
	}

	private startServer() {
		if (!UserService.getUser()) return;

		console.log("[SyncService] Starting WebSocket server");
		this.wsServer = new WebSocketServer({
			port: this.port,
			host: "0.0.0.0",
		});
		this.wsServer.on("connection", socket =>
			this.handleNewConnection(socket)
		);
	}

	private handleDiscoveredServer(ip: string) {
		if (UserService.getUser()) {
			this.connectToPeer(`ws://${ip}:${this.port}`);
		}
	}

	private handleNewConnection(socket: WebSocket) {
		socket.once("message", data => {
			try {
				const remoteUser = User.fromJSON(JSON.parse(data.toString()));
				if (!this.validateUser(remoteUser)) {
					socket.close();
					return;
				}
				this.addPeer(socket);
				this.setupSocketListeners(socket);
				this.sendCurrentUser(socket);
			} catch (error) {
				socket.close();
			}
		});
	}

	private validateUser(remoteUser: User): boolean {
		const localUser = UserService.getUser();
		return !!localUser && localUser.id === remoteUser.id;
	}

	public connectToPeer(peerUrl: string) {
		// if (!UserService.getUser()) return;

		console.log(`[SyncService] Connecting to ${peerUrl}`);
		const ws = new WebSocket(peerUrl);

		ws.once("open", () => this.sendCurrentUser(ws));
		ws.once("message", data => {
			try {
				const remoteUser = User.fromJSON(JSON.parse(data.toString()));
				if (!this.validateUser(remoteUser)) {
					ws.close();
					return;
				}
				this.addPeer(ws);
				this.setupSocketListeners(ws);
			} catch (error) {
				ws.close();
			}
		});

		ws.on("error", err => this.handlePeerError(ws, err));
	}

	private sendCurrentUser(socket: WebSocket) {
		const user = UserService.getUser();
		if (user && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(user.toJSON()));
		}
	}

	private addPeer(ws: WebSocket) {
		this.peers.add(ws);
		ws.on("close", () => this.peers.delete(ws));
		this.sendUser(UserService.getUser());
	}

	private setupSocketListeners(socket: WebSocket) {
		socket.on("message", data => this.handleIncomingData(data.toString()));
	}

	private handlePeerError(ws: WebSocket, err: Error) {
		console.error(`[SyncService] Connection error: ${err.message}`);
		this.peers.delete(ws);
	}

	private handleUserChange(user: User) {
		if (!this.isSyncing) {
			this.sendUser(user);
		}
	}

	private sendUser(user: User) {
		if (this.isSyncing) return;

		this.isSyncing = true;
		try {
			const data = JSON.stringify(user.toJSON());
			Array.from(this.peers)
				.filter(peer => peer.readyState === WebSocket.OPEN)
				.forEach(peer => peer.send(data));
			console.log("[SyncService] User data sent");
		} finally {
			this.isSyncing = false;
		}
	}

	private handleIncomingData(data: string) {
		if (this.isSyncing || !UserService.getUser()) return;

		try {
			const remoteUser = User.fromJSON(JSON.parse(data));
			const localUser = UserService.getUser();

			if (!localUser || localUser.id !== remoteUser.id) {
				return;
			}

			this.resolveConflict(localUser, remoteUser);
		} catch (error) {
			console.error(`[SyncService] Data error: ${error}`);
		}
	}

	private resolveConflict(local: User, remote: User) {
		this.isSyncing = true;
		try {
			// Just in case the 2 users have the same version, use the remote one
			if (remote.version >= local.version) {
				console.log(
					"[SyncService] Remote: " +
						remote.version +
						", Local: " +
						local.version +
						". Adopting remote user"
				);
				UserService.setUser(remote);
			} else if (remote.version < local.version) {
				console.log(
					"[SyncService] Remote: " +
						remote.version +
						", Local: " +
						local.version +
						". Adopting local user"
				);
				this.sendUser(local);
			}
		} finally {
			this.isSyncing = false;
		}
	}

	// Used by User selection dialog. Creates a new user with the same ID as the
	// target one. We then restart the sync service.
	public setNewUser(id: string): void {
		UserService.setUser(new User(id, id, [], [], [], 0, []));

		this.initNetwork();
	}
}

export default new SyncService();
