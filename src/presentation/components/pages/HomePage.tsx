import Habit from "@core/habits/Habit.js";
import React, { useEffect, useState } from "react";
import { splitHabitList, useUser } from "../../utils/userUtils.js";
import { HabitSidePanel } from "../templates/HabitSidePanel.jsx";
import { HabitList } from "../templates/HabitList.jsx";

export function HomePage() {
	const [user] = useUser();
	const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
	const [isNewHabit, setIsNewHabit] = useState(false);
	const [panelTopPosition, setPanelTopPosition] = useState(0);

	const todaysHabits =
		user?.habits.filter(habit => habit.days[new Date().getDay()]) || [];

	const [uncompletedHabits, completedHabits] = splitHabitList(
		todaysHabits,
		user?.historyToday || []
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
				todaysHabits.find(habit => habit.id === selectedHabit?.id) ||
					null
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
			<h2>
				Hello {user?.username}, <br /> you have{" "}
				{uncompletedHabits.length} habits today.
			</h2>

			<div className="habit-list-container">
				<div className="habit-list">
					<HabitList
						habits={uncompletedHabits}
						selectedHabit={selectedHabit}
						setSelectedHabit={setSelectedHabit}
						user={user}
					/>
					<hr />
					<HabitList
						habits={completedHabits}
						selectedHabit={selectedHabit}
						setSelectedHabit={setSelectedHabit}
						user={user}
					/>
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
