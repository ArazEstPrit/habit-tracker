import BadgeService from "@application/services/BadgeService.js";
import UserService, {
	HabitLogOptions,
} from "@application/services/UserService.js";
import { daysInBetween, isSameDay } from "@application/utils/dateUtils.js";
import HabitLog from "@core/habitLogs/HabitLog.js";
import HabitLogFactory from "@core/habitLogs/HabitLogFactory.js";
import Habit from "@core/habits/Habit.js";
import HabitFactory from "@core/habits/HabitFactory.js";
import HabitJSON from "@core/Json/HabitJSON.js";
import HabitLogJSON from "@core/Json/HabitLogJSON.js";
import TopicTreeNodeJSON from "@core/Json/TopicTreeNodeJSON.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import Badge from "@core/user/Badge.js";
import User from "@core/user/User.js";
import { randomUUID } from "crypto";

export interface UserInfo {
	isNewUser: boolean;
	id: string;
	username: string;
	xp: number;
	level: number;
	xpForNextLevel: number;
	stats: {
		streak: number;
		longestStreak: number;
		dailyCompletion: Date[];
	};
	habits: Habit[];
	history: HabitLog[];
	historyToday: HabitLog[];
	topics: TopicTreeNode[];
	badges: Badge[];
}

export default class UserController {
	static getUserInfo(): UserInfo {
		const user = UserService.getUser();

		if (user === null) {
			return {
				isNewUser: true,
				id: "",
				username: "",
				xp: 0,
				level: 0,
				xpForNextLevel: 0,
				stats: {
					streak: 0,
					longestStreak: 0,
					dailyCompletion: [],
				},
				habits: [],
				history: [],
				historyToday: [],
				topics: [],
				badges: [],
			};
		}

		const [streak, longestStreak] = this.getStreakInfo(user);

		return {
			isNewUser: false,
			id: user.id,
			username: user.username,
			xp: user.getCurrentXp(),
			level: user.getLevel(),
			xpForNextLevel: user.getXpGoal(),
			stats: {
				streak: streak,
				longestStreak,
				dailyCompletion: this.getDailyCompletion(user),
			},
			habits: user.habits,
			history: user.history,
			historyToday: this.getHistoryToday(),
			topics: user.studyTopics,
			badges: user.badges,
		};
	}

	static getHistoryToday(): HabitLog[] {
		return UserService.getUser()?.history.filter(
			habitLog => new Date(habitLog.date).getDay() === new Date().getDay()
		);
	}

	static getDailyCompletion(user: User): Date[] {
		if (!user || user.history.length === 0) return [];

		const days = daysInBetween(user.history[0].date, new Date());

		const dailyCompletion: Date[] = [];

		for (const day of days) {
			user.history.some(
				log => isSameDay(log.date, day) && log.isCompleted()
			) && dailyCompletion.push(day);
		}

		return dailyCompletion;
	}

	static getStreakInfo(user: User): number[] {
		const dailyCompletion = this.getDailyCompletion(user);

		const days = daysInBetween(dailyCompletion[0], new Date());

		const [currentStreak, longestStreak] = days.reduce(
			(streaks, day) => {
				if (dailyCompletion.some(date => isSameDay(date, day))) {
					streaks[0] += 1;
				} else if (!isSameDay(day, new Date())) {
					streaks[0] = 0;
				}
				streaks[1] = Math.max(streaks[0], streaks[1]);
				return streaks;
			},
			[0, 0]
		);

		return [currentStreak, longestStreak];
	}

	static registerNewUser(userName: string) {
		if (UserService.getUser() !== null)
			throw new Error("User already exists");
		if (userName === "") throw new Error("Username can't be empty");

		UserService.registerNewUser(userName);
	}

	static logHabit(habitId: string, options: HabitLogOptions): HabitLogJSON {
		const habit = UserService.getUser()?.habits.find(h => h.id === habitId);
		if (!habit) throw new Error("Habit not found");

		const log = HabitLogFactory.createHabitLog({
			...options,
			topic: UserService.getTopic(options.topicId),
			habit: habit.toJSON(),
			id: randomUUID(),
			date: new Date(),
		});

		UserService.addLog(log);

		return log;
	}

	static toggleLog(habitId: string, studyLogOptions: HabitLogOptions) {
		const habit = UserService.getHabit(habitId);

		if (!habit) throw new Error("Habit not found");
		if (habit.type === "gradual")
			throw new Error("Habit is not toggle-able");

		const existingLog = UserService.getTodayHabitLog(habitId);

		if (existingLog) {
			this.deleteLog(existingLog.id);
		} else {
			this.logHabit(habitId, studyLogOptions);
		}
	}

	static deleteLog(id: string) {
		UserService.removeLog(id);
	}

	static addHabit(habit: HabitJSON) {
		if (UserService.getHabit(habit.id)) {
			return UserService.editHabit(HabitFactory.createHabit(habit));
		} else {
			return UserService.addHabit(HabitFactory.createHabit(habit));
		}
	}

	static deleteHabit(id: string) {
		UserService.removeHabit(id);
	}

	static saveTopic(
		topic: TopicTreeNodeJSON,
		parentId?: string
	): TopicTreeNodeJSON {
		if (UserService.getTopic(topic.id))
			return UserService.editTopic(
				TopicTreeNode.fromJSON(topic)
			).toJSON();
		else
			return UserService.addTopic(
				TopicTreeNode.fromJSON(topic),
				parentId
			).toJSON();
	}

	static removeTopic(id: string) {
		UserService.removeTopic(id);
	}

	static getRecommendedTopics() {
		return UserService.getRecommendedTopics().map(topic => topic.toJSON());
	}

	static getBadges() {
		return BadgeService.getBadges().map(badge => {
			const newBadge = badge.toJSON();
			const p = badge.checkProgress(UserService.getUser()!) / badge.goal;

			newBadge.progress = p > 0 ? (p <= 1 ? p : 1) : 0;

			return newBadge;
		});
	}
}
