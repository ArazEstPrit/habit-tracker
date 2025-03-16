import React from "react";

export function Popup(props: {
	children: React.ReactNode;
	onSubmit: () => void;
}) {
	return (
		<div className="popup-container" onClick={e => e.stopPropagation()}>
			<form
				className="popup"
				onSubmit={e => {
					e.preventDefault();
					props.onSubmit();
				}}
			>
				{props.children}
			</form>
		</div>
	);
}
