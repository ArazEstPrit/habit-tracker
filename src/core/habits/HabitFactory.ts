import GradualHabitJSON from "@core/Json/GradualHabitJSON.js";
import HabitJSON from "@core/Json/HabitJSON.js";
import StudyHabitJSON from "@core/Json/StudyHabitJSON.js";
import GradualHabit from "./GradualHabit.js";
import Habit from "./Habit.js";
import StudyHabit from "./StudyHabit.js";

export default class HabitFactory {
	static createHabit(json: HabitJSON): Habit | GradualHabit | StudyHabit {
		switch (json.type) {
			case "gradual":
				return this.createGradualHabit(json as GradualHabitJSON);
			case "study": {
				return this.createStudyHabit(json as StudyHabitJSON);
			}
			default:
				return this.createStandardHabit(json);
		}
	}

	static createStandardHabit(json: HabitJSON): Habit {
		return Habit.fromJSON(json);
	}

	static createGradualHabit(json: GradualHabitJSON): GradualHabit {
		if (!("goal" in json))
			throw new Error(
				"Invalid gradual habit JSON: missing goal property"
			);

		return GradualHabit.fromJSON(json);
	}

	static createStudyHabit(json: StudyHabitJSON): StudyHabit {
		if (!("topic" in json))
			throw new Error("Invalid study habit JSON: missing topic property");

		if (!("dynamic" in json))
			throw new Error(
				"Invalid study habit JSON: missing dynamic property"
			);

		if (!("length" in json))
			throw new Error(
				"Invalid study habit JSON: missing length property"
			);

		return StudyHabit.fromJSON(json);
	}
}
