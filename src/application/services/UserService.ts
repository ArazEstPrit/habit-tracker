import { isSameDay } from "@application/utils/dateUtils.js";
import GradualHabitLog from "@core/habitLogs/GradualHabitLog.js";
import HabitLog from "@core/habitLogs/HabitLog.js";
import StudyHabitLog from "@core/habitLogs/StudyHabitLog.js";
import Habit from "@core/habits/Habit.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import User from "@core/user/User.js";
import FileService from "@infrastructure/services/FileService.js";
import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import Badge from "@core/user/Badge.js";
import GradualHabit from "@core/habits/GradualHabit.js";
import StudyHabit from "@core/habits/StudyHabit.js";
import BadgeService from "./BadgeService.js";

export interface HabitLogOptions {
	progress?: number;
	performance?: number;
	topicId?: string;
}

class UserService extends EventEmitter {
	private user: User | null;

	constructor() {
		super();
		this.readUser();

		FileService.watchUser((user: User | null) => {
			if (!user) return;

			this.user = user;
			this.emit("change", {
				message: "User data file changed on desktop",
				id: "refreshUser",
				type: "info",
			});
		});
	}

	public getUser(): User | null {
		return this.user;
	}

	// Only used by SyncService & User selection dialog
	public setUser(user?: User): void {
		if (!user && !this.user) {
			throw new Error("User cannot be null");
		}

		const targetUser = user || this.user;

		// To counteract the version increment done by saveUser()
		targetUser.version--;

		this.user = targetUser;

		this.saveUser();
	}

	public registerNewUser(userName: string): void {
		this.user = new User(userName, randomUUID(), [], [], [], 0, []);
		this.emit("register");
		this.saveUser();
	}

	public addBadge(badge: Badge): void {
		if (this.user.badges.find(b => b.name === badge.name)) return;

		this.user?.addBadge(badge);

		console.log("New badge unlocked: " + badge.name);

		this.emit("change", {
			message: "New badge unlocked: " + badge.name,
			id: "addBadge",
			type: "info",
		});
	}

	public removeBadge(badgeName: string): void {
		this.user?.removeBadge(badgeName);

		console.log("Badge revoked: " + badgeName);

		this.emit("change", {
			message: "Badge revoked: " + badgeName,
			id: "removeBadge",
			type: "info",
		});
	}

	public getHabit(habitId: string): Habit {
		return this.user?.habits.find(habit => habit.id === habitId) as Habit;
	}

	public getTopic(topicId: string): TopicTreeNode {
		return this.user.getTopic(topicId);
	}

	public addHabit(habit: Habit): Habit {
		habit.id = randomUUID();
		this.user?.addHabit(habit);
		this.saveUser();

		return habit;
	}

	public editHabit(habit: Habit): Habit {
		this.user.editHabit(habit);

		const todayLog = this.getTodayHabitLog(habit.id);

		if (todayLog) {
			todayLog.habit = habit;

			if (habit.type === "gradual") {
				(todayLog as GradualHabitLog).progress = Math.max(
					0,
					Math.min(
						(todayLog as GradualHabitLog).progress,
						(habit as GradualHabit).goal
					)
				);
			}

			this.editLog(todayLog);
		}

		this.saveUser();

		return habit;
	}

	public removeHabit(id: string): void {
		this.user?.removeHabit(id);
		this.saveUser();
	}

	public removeLog(id: string): void {
		this.user?.removeLog(id);
		this.saveUser();
	}

	public setTopics(topics: TopicTreeNode[]): TopicTreeNode[] {
		this.user.studyTopics = topics;
		this.saveUser();

		return topics;
	}

	public getTodayHabitLog(habitId: string): HabitLog | undefined {
		return this.user?.history.find(
			log => isSameDay(log.date, new Date()) && log.habit.id === habitId
		);
	}

	public addLog(log: HabitLog): HabitLog {
		const existingLog = this.getTodayHabitLog(log.habit.id);
		if (existingLog) this.removeLog(existingLog.id);

		if (
			log.habit.type === "gradual" &&
			(log as GradualHabitLog).progress === 0
		)
			return;

		this.user?.addLog(log);
		this.saveUser();

		return log;
	}

	public editLog(log: HabitLog): void {
		this.user?.editLog(log);
		this.saveUser();
	}

	private readUser(): void {
		this.user = FileService.readUser() as User | null;

		if (!this.user) {
			this.user = null;
		} else {
			this.updateBadges();
		}
	}

	private saveUser(): void {
		// Since all user changes go through this method, we can evaluate badges
		// here to make sure they are up to date
		this.updateBadges();

		this.user.version++;

		FileService.writeUser(this.user);
		this.emit("change", {
			message: "",
			type: "hidden",
			id: "refreshUser",
		});
	}

	private updateBadges(): void {
		const [badgesToAdd, badgesToRemove] = BadgeService.evaluateBadges(
			this.user
		);

		badgesToAdd.forEach(badge => this.addBadge(badge));
		badgesToRemove.forEach(badge => this.removeBadge(badge.name));
	}

	public addTopic(topic: TopicTreeNode, parentId?: string): TopicTreeNode {
		topic.id = randomUUID();

		this.user?.addTopic(topic, parentId);
		this.saveUser();

		return topic;
	}

	public editTopic(topic: TopicTreeNode): TopicTreeNode {
		this.user?.editTopic(
			topic,
			this.findParentTopic(this.user.studyTopics, topic.id)?.id
		);

		// Edit studyHabits with that topic
		const habits: StudyHabit[] = this.user?.habits.filter(
			habit =>
				habit.type === "study" &&
				(habit as StudyHabit).topic?.id === topic.id
		) as StudyHabit[];

		habits.forEach(h => {
			h.topic = topic;
			this.editHabit(h);
		});

		this.saveUser();

		return topic;
	}

	public removeTopic(id: string): void {
		this.user?.removeTopic(
			id,
			this.findParentTopic(this.user.studyTopics, id)?.id
		);
		this.saveUser();
	}

	private findParentTopic(
		nodes: TopicTreeNode[],
		id: string
	): TopicTreeNode | null {
		for (const node of nodes) {
			if (node.children.some(child => child.id === id)) return node;

			const found = this.findParentTopic(node.children, id);
			if (found) return found;
		}

		return null;
	}

	public getRecommendedTopics(
		weights = { struggle: 0.6, decay: 0.3, structure: 0.1 }
	): TopicTreeNode[] {
		const topicMap = new Map<string, TopicTreeNode>();
		const sessionsMap = new Map<string, StudyHabitLog[]>();
		const subtreeSizes = new Map<string, number>();

		function processNode(node: TopicTreeNode) {
			topicMap.set(node.id, node);
			let size = 1;
			for (const child of node.children) size += processNode(child);
			subtreeSizes.set(node.id, size);
			return size;
		}
		this.user.studyTopics.forEach(processNode);

		this.user.history
			.filter(log => log instanceof StudyHabitLog)
			.forEach(session => {
				const topicSessions = sessionsMap.get(session.topic.id) || [];
				topicSessions.push(session);
				sessionsMap.set(session.topic.id, topicSessions);
			});

		const now = Date.now();
		const MS_PER_DAY = 1000 * 60 * 60 * 24;
		const allTopics = Array.from(topicMap.values());

		const scores = allTopics.map(topic => {
			const sessions = sessionsMap.get(topic.id) || [];
			const lastSession = sessions.sort(
				(a, b) => b.date.getTime() - a.date.getTime()
			)[0];

			// Struggle score (lower performance = more struggle)
			const avgPerformance =
				sessions.length > 0
					? sessions.reduce((sum, s) => sum + s.performance, 0) /
					  sessions.length
					: 0;
			const struggle = (5 - avgPerformance) * topic.difficulty;

			// Knowledge decay (days since last study)
			const daysSinceLast = lastSession
				? (now - lastSession.date.getTime()) / MS_PER_DAY
				: Infinity;

			// Structural importance
			const structure = subtreeSizes.get(topic.id)!;

			return {
				id: topic.id,
				isStruggle: struggle > 0,
				score:
					weights.struggle * struggle +
					weights.decay * Math.log1p(daysSinceLast) +
					weights.structure * structure,
			};
		});

		return scores
			.sort((a, b) => {
				// Struggling topics first, then others
				if (a.isStruggle !== b.isStruggle) return a.isStruggle ? -1 : 1;
				return b.score - a.score;
			})
			.map(score => topicMap.get(score.id)!);
	}
}

export default new UserService();
