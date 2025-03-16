import BadgeJSON from "@core/Json/badgeJSON.js";
import User from "./User.js";

export default class Badge {
	private _name: string;
	private _description: string;
	private _reward: number;
	private _goal: number;
	private _checkProgress: (user: User) => number;

	constructor(
		name: string,
		description: string,
		reward: number,
		goal: number,
		checkProgress: (user: User) => number
	) {
		this._name = name;
		this._description = description;
		this._reward = reward;
		this._goal = goal;
		this._checkProgress = checkProgress;
	}

	public get name(): string {
		return this._name;
	}

	public get description(): string {
		return this._description;
	}

	public get reward(): number {
		return this._reward;
	}

	public get goal(): number {
		return this._goal;
	}

	public get checkProgress(): (user: User) => number {
		return this._checkProgress;
	}

	public checkCondition(user: User): boolean {
		return this.checkProgress(user) >= this.goal;
	}

	public toJSON(): BadgeJSON {
		// This will only be used to send badge info to the user.
		// We only need to display these values to the user.
		return {
			name: this.name,
			description: this.description,
			reward: this.reward,
			progress: 0,
		};
	}
}
