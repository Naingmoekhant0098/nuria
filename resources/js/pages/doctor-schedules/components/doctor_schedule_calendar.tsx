import type { Doctor, DoctorClinicSchedule } from './doctor_schedule_form';

interface GroupedDoctorSchedules {
    doctor: Doctor | null;
    schedules: DoctorClinicSchedule[];
}

interface DoctorScheduleCalendarProps {
    schedules: GroupedDoctorSchedules[];
}

interface SchedulePosition {
    left: number;
    width: number;
}

const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const startHour = 7;
const endHour = 22;
const hourWidth = 64;
const dayWidth = (endHour - startHour) * hourWidth;
const labelWidth = 190;

const doctorColors = [
    '#337983',
    '#6366f1',
    '#c26d3a',
    '#8b5cf6',
    '#0f766e',
    '#be5672',
];

function getDoctorName(doctor: Doctor | null): string {
    if (!doctor) {
        return 'Unknown doctor';
    }

    return [doctor.first_name, doctor.middle_name, doctor.last_name]
        .filter(Boolean)
        .join(' ')
        .replace(/^Dr\.\s*/i, '');
}

function getMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return (hours || 0) * 60 + (minutes || 0);
}

function getSchedulePosition(
    schedule: DoctorClinicSchedule,
): SchedulePosition | null {
    const dayIndex = daysOfWeek.indexOf(schedule.day_of_week);

    if (dayIndex === -1) {
        return null;
    }

    const start = Math.max(getMinutes(schedule.start_time), startHour * 60);
    const end = Math.min(getMinutes(schedule.end_time), endHour * 60);

    if (end <= start) {
        return null;
    }

    return {
        left: dayIndex * dayWidth + ((start - startHour * 60) / 60) * hourWidth,
        width: ((end - start) / 60) * hourWidth,
    };
}

function getCurrentWeekMonday(): Date {
    const date = new Date();
    const day = date.getDay();
    const daysSinceMonday = day === 0 ? 6 : day - 1;

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysSinceMonday);

    return date;
}

function formatDate(date: Date, dayIndex: number): string {
    const day = new Date(date);

    day.setDate(day.getDate() + dayIndex);

    return day.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

export default function DoctorScheduleCalendar({
    schedules,
}: DoctorScheduleCalendarProps) {
    const monday = getCurrentWeekMonday();
    const timelineWidth = dayWidth * daysOfWeek.length;

    return (
        <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 px-6 py-5">
                <h2 className="text-base font-semibold text-white">
                    Doctor schedule Gantt chart
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Each doctor is a row and each colored task shows the
                    doctor&apos;s available day and time.
                </p>
            </div>

            <div className="overflow-x-auto p-3 sm:p-5">
                <div
                    className="min-w-max overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"
                    style={{ width: labelWidth + timelineWidth }}
                >
                    <div className="flex border-b border-neutral-800 bg-neutral-900">
                        <div
                            className="shrink-0 border-r border-neutral-800 px-4 py-3 text-xs font-semibold tracking-wide text-gray-400 uppercase"
                            style={{ width: labelWidth }}
                        >
                            Doctor
                        </div>

                        <div
                            className="grid"
                            style={{
                                width: timelineWidth,
                                gridTemplateColumns: `repeat(${daysOfWeek.length}, ${dayWidth}px)`,
                            }}
                        >
                            {daysOfWeek.map((day, dayIndex) => (
                                <div
                                    key={day}
                                    className="border-r border-neutral-800 last:border-r-0"
                                >
                                    <div className="px-3 py-3 text-center text-xs font-semibold text-gray-300">
                                        {day}{' '}
                                        <span className="text-gray-500">
                                            {formatDate(monday, dayIndex)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {schedules.map(
                        (
                            { doctor, schedules: doctorSchedules },
                            doctorIndex,
                        ) => (
                            <div
                                key={doctor?.id ?? `doctor-${doctorIndex}`}
                                className="flex min-h-20 border-b border-neutral-800 last:border-b-0"
                            >
                                <div
                                    className="flex shrink-0 items-center border-r border-neutral-800 bg-neutral-900/60 px-4 text-sm font-medium text-gray-200"
                                    style={{ width: labelWidth }}
                                >
                                    <span className="truncate">
                                        Dr. {getDoctorName(doctor)}
                                    </span>
                                </div>

                                <div
                                    className="relative h-20"
                                    style={{
                                        width: timelineWidth,
                                        backgroundImage:
                                            'repeating-linear-gradient(to right, transparent 0, transparent 63px, rgb(38 38 38 / 0.7) 63px, rgb(38 38 38 / 0.7) 64px)',
                                    }}
                                >
                                    {doctorSchedules.map((schedule) => {
                                        const position =
                                            getSchedulePosition(schedule);

                                        if (!position) {
                                            return null;
                                        }

                                        const color =
                                            doctorColors[
                                                doctorIndex %
                                                    doctorColors.length
                                            ];

                                        return (
                                            <div
                                                key={schedule.id}
                                                className="absolute top-3 flex h-14 min-w-8 items-center overflow-hidden rounded-md px-2 text-xs font-medium text-white shadow-lg"
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    backgroundColor: color,
                                                }}
                                                title={`${schedule.day_of_week}, ${schedule.start_time} - ${schedule.end_time} · capacity ${schedule.max_patients_per_slot}`}
                                            >
                                                <span className="truncate">
                                                    {schedule.start_time.slice(
                                                        0,
                                                        5,
                                                    )}{' '}
                                                    -{' '}
                                                    {schedule.end_time.slice(
                                                        0,
                                                        5,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}
