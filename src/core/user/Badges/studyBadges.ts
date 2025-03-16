import HabitLog from "@core/habitLogs/HabitLog.js";
import Badge from "../Badge.js";
import StudyHabitLog from "@core/habitLogs/StudyHabitLog.js";

function checkTopicCompletion(history: HabitLog[]) {
	// Get the maximum number of times a topic has been completed
	return Math.max(
		...Object.values(
			// make an object with topic id as key and the number of times that
			// habit has been completed as value
			history
				.filter(e => e.habit.type === "Study")
				.reduce(
					(acc, curr: StudyHabitLog) => {
						acc[curr.topic.id] =
							(acc[curr.topic.id] || 0) +
							(curr.isCompleted() ? 1 : 0);
						return acc;
					},

					{} as Record<string, number>
				)
		)
	);
}

const FocusedLearner = new Badge(
	"Focused Learner",
	"Complete 10 study sessions",
	10,
	10,
	user => user.history.filter(h => h.habit.type === "Study").length
);

const StudiousScholar = new Badge(
	"Studious Scholar",
	"Complete 30 study sessions",
	10,
	30,
	user => user.history.filter(h => h.habit.type === "Study").length
);

const AcademicAce = new Badge(
	"Academic Master",
	"Complete 100 study sessions",
	75,
	100,
	user => user.history.filter(h => h.habit.type === "Study").length
);

const Adept = new Badge(
	"Adept",
	"Complete 10 study sessions on one topic",
	10,
	10,
	user => checkTopicCompletion(user.history)
);

const Virtuoso = new Badge(
	"Virtuoso",
	"Complete 30 study sessions on one topic",
	30,
	30,
	user => checkTopicCompletion(user.history)
);

const Maestro = new Badge(
	"Maestro",
	"Complete 50 study sessions on one topic",
	30,
	50,
	user => checkTopicCompletion(user.history)
);

export default [
	FocusedLearner,
	StudiousScholar,
	AcademicAce,
	Adept,
	Virtuoso,
	Maestro,
];
