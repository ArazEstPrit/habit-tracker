import dgram from "dgram";

const UDP_PORT = 50300;
const BROADCAST_ADDR = "255.255.255.255";
const DISCOVERY_TIMEOUT = 500;

export class DiscoveryService {
	private socket = dgram.createSocket("udp4");

	constructor(
		private getUserIdentifier: () => string | undefined
	) {
		this.initializeSocket();
	}

	private initializeSocket() {
		this.socket.bind(UDP_PORT, "0.0.0.0", () => {
			this.socket.setBroadcast(true);
			console.log(`[DiscoveryService] Listening on UDP port ${UDP_PORT}`);
		});
	}

	public startListening() {
		this.socket.on("message", (msg, rinfo) => {
			const [messageType, requesterId] = msg.toString().split("|");

			if (messageType === "DISCOVER_USER_SERVERS") {
				const currentUserId = this.getUserIdentifier();

				if (currentUserId) {
					console.log(
						`[DiscoveryService] Received message from ${rinfo.address}: ${messageType}|${requesterId}`
					);

					this.sendResponse(
						rinfo.address,
						`USER_SERVER_HERE|${currentUserId}`
					);
				}
			}
		});
	}

	public async findServersWithUsers(): Promise<string[]> {
		return this.discover("DISCOVER_USER_SERVERS", (msg, rinfo) => {
			const [message, userId] = msg.toString().split("|");
			console.log(
				`[DiscoveryService] Received message from ${rinfo.address}: ${message}|${userId}`
			);

			return message === "USER_SERVER_HERE" && userId
				? rinfo.address
				: null;
		});
	}

	private async discover<T>(
		message: string,
		filter: (msg: Buffer, rinfo: dgram.RemoteInfo) => T | null
	): Promise<T[]> {
		return new Promise(resolve => {
			const results: T[] = [];
			const timer = setTimeout(() => resolve(results), DISCOVERY_TIMEOUT);

			this.socket.removeAllListeners("message");
			this.socket.on("message", (msg, rinfo) => {
				const result = filter(msg, rinfo);
				if (result !== null && !results.includes(result)) {
					results.push(result);
				}
			});

			this.sendBroadcast(message);
		});
	}

	private sendBroadcast(message: string) {
		const buffer = Buffer.from(message);
		this.socket.send(
			buffer,
			0,
			buffer.length,
			UDP_PORT,
			BROADCAST_ADDR,
			err => {
				if (err)
					console.error(`[DiscoveryService] Broadcast error: ${err}`);
			}
		);
	}

	private sendResponse(address: string, message: string) {
		this.socket.send(message, UDP_PORT, address, err => {
			if (err) console.error(`[DiscoveryService] Response error: ${err}`);
		});
	}
}
