import StudyHabit from "@core/habits/StudyHabit.js";
import StudyHabitLogJSON from "@core/Json/StudyHabitLogJSON.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import HabitLog from "./HabitLog.js";

export default class StudyHabitLog extends HabitLog {
	private _topic: TopicTreeNode;
	private _performance: number;

	constructor(
		habit: StudyHabit,
		id: string,
		date: Date,
		performance: number,
		topic: TopicTreeNode
	) {
		super(habit, id, date);

		this.validatePerformance(performance);
		this._performance = performance;

		this._topic = topic;
	}

	private validatePerformance(difficulty: number): void {
		if (isNaN(difficulty)) {
			throw new Error("Difficulty must be a number");
		} else if (difficulty < 0 || difficulty > 5) {
			throw new Error("Difficulty must be between 0 and 5");
		}
	}

	public get topic() {
		return this._topic;
	}

	public get performance() {
		return this._performance;
	}

	public set topic(topic: TopicTreeNode) {
		this._topic = topic;
	}

	public set performance(performance: number) {
		this._performance = performance;
	}

	public toJSON(): StudyHabitLogJSON {
		return {
			...super.toJSON(),
			habit: super.habit.toJSON() as StudyHabit,
			performance: this._performance,
			topic: this._topic?.toJSON(),
		};
	}

	public static fromJSON(json: StudyHabitLogJSON): StudyHabitLog {
		return new StudyHabitLog(
			StudyHabit.fromJSON(json.habit),
			json.id,
			new Date(json.date),
			json.performance,
			TopicTreeNode.fromJSON(json.topic)
		);
	}
}
