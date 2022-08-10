import moment from 'moment';

const getTimeDuration = (dateTime: Date, currentDate: Date) => {
    const durationDate = moment(dateTime)
    const secondsDuration = durationDate.diff(currentDate, 'seconds')

    const monthsDuration = durationDate.diff(currentDate, 'months')
    if(monthsDuration) return {value: `${monthsDuration} Months`, seconds: secondsDuration}
    const daysDuration = durationDate.diff(currentDate, 'days')
    if(daysDuration) return {value: `${daysDuration} Days`, seconds: secondsDuration}
    const hoursDuration = durationDate.diff(currentDate, 'hours')
    if(hoursDuration) return {value: `${hoursDuration} Hours`, seconds: secondsDuration}
    const minutesDuration = durationDate.diff(currentDate, 'minutes')
    if(minutesDuration) return {value: `${minutesDuration} Minutes`, seconds: secondsDuration}
    if(secondsDuration) return {value: `${secondsDuration} Seconds`, seconds: secondsDuration}
}

export default getTimeDuration