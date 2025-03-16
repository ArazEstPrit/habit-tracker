import HabitJSON from "./HabitJSON.js";
import HabitLogJSON from "./HabitLogJSON.js";
import TopicTreeNodeJSON from "./TopicTreeNodeJSON.js";

interface UserJSON {
	username: string;
	id: string;
	badges: string[];
	habits: HabitJSON[];
	studyTopics: TopicTreeNodeJSON[];
	history: HabitLogJSON[];
	version: number;
}

export default UserJSON;
