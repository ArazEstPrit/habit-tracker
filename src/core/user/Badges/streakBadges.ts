import UserController from "@application/controllers/UserController.js";
import Badge from "../Badge.js";

const SparkingFlame = new Badge(
	"Sparking Flame",
	"Complete a 5 day streak",
	10,
	5,
	// We want the longest streak
	user => UserController.getStreakInfo(user)[1]
);

const BlazingTorch = new Badge(
	"Blazing Torch",
	"Complete a 10 day streak",
	20,
	10,
	user => UserController.getStreakInfo(user)[1]
);

const InfernoMaster = new Badge(
	"Inferno Master",
	"Complete a 30 day streak",
	50,
	30,
	user => UserController.getStreakInfo(user)[1]
);

const UltimateStreaker = new Badge(
	"Ultimate Streaker",
	"Complete a 100 day streak",
	150,
	100,
	user => UserController.getStreakInfo(user)[1]
);

export default [SparkingFlame, BlazingTorch, InfernoMaster, UltimateStreaker];
