import GradualHabitJSON from "./GradualHabitJSON.js";
import HabitLogJSON from "./HabitLogJSON.js";

interface GradualHabitLogJSON extends HabitLogJSON {
	habit: GradualHabitJSON;
	progress: number;
}

export default GradualHabitLogJSON;
