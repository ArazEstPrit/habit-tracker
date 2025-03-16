import StudyHabitJSON from "@core/Json/StudyHabitJSON.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import Habit from "./Habit.js";

export default class StudyHabit extends Habit {
	private _topic: TopicTreeNode;
	private _dynamic: boolean;
	private _length: number;

	constructor(
		name: string,
		id: string,
		description: string,
		color: number,
		days: boolean[],
		time: string,
		topic: TopicTreeNode,
		dynamic: boolean,
		length: number
	) {
		super(name, id, description, color, days, time);

		this._dynamic = dynamic;

		this._topic = topic;

		this.validateLength(length);
		this._length = length;

		this._type = "study";
	}

	private validateLength(length: number): void {
		if (length < 0) throw new Error("Invalid length");
	}

	public get topic(): TopicTreeNode {
		return this._topic;
	}

	public get dynamic(): boolean {
		return this._dynamic;
	}

	public get length(): number {
		return this._length;
	}

	public set topic(topic: TopicTreeNode) {
		this._topic = topic;
	}

	public set dynamic(dynamic: boolean) {
		this._dynamic = dynamic;
	}

	public set length(length: number) {
		this.validateLength(length);
		this._length = length;
	}

	public toJSON(): StudyHabitJSON {
		return {
			...super.toJSON(),
			topic: this._topic?.toJSON() || null,
			dynamic: this._dynamic,
			length: this._length,
		};
	}

	public static fromJSON(json: StudyHabitJSON): StudyHabit {
		return new StudyHabit(
			json.name,
			json.id,
			json.description,
			json.color,
			json.days,
			json.time,
			TopicTreeNode.fromJSON(json.topic),
			json.dynamic,
			json.length
		);
	}
}
