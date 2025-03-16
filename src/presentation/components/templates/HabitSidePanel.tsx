import GradualHabit from "@core/habits/GradualHabit.js";
import Habit from "@core/habits/Habit.js";
import StudyHabit from "@core/habits/StudyHabit.js";
import React, {
	CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { deleteHabit, saveHabit, useUser } from "../../utils/userUtils.js";
import { Icon } from "../UI/Icon.jsx";
import { TopicSelector } from "../UI/TopicSelector.jsx";
import TopicTreeNode from "@core/study/TopicTreeNode.js";

type HabitState = Habit | GradualHabit | StudyHabit | null;
type HabitType = "standard" | "gradual" | "study";

export function HabitSidePanel(props: {
	habit: HabitState;
	top: number;
	isNewHabit: boolean;
	onClose: () => void;
	onAdd: () => void;
}) {
	const [user] = useUser();

	const [habitState, setHabitState] = useState<HabitState>(props.habit);
	const [colorOpen, setColorOpen] = useState(false);

	// Reset local state when prop changes
	useEffect(() => {
		props.habit && setHabitState(props.habit);
		setColorOpen(false);
	}, [props.habit]);

	const createHabitInstance = useCallback(
		(updates: Partial<HabitState>): HabitState => {
			if (!habitState) return null;

			try {
				const baseFields = {
					id: updates.id ?? habitState.id,
					name: updates.name ?? habitState.name ?? "Habit",
					description:
						updates.description ??
						habitState.description ??
						"Description",
					color: updates.color ?? habitState.color ?? -1,
					days: updates.days ??
						habitState.days ?? [
							false,
							false,
							false,
							false,
							false,
							false,
							false,
						],
					time: updates.time ?? habitState.time ?? "00:00",
				};

				switch (updates.type ?? habitState.type) {
					case "gradual":
						return new GradualHabit(
							baseFields.name,
							baseFields.id,
							baseFields.description,
							baseFields.color,
							baseFields.days,
							baseFields.time,
							(updates as Partial<GradualHabit>).goal ??
								(habitState as GradualHabit).goal ??
								1
						);
					case "study":
						return new StudyHabit(
							baseFields.name,
							baseFields.id,
							baseFields.description,
							baseFields.color,
							baseFields.days,
							baseFields.time,
							(updates as Partial<StudyHabit>).topic ?? null,
							(updates as Partial<StudyHabit>).dynamic ??
								(habitState as StudyHabit).dynamic ??
								false,
							(updates as Partial<StudyHabit>).length ??
								(habitState as StudyHabit).length ??
								1
						);
					default:
						return new Habit(
							baseFields.name,
							baseFields.id,
							baseFields.description,
							baseFields.color,
							baseFields.days,
							baseFields.time
						);
				}
			} catch (e) {
				alert(`Error creating habit: ${e}`);
			}
		},
		[habitState]
	);

	const handleStateUpdate = useCallback(
		(updates: Partial<HabitState>, immediateSave = false) => {
			const newHabit = createHabitInstance(updates);

			setHabitState(newHabit);

			if (immediateSave && !props.isNewHabit) {
				saveHabit(newHabit);
			}
		},
		[createHabitInstance, habitState, props.isNewHabit]
	);

	const handleTextChange = useCallback(
		(field: keyof Habit | keyof GradualHabit | keyof StudyHabit) =>
			(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				handleStateUpdate({ [field]: e.target.value });
			},
		[handleStateUpdate]
	);

	const handleNumberChange = useCallback(
		(field: keyof Habit | keyof GradualHabit | keyof StudyHabit) =>
			(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				handleStateUpdate({ [field]: parseInt(e.target.value) });
			},
		[handleStateUpdate]
	);

	const handleTextBlur = useCallback(
		(field: keyof Habit | keyof GradualHabit | keyof StudyHabit) =>
			(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (!props.isNewHabit) {
					handleStateUpdate({ [field]: e.target.value }, true);
				}
			},
		[handleStateUpdate, props.isNewHabit]
	);

	const handleNumberBlur = useCallback(
		(field: keyof Habit | keyof GradualHabit | keyof StudyHabit) =>
			(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				if (!props.isNewHabit) {
					handleStateUpdate(
						{ [field]: parseInt(e.target.value) },
						true
					);
				}
			},
		[handleStateUpdate, props.isNewHabit]
	);

	const ColorPicker = useMemo(
		() => (
			<div className="color-popup">
				{Array.from({ length: 8 }, (_, i) => (
					<div
						key={i}
						className={`color color-${i}`}
						onClick={e => {
							e.stopPropagation();
							setColorOpen(false);
							handleStateUpdate({ color: i }, false);
						}}
					/>
				))}
			</div>
		),
		[handleStateUpdate]
	);

	const DayButtons = useMemo(
		() =>
			habitState?.days.map((active, day) => (
				<button
					key={day}
					className={`day-button ${active ? "active" : ""}`}
					onClick={() => {
						const newDays = [...habitState.days];
						newDays[day] = !newDays[day];
						handleStateUpdate({ days: newDays }, true);
					}}
				>
					{["S", "M", "T", "W", "T", "F", "S"][day]}
				</button>
			)),
		[habitState?.days, handleStateUpdate]
	);

	const TypeSpecificFields = useMemo(() => {
		if (!habitState) return null;
		switch (habitState.type) {
			case "gradual":
				return (
					<div className="goal-container" style={{ flex: 1 }}>
						<label htmlFor="gradual">Goal:</label>
						<input
							type="number"
							name="gradual"
							step={1}
							style={{ flex: 1 }}
							min={0}
							max={999}
							value={(habitState as GradualHabit).goal}
							onChange={handleNumberChange("goal")}
							onBlur={handleNumberBlur("goal")}
						/>
					</div>
				);
			case "study":
				return (
					<>
						<StudyTypeSelector
							habit={habitState as StudyHabit}
							onUpdate={handleStateUpdate}
							availableTopics={user.topics}
						/>
					</>
				);
			default:
				return null;
		}
	}, [habitState?.type, handleTextChange, handleTextBlur]);

	if (!habitState)
		return (
			<div className="habit-side-panel-container">
				<div className="habit-side-panel closed"></div>

				<button className="add-habit-button" onClick={props.onAdd}>
					<Icon icon="plus" />
				</button>
			</div>
		);

	return (
		<div className="habit-side-panel-container">
			<div
				className={`habit-side-panel color-${habitState.color} ${
					props.habit ? "open" : "closed"
				} type-${habitState.type.toLowerCase()}`}
				style={
					{
						"--top": `${props.top}px`,
					} as CSSProperties
				}
			>
				<div className="row" style={{ alignItems: "flex-start" }}>
					<input
						placeholder="Task Name"
						className="name"
						type="text"
						value={habitState.name}
						onChange={handleTextChange("name")}
						onBlur={handleTextBlur("name")}
					/>
					<button
						className={`color ${colorOpen ? "open" : ""}`}
						onClick={() => setColorOpen(!colorOpen)}
					>
						{colorOpen && ColorPicker}
					</button>
				</div>

				<textarea
					placeholder="Task Description"
					className="description"
					value={habitState.description}
					onChange={handleTextChange("description")}
					onBlur={handleTextBlur("description")}
				/>

				<div className="row days">{DayButtons}</div>

				<div
					className="row"
					style={{ justifyContent: "space-between" }}
				>
					<div className="time-container">
						<label htmlFor="time">Time:</label>
						<input
							type="time"
							className="time"
							value={habitState.time}
							onChange={handleTextChange("time")}
							onBlur={handleTextBlur("time")}
						/>
					</div>

					{habitState.type === "gradual" && TypeSpecificFields}

					<select
						value={habitState.type}
						className="type"
						onChange={e =>
							handleStateUpdate(
								{ type: e.target.value as HabitType },
								true
							)
						}
					>
						{["Standard", "Gradual", "Study"].map(type => (
							<option key={type} value={type.toLowerCase()}>
								{type}
							</option>
						))}
					</select>
				</div>

				{habitState.type === "study" && TypeSpecificFields}

				<div className="bottom">
					<button
						className="save"
						onClick={() => {
							saveHabit(habitState);
							props.onClose();
						}}
					>
						<Icon icon="habit" />
					</button>
					<button
						className="delete"
						onClick={() => {
							if (habitState.id) deleteHabit(habitState.id);
							props.onClose();
						}}
					>
						<Icon icon="trash" />
					</button>
				</div>
			</div>

			<button className="add-habit-button" onClick={props.onAdd}>
				<Icon icon="plus" />
			</button>
		</div>
	);
}

function StudyTypeSelector(props: {
	habit: StudyHabit;
	onUpdate: (updates: Partial<StudyHabit>) => void;
	availableTopics: TopicTreeNode[];
}) {
	const [studyMode, setStudyMode] = useState<"static" | "dynamic">(
		props.habit.dynamic ? "dynamic" : "static"
	);

	const handleModeChange = (mode: "static" | "dynamic") => {
		setStudyMode(mode);
		props.onUpdate({
			dynamic: mode === "dynamic",
			topic: mode === "dynamic" ? null : props.habit.topic,
		});
	};

	return (
		<div className="study-mode-selector">
			<div className="mode-switcher">
				<button
					className={`mode-btn ${
						studyMode === "static" ? "active" : ""
					}`}
					onClick={() => handleModeChange("static")}
				>
					Specific Topic
				</button>
				<button
					className={`mode-btn ${
						studyMode === "dynamic" ? "active" : ""
					}`}
					onClick={() => handleModeChange("dynamic")}
				>
					Dynamic Selection
				</button>
			</div>

			{studyMode === "static" ? (
				<div className="row">
					<label htmlFor="study-topic">Topic:</label>
					<TopicSelector
						initialValue={props.habit.topic?.name || ""}
						nodes={props.availableTopics}
						onSelect={topic =>
							props.onUpdate({ topic: topic || null })
						}
					/>
				</div>
			) : (
				<div className="dynamic-description">
					<span>
						Topics will be automatically selected based on your
						progress, difficulty, and other factors.
					</span>
				</div>
			)}

			<div className="row duration-container">
				<label htmlFor="study-duration">Session Duration:</label>
				<input
					type="number"
					step={1}
					value={props.habit.length}
					onChange={e =>
						props.onUpdate({ length: Number(e.target.value) })
					}
					min="1"
				/>
				<span>minutes</span>
			</div>
		</div>
	);
}
