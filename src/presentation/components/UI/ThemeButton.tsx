import React, { useEffect, useState } from "react";
import { Icon } from "./Icon.jsx";

export function ThemeButton() {
	const [theme, setTheme] = useState(
		(localStorage.getItem("theme") as "light" | "dark" | undefined) ??
			window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light"
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handleChange);
		localStorage.setItem("theme", theme);
		document.documentElement.setAttribute("data-theme", theme);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [theme]);

	return (
		<button
			className="theme-button"
			onClick={() => {
				setTheme(theme === "dark" ? "light" : "dark");
			}}
		>
			<Icon icon="theme" />
		</button>
	);
}
