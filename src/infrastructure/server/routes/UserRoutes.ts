/* eslint-disable @typescript-eslint/no-unused-vars */
import UserController from "@application/controllers/UserController.js";
import GradualHabitJSON from "@core/Json/GradualHabitJSON.js";
import HabitJSON from "@core/Json/HabitJSON.js";
import StudyHabitJSON from "@core/Json/StudyHabitJSON.js";
import SyncService from "@infrastructure/services/SyncService.js";
import { Router } from "express";
import cors from "cors";

export function createUserRoutes(): Router {
	const router = Router();

	router.use(cors());

	router.post("/user", (req, res) => {
		res.json(UserController.registerNewUser(req.body.username as string));
		res.end();
	});

	router.get("/user", (_req, res) => {
		const user = UserController.getUserInfo();
		res.json({
			...user,
			habits: user.habits.map(habit => habit.toJSON()),
			history: user.history.map(habitLog => habitLog.toJSON()),
			historyToday: user.historyToday.map(habitLog => habitLog.toJSON()),
			topics: user.topics.map(topic => topic.toJSON()),
			badges: user.badges.map(badge => badge.toJSON()),
		});
		res.end();
	});

	// add/edit habit
	router.post("/habit", (req, res) => {
		res.json(
			UserController.addHabit(
				req.body.habit as HabitJSON | GradualHabitJSON | StudyHabitJSON
			)
		);
		res.end();
	});

	router.delete("/habit", (req, res) => {
		res.json(UserController.deleteHabit(req.body.id));
		res.end();
	});

	// add/edit habit log
	router.post("/habit-log", (req, res) => {
		res.json(UserController.logHabit(req.body.habitId, req.body.params));
		res.end();
	});

	router.post("/habit-log/toggle", (req, res) => {
		res.json(UserController.toggleLog(req.body.id, req.body.studyOptions));
		res.end();
	});

	router.delete("/habit-log/:id", (req, res) => {
		res.json(UserController.deleteLog(req.params.id));
		res.end();
	});

	// add/edit topic
	router.post("/topic", (req, res) => {
		res.json(UserController.saveTopic(req.body.topic, req.body.parentId));
		res.end();
	});

	router.delete("/topic", (req, res) => {
		res.json(UserController.removeTopic(req.body.id));
		res.end();
	});

	router.get("/recommended-topics", (req, res) => {
		res.json(UserController.getRecommendedTopics());
		res.end();
	});

	router.get("/badges", (req, res) => {
		res.json(UserController.getBadges());
		res.end();
	});

	router.get("/discover-servers", async (req, res) => {
		const servers = await SyncService.findServersWithUsers();
		res.json(servers);
		res.end();
	});

	router.post("/select-user", (req, res) => {
		res.json(SyncService.setNewUser(req.body.id as string));
		res.end();
	});

	return router;
}
