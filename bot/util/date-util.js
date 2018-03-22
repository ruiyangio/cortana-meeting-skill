const joda = require('js-joda');
const LocalDateTime = joda.LocalDateTime;
const LocalDate = joda.LocalDate;
const LocalTime = joda.LocalTime;
const TemporalAdjusters = joda.TemporalAdjusters;
const DayOfWeek = joda.DayOfWeek;

// Working hours
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

module.exports = {
    dateEntityToDateQuery: dateEntityToDateQuery
};
