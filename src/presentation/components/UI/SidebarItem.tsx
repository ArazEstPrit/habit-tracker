import React from "react";
import { Link } from "./Link.jsx";
import { Icon } from "./Icon.jsx";

export function SidebarItem(props: {
	icon: string;
	title: string;
	to: string;
}) {
	return (
		<>
			<Link to={props.to}>
				<Icon icon={props.icon} />
				{props.title}
			</Link>
			<hr />
		</>
	);
}
