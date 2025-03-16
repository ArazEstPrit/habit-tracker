import React from "react";
import { Link } from "../UI/Link.jsx";
import { Icon } from "../UI/Icon.jsx";
import { useUser } from "../../utils/userUtils.js";
import { ProfilePicture } from "./ProfilePicture.jsx";

export function ProfileCard() {
	const [user] = useUser();

	return (
		<>
			<div className="profile-card-container">
				<div className="profile-card">
					<StreakIndicator streak={user?.stats.streak} />
					<div className="name-xp">
						<div className="username">{user?.username}</div>
						<XpBar
							xp={user?.xp || 0}
							level={user?.level || 0}
							xpForNextLevel={user?.xpForNextLevel || 0}
						/>
					</div>
					<Link className="link" to="/profile">
						<ProfilePicture show={false} level={user?.level} />
					</Link>
					<div className="links">
						<div className="link">
							<span>Statistics</span>
							<Link className="stats-link" to="/statistics">
								<Icon icon="stats" />
							</Link>
						</div>
						<div className="link">
							<span>Settings</span>
							<Link className="settings-link" to="/settings">
								<Icon icon="settings" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export function StreakIndicator(props: { streak?: number }) {
	return (
		<div className="streak-indicator">
			<Icon icon="flame" />
			<span>{props.streak}</span>
		</div>
	);
}

export function XpBar(props: {
	xp: number;
	level: number;
	xpForNextLevel: number;
}) {
	return (
		<div className="xp-bar-container">
			<div className="xp-bar">
				<div
					className="fill"
					style={{
						width: `${(props.xp / props.xpForNextLevel) * 100}%`,
					}}
				></div>
			</div>
			<div className="info-bar">
				<div className="level">Level {props.level}</div>
				<div className="xp">
					{props.xp}/{props.xpForNextLevel}
				</div>
			</div>
		</div>
	);
}
