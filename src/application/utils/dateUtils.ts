export function isSameDay(date1: Date, date2: Date) {
	if (!date1 || !date2) return false;

	const dateO1 = new Date(date1);
	const dateO2 = new Date(date2);

	return (
		dateO1.getFullYear() === dateO2.getFullYear() &&
		dateO1.getMonth() === dateO2.getMonth() &&
		dateO1.getDate() === dateO2.getDate()
	);
}

export function daysInBetween(date1: Date, date2: Date): Date[] {
	const dates: Date[] = [];

	const currentDate = new Date(date1);
	currentDate.setHours(0, 0, 0, 0);

	const endDate = new Date(date2);
	endDate.setHours(23, 59, 59, 999);

	while (currentDate < endDate) {
		dates.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

export function getWeek(date: Date) {
	const oneJan = new Date(date.getFullYear(), 0, 1);

	return Math.ceil(
		((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay()) / 7
	);
}
