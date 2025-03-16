import Badge from "../Badge.js";
import User from "../User.js";

function getUniqueHabits(user: User): number {
	return user.history.reduce((acc, h) => {
		acc.add(h.habit.id);
		return acc;
	}, new Set<string>()).size;
}

const HabitNewbie = new Badge(
	"Habit Newbie",
	"Complete 5 unique Habits",
	10,
	5,
	user => getUniqueHabits(user)
);

const HabitEnthusiast = new Badge(
	"Habit Enthusiast",
	"Complete 10 unique Habits",
	10,
	10,
	user => getUniqueHabits(user)
);

const HabitMaster = new Badge(
	"Habit Master",
	"Complete 20 unique Habits",
	10,
	20,
	user => getUniqueHabits(user)
);

export default [HabitNewbie, HabitEnthusiast, HabitMaster];
