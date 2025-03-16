import { getWeek, isSameDay } from "@application/utils/dateUtils.js";
import HabitLog from "@core/habitLogs/HabitLog.js";
import { useUser } from "@presentation/utils/userUtils.js";
import React, { Fragment, useEffect, useState } from "react";
import { HabitListItem } from "../templates/HabitListItem.jsx";

export function StatisticsPage() {
	const [user, setUser] = useUser();

	const [dailyCompletion, setDailyCompletion] = useState(
		// generateRandomDates(132)
		[]
	);

	useEffect(() => {
		setDailyCompletion(user?.stats.dailyCompletion);
	}, [user?.stats, setUser]);

	return (
		<div className="main">
			<div className="stats-content">
				<h2>Statistics</h2>
				<ActivityCalendar dailyCompletion={dailyCompletion} />
				<hr />
				<ActivityGraph history={user?.history} />
				<hr />
				<div className="stats-trivia">
					{[
						["Habits Completed", user?.history.length],
						[
							"Topics Studied",
							user?.history.filter(e => e.habit.type === "study")
								.length,
						],
						["Habit Count", user?.habits.length],
						["Longest Streak", user?.stats.longestStreak],
					].map(e => (
						<Fragment key={e[0]}>
							<div className="card">
								<h5>{e[0]}</h5>
								<span>{e[1]}</span>
							</div>
							<hr />
						</Fragment>
					))}
				</div>
				<hr />
				<h3>History</h3>
				<HistoryList history={user?.history} />
			</div>
		</div>
	);
}

function ActivityCalendar(props: { dailyCompletion: Date[] }) {
	if (!props.dailyCompletion) return;

	const startDate = new Date();
	startDate.setFullYear(startDate.getFullYear(), 0, 1);

	const year = [];
	const d = new Date(startDate);
	while (d.getFullYear() === startDate.getFullYear()) {
		year.push(new Date(d));
		d.setDate(d.getDate() + 1);
	}

	const days = year.map(e => (
		<div
			className={`day ${
				props.dailyCompletion.find(date => isSameDay(date, e))
					? "active"
					: ""
			}`}
			title={e.toISOString().split("T")[0]}
			style={{
				gridRow: e.getDay() + 1,
				gridColumn: getWeek(e),
			}}
			key={e.getTime()}
		></div>
	));

	return <div className="activity-calendar">{days}</div>;
}

function ActivityGraph(props: { history: HabitLog[] }) {
	if (!props.history) return;

	const weekActivity = props.history.reduce(
		(acc, log) => {
			if (!log.isCompleted()) return acc;

			const day = log.date.getDay();
			acc[day] = (acc[day] || 0) + 1;
			return acc;
		},
		[0, 0, 0, 0, 0, 0, 0]
	);

	const maxActivity = Math.max(...weekActivity);

	const normalizedWeekActivity = weekActivity.map(e => e / maxActivity || 0);

	const maxes = weekActivity.reduce((acc, day, i) => {
		if (maxActivity == 0) return [-1];

		if (day === maxActivity) acc.push(i);

		return acc;
	}, []);

	const endOfSentence = getEndOfSentence(maxes);

	return (
		<div className="graph-container">
			<h3>
				You are the most active
				<span
					style={{
						paddingLeft: "1rem",
						color: "var(--text-color)",
					}}
				>
					{endOfSentence}.
				</span>
			</h3>

			{maxActivity == 0 ? (
				<span className="no-graph">No data</span>
			) : (
				<div className="graph">
					<div className={"row bars"}>
						{normalizedWeekActivity.map((e, i) => (
							<div
								className="bar"
								title={weekActivity[i] + ""}
								key={i}
								style={{ height: e * 100 + "%" }}
							></div>
						))}
					</div>
					<hr />
					<div className="row">
						{[
							"Sunday",
							"Monday",
							"Tuesday",
							"Wednesday",
							"Thursday",
							"Friday",
							"Saturday",
						].map(e => (
							<span key={e} className="label">
								{e}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function HistoryList(props: { history?: HabitLog[] }) {
	if (!props.history) return;

	return (
		<div className="history habit-list">
			{props.history
				.sort((a, b) => b.date.getTime() - a.date.getTime())
				.map(e => (
					<HabitListItem
						active={false}
						habit={e.habit}
						log={e}
						onClick={() => {}}
						key={e.date.getTime() + e.habit.name}
						readOnly
						showCompletedDate
					/>
				))}
		</div>
	);
}

const generateRandomDates = (numDates: number) => {
	const dates = [];
	const startDate = new Date();
	startDate.setFullYear(startDate.getFullYear(), 0, 1);
	const endDate = new Date();
	endDate.setFullYear(endDate.getFullYear() + 1, 0, 0);

	for (let i = 0; i < numDates; i++) {
		const randomTime =
			startDate.getTime() +
			Math.random() * (endDate.getTime() - startDate.getTime());
		dates.push(new Date(randomTime));
	}

	return dates;
};

function getEndOfSentence(maxes: number[]) {
	if (maxes.length == 7) return "everyday";
	else if (maxes.length == 5 && maxes.every(e => e >= 1 && e < 6))
		return "on weekdays";
	else if (maxes.length == 2 && !maxes.some(e => e >= 1 && e < 6))
		return "on weekends";
	else if (maxes[0] == -1) return "..";
	else
		return (
			"on " +
			maxes
				.map(
					e =>
						[
							"sundays",
							"mondays",
							"tuesdays",
							"wednesdays",
							"thursdays",
							"fridays",
							"saturdays",
						][e]
				)
				.join(", ")
				.replace(/, ([^ ]+)$/, " and $1")
		);
}
