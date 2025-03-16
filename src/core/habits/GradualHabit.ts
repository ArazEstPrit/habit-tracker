import GradualHabitJSON from "@core/Json/GradualHabitJSON.js";
import Habit from "./Habit.js";

export default class GradualHabit extends Habit {
	private _goal: number;

	constructor(
		name: string,
		id: string,
		description: string,
		color: number,
		days: boolean[],
		time: string,
		goal: number
	) {
		super(name, id, description, color, days, time);

		this.validateGoal(goal);

		this._goal = goal;
		this._type = "gradual";
	}

	private validateGoal(goal: number): void {
		if (goal <= 0) throw new Error("Invalid goal");
	}

	public get goal(): number {
		return this._goal;
	}

	public set goal(value: number) {
		this.validateGoal(value);
		this._goal = value;
	}

	public toJSON(): GradualHabitJSON {
		return {
			...super.toJSON(), // Include base Habit properties
			goal: this._goal,
		};
	}

	public static fromJSON(json: GradualHabitJSON): GradualHabit {
		return new GradualHabit(
			json.name,
			json.id,
			json.description,
			json.color,
			json.days,
			json.time,
			json.goal
		);
	}
}
