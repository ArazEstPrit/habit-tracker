import React from "react";

export function Link(props: {
	to: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<a
			href={props.to}
			className={props.className}
			onClick={event => {
				event.preventDefault();
				window.history.pushState({}, "", props.to);
				window.dispatchEvent(new PopStateEvent("navigate"));
			}}
		>
			{props.children}
		</a>
	);
}
