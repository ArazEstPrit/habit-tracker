import GradualHabit from "@core/habits/GradualHabit.js";
import GradualHabitJSON from "@core/Json/GradualHabitJSON.js";
import GradualHabitLogJSON from "@core/Json/GradualHabitLogJSON.js";
import HabitLog from "./HabitLog.js";

export default class GradualHabitLog extends HabitLog {
	private _progress: number;

	constructor(habit: GradualHabit, id: string, date: Date, progress: number) {
		super(habit, id, date);

		this.validateProgress(progress);

		this._progress = progress;
	}

	private validateProgress(progress: number): void {
		if (isNaN(progress)) {
			throw new Error("Progress must be a number");
		} else if (
			progress < 0 ||
			progress > (this.habit as GradualHabit).goal
		) {
			throw new Error("Progress must be between 0 and goal");
		}
	}

	public get progress(): number {
		return this._progress;
	}

	public set progress(value: number) {
		this.validateProgress(value);
		this._progress = value;
	}

	public isCompleted(): boolean {
		return this.progress == (this.habit as GradualHabit).goal;
	}

	public toJSON(): GradualHabitLogJSON {
		return {
			...super.toJSON(),
			habit: super.habit.toJSON() as GradualHabitJSON,
			progress: this.progress,
		};
	}

	public static fromJSON(json: GradualHabitLogJSON): GradualHabitLog {
		if (!("goal" in json.habit))
			throw new Error("Missing progress property");

		const gradualHabitJson: GradualHabitJSON = {
			...json.habit,
			goal: json.habit.goal as number,
		};

		return new GradualHabitLog(
			GradualHabit.fromJSON(gradualHabitJson),
			json.id,
			new Date(json.date),
			json.progress
		);
	}
}
