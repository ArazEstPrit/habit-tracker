import React from "react";
import { HabitListItem } from "./HabitListItem.jsx";
import Habit from "@core/habits/Habit.js";
import { UserInfo } from "@application/controllers/UserController.js";

export function HabitList(props: {
	habits: Habit[];
	selectedHabit: Habit | null;
	setSelectedHabit: (habit: Habit | null) => void;
	user: UserInfo | null;
	noHabitsMessage?: string;
}) {
	if (props.habits.length === 0 && props.noHabitsMessage)
		return (
			<>
				<p className="no-habits">{props.noHabitsMessage}</p>
			</>
		);

	return props.habits.map(habit => (
		<HabitListItem
			key={habit.id}
			habit={habit}
			log={props.user?.historyToday.find(
				log => log.habit.id === habit.id
			)}
			active={props.selectedHabit?.id === habit.id}
			onClick={() => {
				props.setSelectedHabit(
					props.selectedHabit?.id === habit.id ? null : habit
				);
			}}
		/>
	));
}
