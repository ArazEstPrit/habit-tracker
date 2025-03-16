import React, { useEffect } from "react";
import { TopicEditor } from "../templates/TopicEditor.jsx";
import {
	getHardestTopics,
	getMostRecentTopic,
	getRecommendedTopics,
	useUser,
} from "@presentation/utils/userUtils.js";

export function StudyPage() {
	const [user, setUser] = useUser();

	// const [hardestTopics, setHardestTopics] = React.useState([]);
	// const [recentTopics, setRecentTopics] = React.useState([]);
	const [futureTopics, setFutureTopics] = React.useState([]);

	useEffect(() => {
		getRecommendedTopics().then(e => setFutureTopics(e));
	}, [setUser, user]);

	const hardestTopics = getHardestTopics(user).slice(0, 4) || [];

	const recentTopics = getMostRecentTopic(user).slice(0, 4) || [];

	const topicCard = topic => (
		<div className="topic-card" key={topic.id}>
			<span className="title">{topic.name}</span>
			<div className="row">
				<span className="subtopics">
					{topic.children.length} subTopics
				</span>
				<span className="difficulty">{topic.difficulty}</span>
			</div>
		</div>
	);

	return (
		<div className="main">
			<h2>Study</h2>

			<div className="topic-info row">
				<div className="future-topics-container">
					<h3>Future Topics</h3>
					<div className="future-topics">
						{futureTopics.map(topicCard)}
					</div>
				</div>
				<div className="hardest-topics-container">
					<h3>Hardest Topics</h3>
					<div className="hardest-topics">
						<TopicEditor topics={hardestTopics} />
					</div>
					<hr />
					<h3>Recent Topics</h3>
					<div className="recent-topics">
						<TopicEditor topics={recentTopics} />
					</div>
				</div>
			</div>
			<h2>Topics</h2>
			<TopicEditor
				topics={user?.topics || []}
				isEditable={true}
				showChildren={true}
			/>
		</div>
	);
}
