import type { InterviewAppointment, InterviewSlot, WeeklyInterviewAvailability } from './verificationRules';

const appointmentMinutes = 30;

export function createAvailableInterviewSlots(
  rules: WeeklyInterviewAvailability[],
  appointments: InterviewAppointment[],
  from: Date,
  days = 60,
): InterviewSlot[] {
  const result: InterviewSlot[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(from);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const weekdayRules = rules.filter((rule) => rule.weekday === date.getDay());
    for (const rule of weekdayRules) {
      const [startHour, startMinute] = rule.startsAt.split(':').map(Number);
      const [endHour, endMinute] = rule.endsAt.split(':').map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      for (let minute = start; minute + appointmentMinutes <= end; minute += appointmentMinutes) {
        const startsAt = new Date(date);
        startsAt.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        if (startsAt <= from) continue;
        if (result.some((slot) => slot.startsAt === startsAt.toISOString())) continue;
        if (appointments.some((appointment) => appointment.startsAt === startsAt.toISOString())) continue;
        result.push({
          id: `${rule.id}:${startsAt.toISOString()}`,
          startsAt: startsAt.toISOString(),
          modality: rule.modality,
          place: rule.place,
        });
      }
    }
  }
  return result.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getMonthDates(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - first.getDay());
  const end = new Date(year, month, last.getDate() + (6 - last.getDay()));
  const dates: Date[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) dates.push(new Date(cursor));
  return dates;
}
