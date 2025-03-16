import Badge from "@core/user/Badge.js";
import consistencyBadges from "@core/user/Badges/consistencyBadges.js";
import habitBadges from "@core/user/Badges/habitBadges.js";
import streakBadges from "@core/user/Badges/streakBadges.js";
import studyBadges from "@core/user/Badges/studyBadges.js";
import timeBadges from "@core/user/Badges/timeBadges.js";
import User from "@core/user/User.js";

export default class BadgeService {
	private static badges: Badge[] = [
		...streakBadges,
		...consistencyBadges,
		...timeBadges,
		...studyBadges,
		...habitBadges,
	];

	public static getBadgeFromName(name: string): Badge | undefined {
		return this.badges.find(badge => badge.name === name);
	}

	public static getBadges(): Badge[] {
		return this.badges;
	}

	// [0]: badges to add, [1]: badges to remove
	public static evaluateBadges(user: User): Badge[][] {
		return this.badges.reduce(
			(badges, badge: Badge) => {
				if (badge.checkCondition(user)) {
					badges[0].push(badge);
				} else if (user.badges.some(b => b.name === badge.name)) {
					badges[1].push(badge);
				}

				return badges;
			},
			[[], []]
		);
	}
}
