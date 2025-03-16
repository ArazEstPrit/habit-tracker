import TopicTreeNode from "@core/study/TopicTreeNode.js";
import { deleteTopic, saveTopic } from "@presentation/utils/userUtils.js";
import React, { useState, useEffect } from "react";

export function TopicEditor(props: {
	topics: TopicTreeNode[];
	isEditable?: boolean;
	showChildren?: boolean;
}) {
	const [localTopics, setLocalTopics] = useState<TopicTreeNode[]>(
		props.topics
	);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	useEffect(() => {
		setLocalTopics(props.topics);

		props.showChildren &&
			props.topics.forEach(t => setExpanded(prev => prev.add(t.id)));
	}, [props.topics]);

	const onSave = (topic: TopicTreeNode, parentId?: string) => {
		saveTopic(topic, parentId).then(
			t => topic.id.startsWith("temp") && (topic.id = t.id)
		);
	};

	const toggleExpand = (id: string) => {
		setExpanded(prev => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const handleAddChild = (parent?: TopicTreeNode) => {
		const newTopic = new TopicTreeNode(
			`temp-${Date.now()}`,
			"New Topic",
			1,
			[]
		);

		if (parent) {
			parent.children = [...parent.children, newTopic];
			setLocalTopics([...localTopics]);
			setExpanded(prev => new Set(prev.add(parent.id)));
		} else {
			setLocalTopics([...localTopics, newTopic]);
		}

		onSave(newTopic, parent?.id || undefined);
	};

	const handleUpdate = (updatedTopic: TopicTreeNode) => {
		const update = (nodes: TopicTreeNode[]): TopicTreeNode[] =>
			nodes.map(node => {
				if (node.id === updatedTopic.id) return updatedTopic;

				node.children = update(node.children);

				return node;
			});

		setLocalTopics(update(localTopics));
		onSave(updatedTopic);
	};

	const handleDelete = (topicId: string) => {
		const remove = (nodes: TopicTreeNode[]): TopicTreeNode[] =>
			nodes
				.filter(node => node.id !== topicId)
				.map(node => {
					node.children = remove(node.children);
					return node;
				});

		setLocalTopics(remove(localTopics));
		deleteTopic(topicId);
	};

	console.log(localTopics);

	return (
		<div className="topic-editor">
			{localTopics.map(topic => (
				<TopicNode
					key={topic.id}
					topic={topic}
					depth={0}
					isEditable={props.isEditable}
					showChildren={props.showChildren}
					expanded={expanded}
					onToggle={toggleExpand}
					onUpdate={handleUpdate}
					onAddChild={handleAddChild}
					onDelete={handleDelete}
				/>
			))}
			{props.isEditable && (
				<button onClick={() => handleAddChild()}>+ New Topic</button>
			)}
		</div>
	);
}

function TopicNode(props: {
	topic: TopicTreeNode;
	depth: number;
	isEditable: boolean;
	showChildren: boolean;
	expanded: Set<string>;
	onToggle: (id: string) => void;
	onUpdate: (topic: TopicTreeNode) => void;
	onAddChild: (parent: TopicTreeNode) => void;
	onDelete: (id: string) => void;
	autoFocus?: boolean;
}) {
	const [name, setName] = useState(props.topic.name);
	const [difficulty, setDifficulty] = useState(
		props.topic.difficulty.toString()
	);

	useEffect(() => {
		setName(props.topic.name);
		setDifficulty(props.topic.difficulty.toString());
	}, [props.topic]);

	const hasChildren = props.topic.children.length > 0;
	const isExpanded = props.expanded.has(props.topic.id) && props.showChildren;

	const saveChanges = () => {
		const newTopic = props.topic;
		newTopic.name = name;
		newTopic.difficulty = parseInt(difficulty) || 1;

		props.onUpdate(newTopic);
	};

	return (
		<div className="topic-node">
			<div className="topic-header">
				{hasChildren && props.showChildren ? (
					<button
						className="toggle"
						onClick={() => props.onToggle(props.topic.id)}
						aria-label={isExpanded ? "Collapse" : "Expand"}
					>
						{isExpanded ? "▼" : "▶"}
					</button>
				) : (
					<span className="bullet">●</span>
				)}

				<input
					value={name}
					onClick={e => {
						e.stopPropagation();
					}}
					readOnly={!props.isEditable}
					onChange={e => setName(e.target.value)}
					onBlur={saveChanges}
					autoFocus={props.autoFocus}
				/>
				<select
					value={difficulty}
					onClick={e => {
						e.stopPropagation();
					}}
					disabled={!props.isEditable}
					onChange={e => {
						setDifficulty(e.target.value);
						setTimeout(() => {
							e.target.blur();
						}, 1);
					}}
					onBlur={saveChanges}
				>
					{[1, 2, 3, 4, 5].map(n => (
						<option key={n} value={n}>
							Level {n}
						</option>
					))}
				</select>

				{props.isEditable && (
					<div className="actions">
						<button onClick={() => props.onAddChild(props.topic)}>
							+ Child
						</button>
						<button onClick={() => props.onDelete(props.topic.id)}>
							×
						</button>
					</div>
				)}
			</div>

			{hasChildren && isExpanded && (
				<div
					className="children"
					style={{ paddingLeft: `${1 * 24}px` }}
				>
					{props.topic.children.map(child => (
						<TopicNode
							key={child.id}
							topic={child}
							depth={props.depth + 1}
							isEditable={props.isEditable}
							showChildren={props.showChildren}
							expanded={props.expanded}
							onToggle={props.onToggle}
							onUpdate={props.onUpdate}
							onAddChild={props.onAddChild}
							onDelete={props.onDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
