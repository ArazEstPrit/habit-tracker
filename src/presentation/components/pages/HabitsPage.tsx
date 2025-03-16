import Habit from "@core/habits/Habit.js";
import React, { useEffect, useState } from "react";
import { useUser } from "../../utils/userUtils.js";
import { HabitSidePanel } from "../templates/HabitSidePanel.jsx";
import { HabitList } from "../templates/HabitList.jsx";

export function HabitsPage() {
	const [user] = useUser();
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [isNewHabit, setIsNewHabit] = useState(false);
	const [panelTopPosition, setPanelTopPosition] = useState(0);

	const habits = user?.habits || [];

	const [standardHabits, gradualHabits, studyHabits] = habits.reduce(
		(acc, curr) =>
			({
				standard: [[...acc[0], curr], acc[1], acc[2]],
				gradual: [acc[0], [...acc[1], curr], acc[2]],
				study: [acc[0], acc[1], [...acc[2], curr]],
			})[curr.type],
		[[], [], []]
	);

	useEffect(() => {
		if (selectedHabit) {
			const targetElement = document.querySelector(
				`.habit-list-item[data-id="${selectedHabit.id}"]`
			) as HTMLElement;

			if (targetElement) {
				setPanelTopPosition(targetElement.offsetTop);
			}
		}
	}, [selectedHabit]);

	useEffect(() => {
		if (user) {
			setSelectedHabit(
				habits.find(habit => habit.id === selectedHabit?.id) || null
			);
		}
	}, [user]);

	const handleAddHabit = () => {
		if (isNewHabit) {
			setIsNewHabit(false);
			setSelectedHabit(null);
		} else {
			setIsNewHabit(true);
			setPanelTopPosition(0);
			setSelectedHabit(
				new Habit(
					"Habit",
					"fakeID",
					"Description",
					-1,
					new Array(7).fill(true),
					""
				)
			);
		}
	};

	return (
		<div className="main">
			<h2>Habits</h2>

			<div className="habit-list-container">
				<div className="habit-list">
					{standardHabits.length > 0 && (
						<>
							<h3>Standard Habits</h3>
							<HabitList
								habits={standardHabits}
								selectedHabit={selectedHabit}
								setSelectedHabit={setSelectedHabit}
								user={user}
								noHabitsMessage="No standard habits"
							/>
							<hr />
						</>
					)}
					{gradualHabits.length > 0 && (
						<>
							<h3>Gradual Habits</h3>
							<HabitList
								habits={gradualHabits}
								selectedHabit={selectedHabit}
								setSelectedHabit={setSelectedHabit}
								user={user}
								noHabitsMessage="No gradual habits"
							/>
							<hr />
						</>
					)}
					{studyHabits.length > 0 && (
						<>
							<h3>Study Habits</h3>
							<HabitList
								habits={studyHabits}
								selectedHabit={selectedHabit}
								setSelectedHabit={setSelectedHabit}
								user={user}
								noHabitsMessage="No study habits"
							/>
						</>
					)}
				</div>
				<HabitSidePanel
					habit={selectedHabit}
					top={panelTopPosition}
					isNewHabit={isNewHabit}
					onClose={() => setSelectedHabit(null)}
					onAdd={handleAddHabit}
				/>
			</div>
		</div>
	);
}
