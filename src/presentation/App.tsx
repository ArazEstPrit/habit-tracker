import React, { useEffect, useState } from "react";
import "./styles/main.scss";
import { Sidebar } from "./components/templates/Sidebar.jsx";
import { ThemeButton } from "./components/UI/ThemeButton.jsx";
import { ProfileCard } from "./components/templates/ProfileCard.jsx";
import { RegisterPopup } from "./components/templates/RegisterPopup.jsx";
import { fetchUserInfo, UserContext } from "./utils/userUtils.js";
import { Router } from "./components/Router.jsx";
import { UserInfo } from "@application/controllers/UserController.js";

const Notification = (props: { message: string; type: string }) => {
	return (
		<div className={`notification ${props.type}`} role="alert">
			{props.message}
		</div>
	);
};

export function App() {
	const [user, setUser] = useState<UserInfo | null>(null);
	const [notification, setNotification] = useState(null);

	document.documentElement.dataset.primary =
		localStorage.getItem("primaryColor");

	useEffect(() => {
		new EventSource(window.location.origin + "/api/sse").onmessage =
			event => {
				const { id, message, type } = JSON.parse(event.data);
				const handlers = {
					refreshUser: () => {
						fetchUserInfo().then(setUser);
					},
					init: () => {
						handlers.refreshUser();
					},
				};

				handlers[id] && handlers[id]();

				if (type !== "hidden") {
					setNotification({ message, type });
					setTimeout(() => setNotification(null), 5000);
				}
			};
	}, []);

	return (
		<UserContext.Provider value={[user, setUser]}>
			<Sidebar />
			<ThemeButton />
			<ProfileCard />
			{user?.isNewUser && <RegisterPopup />}
			<Router />
			{notification && (
				<Notification
					message={notification.message}
					type={notification.type}
				/>
			)}
		</UserContext.Provider>
	);
}
