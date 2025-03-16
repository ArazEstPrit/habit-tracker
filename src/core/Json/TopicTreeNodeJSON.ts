interface TopicTreeNodeJSON {
	id: string;
	name: string;
	difficulty: number;
	children: TopicTreeNodeJSON[];
}

export default TopicTreeNodeJSON;
