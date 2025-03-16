import React from "react";

export function Icon(props: { icon: string; className?: string }) {
	return (
		<svg
			viewBox="0 0 32 32"
			aria-label={props.icon}
			className={"icon " + props.className}
		>
			<use
				className="light"
				href={"/public/icons/" + props.icon + ".svg#1"}
			></use>
			<use
				className="dark"
				href={"/public/icons/" + props.icon + "-dark.svg#1"}
			></use>
		</svg>
		// <div
		// 	style={{
		// 		backgroundImage: `url(/public/icons/${props.icon}.svg)`,
		// 		width: "32px",
		// 		height: "32px",
		// 	}}
		// ></div>
	);
}
