import GradualHabitLogJSON from "@core/Json/GradualHabitLogJSON.js";
import HabitLogJSON from "@core/Json/HabitLogJSON.js";
import StudyHabitLogJSON from "@core/Json/StudyHabitLogJSON.js";
import GradualHabitLog from "./GradualHabitLog.js";
import HabitLog from "./HabitLog.js";
import StudyHabitLog from "./StudyHabitLog.js";

export default class HabitLogFactory {
	static createHabitLog(
		json: HabitLogJSON | GradualHabitLogJSON | StudyHabitLogJSON
	): HabitLog | GradualHabitLog | StudyHabitLog {
		switch (json.habit.type) {
			case "gradual":
				return this.createGradualHabitLog(json as GradualHabitLogJSON);

			case "study":
				return this.createStudyHabitLog(json as StudyHabitLogJSON);

			default:
				return this.createStandardHabitLog(json);
		}
	}

	static createStandardHabitLog(json: HabitLogJSON): HabitLog {
		return HabitLog.fromJSON(json);
	}

	static createStudyHabitLog(json: StudyHabitLogJSON): StudyHabitLog {
		return StudyHabitLog.fromJSON(json);
	}

	static createGradualHabitLog(json: GradualHabitLogJSON): GradualHabitLog {
		return GradualHabitLog.fromJSON(json);
	}
}
