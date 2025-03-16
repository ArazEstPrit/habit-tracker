import HabitLogJSON from "./HabitLogJSON.js";
import StudyHabitJSON from "./StudyHabitJSON.js";
import TopicTreeNodeJSON from "./TopicTreeNodeJSON.js";

interface StudyHabitLogJSON extends HabitLogJSON {
	habit: StudyHabitJSON;
	performance: number;
	topic: TopicTreeNodeJSON;
}

export default StudyHabitLogJSON;
