import React, { MouseEvent, useEffect, useState } from "react";
import HabitLog from "../../../core/habitLogs/HabitLog.js";
import GradualHabit from "../../../core/habits/GradualHabit.js";
import Habit from "../../../core/habits/Habit.js";
import StudyHabit from "../../../core/habits/StudyHabit.js";
import { Icon } from "../UI/Icon.jsx";
import {
	getRecommendedTopics,
	isHabitCompleted,
	logHabit,
	toggleLog,
} from "../../utils/userUtils.js";
import GradualHabitLog from "../../../core/habitLogs/GradualHabitLog.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import StudyHabitLog from "@core/habitLogs/StudyHabitLog.js";
import { Popup } from "../UI/Popup.jsx";
import ReactDOM from "react-dom";

export function HabitListItem(props: {
	habit: Habit;
	log: HabitLog | null;
	active: boolean;
	onClick: (e: MouseEvent) => void;
	readOnly?: boolean;
	showCompletedDate?: boolean;
}) {
	const [progress, setProgress] = useState<number>(
		(props.log as GradualHabitLog)?.progress ?? 0
	);

	const [studyLogOpen, setStudyLogOpen] = useState(false);
	const [promptValue, setPromptValue] = useState("0");

	const [topic, setTopic] = useState<TopicTreeNode>(null);

	const [isCompleted, setIsCompleted] = useState<boolean>(false);

	useEffect(() => {
		setProgress((props.log as GradualHabitLog)?.progress ?? 0);
	}, [props.log]);

	useEffect(() => {
		setIsCompleted(
			isHabitCompleted(props.habit, props.log ? [props.log] : [])
		);
	}, [props.log, props.habit, setProgress]);

	useEffect(() => {
		if (props.habit.type === "study") {
			(props.habit as StudyHabit).dynamic
				? isCompleted
					? setTopic((props.log as StudyHabitLog).topic)
					: getRecommendedTopics().then(topics => {
							setTopic(topics[0]);
					  })
				: setTopic((props.habit as StudyHabit).topic);
		}
	}, [props.log, props.habit]);

	const typeSpecificActions = {
		standard: () => (
			<button
				className="complete-button"
				onClick={
					props.readOnly
						? e => e.stopPropagation()
						: e => {
								e.stopPropagation();
								toggleLog(props.habit.id, {});
						  }
				}
			>
				<Icon icon="habit" />
			</button>
		),
		study: () => (
			<button
				className="complete-button"
				onClick={
					props.readOnly
						? e => e.stopPropagation()
						: e => {
								e.stopPropagation();

								if (isCompleted) {
									setIsCompleted(false);
									toggleLog(props.habit.id, {
										topicId: (props.habit as StudyHabit)
											.topic?.id,
										performance: 123,
									});
								} else {
									setStudyLogOpen(true);
								}
						  }
				}
			>
				<Icon icon="study" />
			</button>
		),
		gradual: () => (
			<div className="gradual-controls">
				<input
					type="number"
					value={progress.toString()}
					min={0}
					max={(props.habit as GradualHabit).goal}
					onBlur={
						props.readOnly
							? e => e.stopPropagation()
							: e =>
									logHabit(props.habit.id, {
										progress: parseInt(e.target.value),
									})
					}
					onChange={e => {
						setProgress(
							Math.max(
								0,
								Math.min(
									parseInt(e.target.value),
									(props.habit as GradualHabit).goal
								)
							)
						);
					}}
					onClick={e => e.stopPropagation()}
				/>
				<span>/{(props.habit as GradualHabit).goal || "#"}</span>
			</div>
		),
	};

	const habitDays = props.habit.days.map(day => (day ? 1 : 0)).join("");

	const habitDaysHumanized =
		{
			"1111111": "Every day",
			"1000001": "On Weekends",
			"0111110": "On Weekdays",
		}[habitDays] ||
		props.habit.days
			.map((day, i) =>
				day ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i] : ""
			)
			.filter(day => day)
			.join(", ");

	return (
		<div
			className={[
				"habit-list-item",
				"color-" + props.habit.color,
				isCompleted ? "completed" : "",
				props.active ? "active" : "",
			].join(" ")}
			data-id={props.habit.id}
			onClick={props.onClick}
		>
			<div className="vertical">
				<span className="name">{props.habit.name}</span>
				<span className="description">{props.habit.description}</span>
			</div>

			{props.showCompletedDate && (
				<div className="vertical completed-date">
					<span className="label">Completed:</span>
					<span className="completedDate">
						{props.log?.date.toLocaleDateString() || "--/--/--"}
					</span>
				</div>
			)}

			{props.habit.type === "study" && (
				<div className="vertical study-info">
					<span>
						{(props.habit as StudyHabit).length || 0} minutes
					</span>
					<span>
						{(props.habit as StudyHabit).dynamic && !isCompleted
							? topic?.name || ""
							: (
									(props.log as StudyHabitLog) ||
									(props.habit as StudyHabit)
							  ).topic?.name || ""}
					</span>
				</div>
			)}

			<div className="vertical time-info">
				<span className="time">{props.habit.time || "--:--"}</span>
				<span className="days-natural">{habitDaysHumanized}</span>
			</div>

			{props.habit.days[new Date().getDay()] &&
				typeSpecificActions[props.habit.type]()}

			{studyLogOpen &&
				ReactDOM.createPortal(
					<Popup
						onSubmit={() => {
							const performance = parseInt(promptValue);
							toggleLog(props.habit.id, {
								topicId:
									(props.habit as StudyHabit).topic?.id ||
									topic.id,
								performance,
							});
							setPromptValue("");
							setStudyLogOpen(false);
						}}
					>
						<h3>Log Study Progress</h3>
						<div
							className="name-input"
							onClick={e => e.stopPropagation()}
						>
							<label htmlFor="progress">Progress: (0-5)</label>
							<input
								type="number"
								id="progress"
								name="progress"
								min={0}
								max={5}
								placeholder="Enter progress"
								value={promptValue}
								style={{ width: "200px" }}
								onChange={e => setPromptValue(e.target.value)}
							/>
						</div>
						<input type="submit" value="Log" />
					</Popup>,
					document.body
				)}
		</div>
	);
}
