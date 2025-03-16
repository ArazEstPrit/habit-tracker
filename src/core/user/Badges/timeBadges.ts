import Badge from "../Badge.js";

const NightOwl = new Badge(
	"Night Owl",
	"Complete a Habit between midnight and 6am",
	10,
	1,
	user =>
		user.history.filter(
			h => h.date.getHours() >= 0 && h.date.getHours() < 6
		).length
);

const EarlyBird = new Badge(
	"Early Bird",
	"Complete a Habit between 6am and 9am",
	10,
	1,
	user =>
		user.history.filter(
			h => h.date.getHours() >= 6 && h.date.getHours() < 9
		).length
);

export default [NightOwl, EarlyBird];
