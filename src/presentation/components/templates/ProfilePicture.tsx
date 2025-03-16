import React from "react";

export function ProfilePicture(props: { level: number; show: boolean }) {
	// [id, minimum level]
	const profilePictures = [
		[6, 50],
		[5, 20],
		[4, 10],
		[3, 5],
		[2, 3],
		[1, 0],
	];

	const getProfilePicture = level => {
		for (const [pfp, minLevel] of profilePictures) {
			if (level >= minLevel) return pfp;
		}
	};

	const profilePicture = getProfilePicture(props.level);

	const [popup, setPopup] = React.useState(false);

	return (
		<div onClick={() => setPopup(!popup)} className="profile-picture">
			<img src={"/public/profile-pictures/" + profilePicture + ".svg"} />
			<div
				className="popup-container"
				style={{
					display: popup && props.show ? "flex" : "none",
				}}
			>
				<div className="popup" onClick={e => e.stopPropagation()}>
					<h3>Profile Pictures</h3>
					<div className="profile-picture-list">
						{profilePictures
							.sort((a, b) => a[1] - b[1])
							.map(([key, value]) => (
								<div key={key} className="profile-picture-item">
									<img
										src={
											"/public/profile-pictures/" +
											key +
											".svg"
										}
									/>
									<span>Level {value}</span>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
