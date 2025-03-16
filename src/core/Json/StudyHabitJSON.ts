import HabitJSON from "./HabitJSON.js";
import TopicTreeNodeJSON from "./TopicTreeNodeJSON.js";

interface StudyHabitJSON extends HabitJSON {
	topic: TopicTreeNodeJSON;
	dynamic: boolean;
	length: number;
}

export default StudyHabitJSON;
