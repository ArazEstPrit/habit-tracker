import HabitJSON from "@core/Json/HabitJSON.js";

export default class Habit {
	private _id: string;
	protected _type = "standard";
	private _name: string;
	private _description: string;
	private _color: number;
	private _days: boolean[];
	private _time: string;

	constructor(
		name: string,
		id: string,
		description: string,
		color: number,
		days: boolean[],
		time: string
	) {
		this.validateId(id);
		this.validateName(name);
		this.validateColor(color);
		this.validateDays(days);

		this._name = name;
		this._id = id;
		this._description = description;
		this._color = color;
		this._days = days;
		this._time = time;
	}

	private validateId(id: string): void {
		if (!id) throw new Error("Habit id cannot be empty");
	}

	private validateName(name: string): void {
		if (!name) throw new Error("Habit name cannot be empty");
	}

	private validateColor(color: number): void {
		if (color < -1 || color > 8) throw new Error("Invalid color");
	}

	private validateDays(days: boolean[]): void {
		if (days.length !== 7)
			throw new Error("Invalid number of days (should be 7)");
		if (days.filter(day => day).length === 0)
			throw new Error("Habit must have at least one day");
	}

	get id() {
		return this._id;
	}

	get type() {
		return this._type;
	}

	get name() {
		return this._name;
	}

	get description() {
		return this._description;
	}

	get color() {
		return this._color;
	}

	get days() {
		return this._days;
	}

	get time() {
		return this._time;
	}

	set id(id: string) {
		this._id = id;
	}

	set name(name: string) {
		this.validateName(name);
		this._name = name;
	}

	set description(description: string) {
		this._description = description;
	}

	set color(color: number) {
		this.validateColor(color);
		this._color = color;
	}

	set days(days: boolean[]) {
		this.validateDays(days);
		this._days = days;
	}

	set time(time: string) {
		this._time = time;
	}

	// Convert to JSON
	public toJSON(): HabitJSON {
		return {
			type: this._type, // Important for deserialization
			id: this._id,
			name: this._name,
			description: this._description,
			color: this._color,
			days: this._days,
			time: this._time,
		};
	}

	// Deserialize from JSON and return the correct Habit subclass
	public static fromJSON(json: HabitJSON): Habit {
		return new Habit(
			json.name,
			json.id,
			json.description,
			json.color,
			json.days,
			json.time
		);
	}
}
