import { createContext, useContext } from "react";
import Habit from "@core/habits/Habit.js";
import { HabitLogOptions } from "@application/services/UserService.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import HabitFactory from "@core/habits/HabitFactory.js";
import HabitLogFactory from "@core/habitLogs/HabitLogFactory.js";
import HabitLogJSON from "@core/Json/HabitLogJSON.js";
import HabitLog from "@core/habitLogs/HabitLog.js";
import GradualHabitLog from "@core/habitLogs/GradualHabitLog.js";
import GradualHabit from "@core/habits/GradualHabit.js";
import { isSameDay } from "@application/utils/dateUtils.js";

export const UserContext = createContext(null);

export function useUser() {
	return useContext(UserContext);
}

export async function registerNewUser(username: string) {
	const response = await fetch("/api/user", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username }),
	});

	if (response.ok) {
		return response.json();
	} else {
		console.error("Registration failed:", response.status);
	}
}

export async function fetchUserInfo() {
	return fetch("/api/user")
		.then(response => response.json())
		.then(user => ({
			...user,
			stats: {
				...user.stats,
				dailyCompletion: user.stats.dailyCompletion?.map(
					e => new Date(e)
				),
			},
			habits: user.habits.map(habit => HabitFactory.createHabit(habit)),
			history: user.history.map((habitLog: HabitLogJSON) =>
				HabitLogFactory.createHabitLog(habitLog)
			),
			historyToday: user.historyToday.map(habitLog =>
				HabitLogFactory.createHabitLog(habitLog)
			),
			topics: user.topics.map(topic => TopicTreeNode.fromJSON(topic)),
		}));
}

export async function logHabit(habitId: string, params: HabitLogOptions) {
	const response = await fetch("/api/habit-log", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ habitId, params }),
	});

	if (response.ok) {
		return await response.json().then(data => data);
	}
}

export async function deleteLog(id: number) {
	const response = await fetch(`/api/habit-log/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		return response;
	}
}

export async function toggleLog(id: string, studyOptions: HabitLogOptions) {
	const response = await fetch("/api/habit-log/toggle", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id, studyOptions }),
	});

	if (response.ok) {
		return response;
	}
}

export async function saveHabit(habit: Habit) {
	const response = await fetch("/api/habit", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ habit: habit.toJSON() }),
	});

	if (response.ok) {
		return await response.json();
	}
}

export async function deleteHabit(id: string) {
	const response = await fetch("/api/habit", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id }),
	});

	if (response.ok) {
		return response;
	}
}

export async function saveTopic(topic: TopicTreeNode, parentId?: string) {
	const response = await fetch("/api/topic", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ topic: topic.toJSON(), parentId }),
	});

	if (response.ok) {
		return await response.json();
	}
}

export async function deleteTopic(id: string) {
	const response = await fetch("/api/topic", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id }),
	});

	if (response.ok) {
		return response;
	}
}

export async function getDynamicTopic() {
	const response = await fetch("/api/dynamic-topic", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		return await response.json();
	}
}

export async function getRecommendedTopics() {
	const response = await fetch("/api/recommended-topics", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		return (await response.json()).map(topic =>
			TopicTreeNode.fromJSON(topic)
		);
	}
}

export async function getBadges() {
	const response = await fetch("/api/badges", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		return await response.json();
	}
}

export function splitHabitList(habits: Habit[], logs: HabitLog[]) {
	return [
		habits.filter(habit => !isHabitCompleted(habit, logs)),
		habits.filter(habit => isHabitCompleted(habit, logs)),
	];
}

export function isHabitCompleted(
	habit: Habit,
	logs: HabitLog[],
	todayOnly?: boolean
) {
	return logs.some(
		log =>
			log.habit.id === habit.id &&
			(todayOnly ? isSameDay(log.date, new Date()) : true) &&
			(log.habit.type === "gradual"
				? (log as GradualHabitLog).progress ===
				  (log.habit as GradualHabit).goal
				: true)
	);
}

export function getMostRecentTopic(user) {
	return (
		user?.history
			.filter(h => h.habit.type === "study")
			.sort((a, b) => b.date - a.date)
			.map(h => user.topics.find(e => e.search(h.topic.id)) || h.topic) ||
		[]
	);
}

export function getHardestTopics(user) {
	return (
		user?.topics
			.reduce((acc, curr) => {
				acc.push(...curr.flatten());
				return acc;
			}, [])
			.sort((a, b) => b.difficulty - a.difficulty) || []
	);
}
