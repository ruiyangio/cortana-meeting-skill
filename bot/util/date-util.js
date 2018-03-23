const joda = require('js-joda');
const LocalDateTime = joda.LocalDateTime;
const LocalDate = joda.LocalDate;
const LocalTime = joda.LocalTime;
const TemporalAdjusters = joda.TemporalAdjusters;
const DayOfWeek = joda.DayOfWeek;

function dateEntityToDate(dateEntity) {
    // Only support today/tomorrow 3:00 pm for demo
    const dateParts = dateEntity.split(' ');
    let now = LocalDateTime.now();
    let tomorrow = now.plusDays(1);

    const scope = dateParts[0];
    if (dateParts.length === 1) {
        return scope === 'tomorrow'
            ? new Date(tomorrow.toString())
            : new Date(now.toString());
    }

    const offsets = dateParts[1].split(':');
    const hour =
        dateParts[2] === 'pm'
            ? parseInt(offsets[0]) + 12
            : parseInt(offsets[0]);
    const minutes = parseInt(offsets[1]);

    now = now.atTime(LocalTime.of(hour, minutes));
    tomorrow = tomorrow.atTime(LocalTime.of(hour, minutes));

    return scope === 'tomorrow'
        ? new Date(tomorrow.toString())
        : new Date(now.toString());
}

function dateEntityToDateQuery(dateEntity) {
    let res = { start: new Date(), end: new Date() };
    const now = LocalDateTime.now();
    const tomorrow = now.plusDays(1);
    const theDayAfter = now.plusDays(2);

    if (dateEntity === 'today') {
        res.start = new Date(now.toString());
        res.end = new Date(tomorrow.toString());
    } else if (dateEntity === 'tomorrow') {
        res.start = new Date(tomorrow.toString());
        res.end = new Date(theDayAfter.toString());
    } else if (dateEntity === 'this week') {
        const sunday = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        res.start = new Date(now.toString());
        res.end = new Date(sunday.toString());
    } else if (dateEntity === 'next week') {
        const nextMonday = now.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        const nextSunday = nextMonday.with(
            TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)
        );
        res.start = new Date(nextMonday.toString());
        res.end = new Date(nextSunday.toString());
    }

    return res;
}

function convertToODataFormat(date) {
    return date.toISOString();
}

module.exports = {
    dateEntityToDateQuery: dateEntityToDateQuery,
    convertToODataFormat: convertToODataFormat,
    dateEntityToDate: dateEntityToDate
};
