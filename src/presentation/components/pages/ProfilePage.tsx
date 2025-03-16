import React, { useEffect, useState } from "react";
import { StreakIndicator, XpBar } from "../templates/ProfileCard.jsx";
import { Icon } from "../UI/Icon.jsx";
import { getBadges, useUser } from "@presentation/utils/userUtils.js";
import { ProfilePicture } from "../templates/ProfilePicture.jsx";

export function ProfilePage() {
	const [user] = useUser();

	const [hoveredBadge, setHoveredBadge] = useState(null);

	function streakDay(props: { day: number; active: boolean; key: number }) {
		return (
			<div
				key={props.key}
				className={"streak-day " + (props.active ? "active" : "")}
			>
				<span>{["S", "M", "T", "W", "T", "F", "S"][props.day]}</span>
				<Icon icon="habit" className="streak-icon" />
			</div>
		);
	}

	const getWeekDays = () => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);

		const day = date.getDay();
		const days: Date[] = [];

		for (let i = 0; i < 7; i++) {
			days.push(
				new Date(
					date.getTime() -
						day * 24 * 60 * 60 * 1000 +
						i * 24 * 60 * 60 * 1000
				)
			);
		}

		return days
			.map(e => e.toISOString())
			.map(e =>
				user?.stats.dailyCompletion.some(d => d.toISOString() == e)
			);
	};

	// List of all badges. Not supposed to change ever
	const [badges, setBadges] = useState([]);

	useEffect(() => {
		getBadges().then(e =>
			setBadges(e.sort((a, b) => b.progress - a.progress))
		);
	}, [user]);

	return (
		<div className="main profile">
			<div className="page">
				<div className="main-card">
					<div className="row">
						<h2>{user?.username}</h2>
						<ProfilePicture show level={user?.level} />
					</div>
					<XpBar
						xp={user?.xp || 0}
						level={user?.level || 0}
						xpForNextLevel={user?.xpForNextLevel || 0}
					/>
				</div>

				<div className="streak-indicator-container row">
					<StreakIndicator streak={user?.stats.streak || 0} />
					{getWeekDays().map((e, i) =>
						streakDay({
							key: i,
							day: i,
							active: e,
						})
					)}
				</div>

				<div className="badge-container">
					<h3>Badges</h3>
					<div className="badges row">
						{badges.map((e, i) => (
							<div
								aria-label={e.name}
								className={
									"badge " +
									(e.progress == 1
										? "unlocked"
										: "not-unlocked")
								}
								onMouseEnter={() => {
									setHoveredBadge(e);
								}}
								onMouseLeave={() => {
									setHoveredBadge(null);
								}}
								key={i}
							>
								<Icon icon="badge" className="icon" />
							</div>
						))}
					</div>

					<div className="badge-list">
						{badges
							.filter(b => b.progress < 1)
							.map(e => (
								<div
									className="row"
									key={e.name}
									onMouseEnter={() => {
										setHoveredBadge(e);
									}}
									onMouseLeave={() => {
										setHoveredBadge(null);
									}}
								>
									<span>{e.name}</span>
									<progress
										max="1"
										value={e.progress}
									></progress>
								</div>
							))}
					</div>
				</div>
			</div>

			<div className="side-panel-container">
				<div className={"side-panel " + (hoveredBadge ? "active" : "")}>
					<h3>{hoveredBadge?.name}</h3>
					<p>{hoveredBadge?.description}</p>
					<progress max="1" value={hoveredBadge?.progress}></progress>
					<div className="row">
						<span className="reward">
							Reward: {hoveredBadge?.reward} XP
						</span>
						{hoveredBadge?.progress == 1 ? (
							<span className="unlocked">Unlocked</span>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
