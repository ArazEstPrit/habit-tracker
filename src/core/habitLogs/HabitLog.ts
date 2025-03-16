import Habit from "@core/habits/Habit.js";
import HabitFactory from "@core/habits/HabitFactory.js";
import HabitLogJSON from "@core/Json/HabitLogJSON.js";

export default class HabitLog {
	private _id: string;
	private _habit: Habit;
	private _date: Date;

	constructor(habit: Habit, id: string, date: Date) {
		this._habit = habit;
		this.validateId(id);
		this._id = id;
		this._date = date;
	}

	private validateId(id: string): void {
		if (!id) {
			throw new Error("Id cannot be empty");
		}
	}

	public get id(): string {
		return this._id;
	}

	public get habit(): Habit {
		return this._habit;
	}

	public get date(): Date {
		return this._date;
	}

	public set id(id: string) {
		this.validateId(id);
		this._id = id;
	}

	public set habit(habit: Habit) {
		this._habit = habit;
	}

	public set date(date: Date) {
		this._date = date;
	}

	public isCompleted(): boolean {
		return true;
	}

	public toJSON(): HabitLogJSON {
		return {
			id: this._id,
			habit: this._habit,
			date: this._date,
		};
	}

	public static fromJSON(json: HabitLogJSON): HabitLog {
		return new HabitLog(
			HabitFactory.createHabit(json.habit),
			json.id,
			new Date(json.date)
		);
	}
}
