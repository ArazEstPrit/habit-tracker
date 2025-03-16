import HabitLog from "@core/habitLogs/HabitLog.js";
import Badge from "../Badge.js";

function checkHabitCompletion(history: HabitLog[]): number {
	// Get the maximum number of times a habit has been completed
	return Math.max(
		...Object.values(
			// make an object with habit id as key and the number of times that
			// habit has been completed as value
			history.reduce(
				(acc, curr) => {
					acc[curr.habit.id] =
						(acc[curr.habit.id] || 0) +
						(curr.isCompleted() ? 1 : 0);
					return acc;
				},

				{} as Record<string, number>
			)
		)
	);
}

const FirstSteps = new Badge(
	"First Steps",
	"Complete a Habit 10 times",
	10,
	10,
	user => checkHabitCompletion(user.history)
);

const PathFinder = new Badge(
	"Path Finder",
	"Complete a Habit 30 times",
	10,
	30,
	user => checkHabitCompletion(user.history)
);

const Trailblazer = new Badge(
	"Trailblazer",
	"Complete a Habit 100 times",
	75,
	100,
	user => checkHabitCompletion(user.history)
);

export default [FirstSteps, PathFinder, Trailblazer];
