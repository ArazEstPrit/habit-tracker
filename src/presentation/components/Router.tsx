import React, { useEffect, useState } from "react";
import { HomePage } from "./pages/HomePage.jsx";
import { HabitsPage } from "./pages/HabitsPage.jsx";
import { StudyPage } from "./pages/StudyPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { StatisticsPage } from "./pages/StatisticsPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

const routes = [
	{ path: "/", component: HomePage },
	{ path: "/habits", component: HabitsPage },
	{ path: "/study", component: StudyPage },
	{
		path: "/profile",
		component: ProfilePage,
	},
	{
		path: "/statistics",
		component: StatisticsPage,
	},
	{
		path: "/settings",
		component: SettingsPage,
	},
];

export function Router() {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);

	useEffect(() => {
		const onLocationChange = () => {
			setCurrentPath(window.location.pathname);
		};
		window.addEventListener("navigate", onLocationChange);
		return () => window.removeEventListener("navigate", onLocationChange);
	}, []);

	const activeRoute = routes.find(route => route.path === currentPath);

	if (!activeRoute) return null;

	const Component = activeRoute.component;

	return <Component key={currentPath} />;
}
