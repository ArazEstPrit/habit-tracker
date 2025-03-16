import React from "react";
import { SidebarItem } from "../UI/SidebarItem.jsx";

export function Sidebar() {
	return (
		<>
			<div className="sidebar">
				<SidebarItem icon="home" title="Home" to="/" />
				<SidebarItem icon="habit" title="Habits" to="/habits" />
				<SidebarItem icon="study" title="Study" to="/study" />
			</div>
		</>
	);
}
