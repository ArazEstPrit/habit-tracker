import React from "react";

export function SettingsPage() {
	type Color =
		| "default"
		| "red"
		| "orange"
		| "yellow"
		| "green"
		| "blue"
		| "indigo"
		| "purple"
		| "pink";

	const [color, setColor] = React.useState<Color>(() => {
		return (localStorage.getItem("primaryColor") as Color) || "default";
	});

	React.useEffect(() => {
		document.documentElement.dataset.primary = color;
		localStorage.setItem("primaryColor", color);
	}, [color]);

	return (
		<div className="main">
			<h2>Settings</h2>
			<div
				className="container"
				style={{
					width: "fit-content",
					padding: "3rem",
					borderRadius: "10px",
					backgroundColor: "var(--muted-background)",
				}}
			>
				Primary Color:
				<select
					value={color}
					onChange={e => setColor(e.target.value as Color)}
					style={{ marginLeft: "1rem" }}
				>
					<option value="default">Default</option>
					<option value="red">Red</option>
					<option value="orange">Orange</option>
					<option value="yellow">Yellow</option>
					<option value="green">Green</option>
					<option value="blue">Blue</option>
					<option value="indigo">Indigo</option>
					<option value="purple">Purple</option>
					<option value="pink">Pink</option>
				</select>
			</div>
		</div>
	);
}
