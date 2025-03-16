import HabitLog from "@core/habitLogs/HabitLog.js";
import HabitLogFactory from "@core/habitLogs/HabitLogFactory.js";
import Habit from "@core/habits/Habit.js";
import HabitFactory from "@core/habits/HabitFactory.js";
import HabitJSON from "@core/Json/HabitJSON.js";
import HabitLogJSON from "@core/Json/HabitLogJSON.js";
import TopicTreeNodeJSON from "@core/Json/TopicTreeNodeJSON.js";
import UserJSON from "@core/Json/UserJSON.js";
import TopicTreeNode from "@core/study/TopicTreeNode.js";
import Badge from "./Badge.js";
import BadgeService from "@application/services/BadgeService.js";

export default class User {
	private _username: string;
	private _id: string;
	private _totalXp: number;
	private _badges: Badge[];
	private _habits: Habit[];
	private _studyTopics: TopicTreeNode[];
	private _history: HabitLog[];
	private _version: number;

	constructor(
		username: string,
		id: string,
		habits: Habit[],
		studyTopics: TopicTreeNode[],
		history: HabitLog[],
		version: number,
		badges: string[]
	) {
		this.validateUsername(username);
		this._username = username;

		this.validateId(id);
		this._id = id;

		this._badges = BadgeService.getBadges().filter(badge =>
			badges.includes(badge.name)
		);

		this.validateHabits(habits);
		this._habits = habits;

		this.validateStudyTopics(studyTopics);
		this._studyTopics = studyTopics;

		this.validateHistory(history);
		this._history = history;
		this.sortHistory();

		this._version = version;

		this.evaluateXp();
	}

	private validateUsername(username: string): void {
		if (username === undefined || username === null || username === "")
			throw new Error("Username can't be empty");
	}

	private validateId(id: string): void {
		if (id === undefined || id === null || id === "")
			throw new Error("Id can't be empty");
	}

	private validateHabits(habits: Habit[]): void {
		if (habits === undefined || habits === null)
			throw new Error("Invalid habits");
	}

	private validateStudyTopics(studyTopics: TopicTreeNode[]): void {
		if (studyTopics === undefined || studyTopics === null)
			throw new Error("Invalid study topics");
	}

	private validateHistory(history: HabitLog[]): void {
		if (history === undefined || history === null)
			throw new Error("Invalid history");
	}

	public validateBadges(): void {
		this._badges.filter(badge => badge.checkCondition(this));
		this.evaluateXp();
	}

	private sortHistory(): void {
		this._history.sort((a, b) => a.date.getTime() - b.date.getTime());
	}

	private sortHabits(): void {
		this._habits.sort((a, b) => a.name.localeCompare(b.name));
	}

	private evaluateXp(): void {
		this._totalXp =
			this._history.reduce(
				(total, l) => (l.isCompleted() ? total + 5 : total),
				0
			) + this._badges.reduce((total, h) => total + h.reward, 0);
	}

	public get username(): string {
		return this._username;
	}

	public get id(): string {
		return this._id;
	}

	public get totalXp(): number {
		return this._totalXp;
	}

	public get badges(): Badge[] {
		return this._badges;
	}

	public get habits(): Habit[] {
		return this._habits;
	}

	public get studyTopics(): TopicTreeNode[] {
		return this._studyTopics;
	}

	public get history(): HabitLog[] {
		this.sortHistory();
		return this._history;
	}

	public set username(value: string) {
		this.validateUsername(value);
		this._username = value;
	}

	public set id(value: string) {
		this.validateId(value);
		this._id = value;
	}

	public set badges(value: Badge[]) {
		this._badges = value;

		this.evaluateXp();
	}

	public set habits(value: Habit[]) {
		this.validateHabits(value);
		this._habits = value;
		this.sortHabits();
	}

	public set studyTopics(value: TopicTreeNode[]) {
		this.validateStudyTopics(value);
		this._studyTopics = value;
	}

	public set history(value: HabitLog[]) {
		this.validateHistory(value);
		this._history = value;
		this.sortHistory();

		this.evaluateXp();
	}

	public set version(value: number) {
		this._version = value;
	}

	public get version(): number {
		return this._version;
	}

	public addBadge(badge: Badge): void {
		this.badges.push(badge);
		this.evaluateXp();
	}

	public removeBadge(name: string): void {
		this.badges = this.badges.filter(b => b.name !== name);
		this.evaluateXp();
	}

	public addTopic(topic: TopicTreeNode, parentId?: string): void {
		const parent = this.getTopic(parentId);
		if (!parent) this.studyTopics.push(topic);
		else parent.children.push(topic);
	}

	public editTopic(topic: TopicTreeNode, parentId?: string): void {
		const parent = this.getTopic(parentId);

		if (!parent)
			this.studyTopics = this.studyTopics.map(t =>
				t.id === topic.id ? topic : t
			);
		else
			parent.children = parent.children.map(t =>
				t.id === topic.id ? topic : t
			);
	}

	public removeTopic(id: string, parentId: string): void {
		if (!parentId)
			this.studyTopics = this.studyTopics.filter(t => t.id !== id);
		else this.getTopic(parentId).removeChild(id);
	}

	public addHabit(habit: Habit): void {
		this.habits.push(habit);
		this.sortHabits();
	}

	public addLog(log: HabitLog): void {
		this.history.push(log);
		this.evaluateXp();
		this.sortHistory();
	}

	public editHabit(habit: Habit): void {
		this.habits = this.habits.map(h => (h.id === habit.id ? habit : h));
		this.sortHabits();
	}

	public removeHabit(id: string): void {
		this.habits = this.habits.filter(habit => habit.id !== id);
		this.sortHabits();
	}

	public editLog(log: HabitLog): void {
		this.history = this.history.map(h => {
			if (h.id === log.id) return log;
			return h;
		});
		this.sortHistory();
		this.evaluateXp();
	}

	public removeLog(id: string): void {
		this.history = this.history.filter(log => log.id !== id);
		this.evaluateXp();
		this.sortHistory();
	}

	public getLevel(xp = this.totalXp): number {
		let level = 0;

		while (xp >= this.getXpTotal(level + 1)) {
			level++;
		}

		return level;
	}

	public getXpGoal(level = this.getLevel() + 1): number {
		return 10 * level;
	}

	private getXpTotal(level = this.getLevel()): number {
		return 10 * ((level * (level + 1)) / 2);
	}

	public getCurrentXp(xp = this.totalXp): number {
		return xp - this.getXpTotal(this.getLevel(xp));
	}

	public getTopic(id: string): TopicTreeNode | null {
		if (!id) return null;

		for (const topic of this.studyTopics) {
			const found = topic.search(id);
			if (found) return found;
		}

		return null;
	}

	public toJSON(): UserJSON {
		return {
			username: this._username,
			id: this._id,
			habits: this._habits.map(h => h.toJSON()),
			studyTopics: this._studyTopics.map(s => s.toJSON()),
			history: this._history.map(h => h.toJSON()),
			version: this._version,
			badges: this._badges.map(b => b.name),
		};
	}

	public static fromJSON(json: UserJSON): User {
		return new User(
			json.username,
			json.id,
			json.habits.map(h => HabitFactory.createHabit(h as HabitJSON)),
			json.studyTopics.map(s =>
				TopicTreeNode.fromJSON(s as TopicTreeNodeJSON)
			),
			json.history.map(h =>
				HabitLogFactory.createHabitLog(h as HabitLogJSON)
			),
			json.version,
			json.badges
		);
	}
}
