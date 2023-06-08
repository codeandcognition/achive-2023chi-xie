/**
 * Given a string, return true if it is a valid email.
 * @param {potentialEmail} string
 * @returns true if string is a valid email
 */
export const validateEmail = (potentialEmail:string) => {
  // regex from https://www.w3resource.com/javascript/form/email-validation.php
 return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(potentialEmail))
}

/**
 * Given date object, return objet with ISO 8601 time and timezone offset
 * @param {Date} date 
 * @returns array with time and timezone (strings in ISO 8601 format)
 */
 export const getIsoTime = (date = new Date()):Array<string> => {
  // time as ISO 8601 value with maximum precision (e.g. 2022-03-28T15:11:30.014Z)
  const time = date.toISOString()

  // timezone offset relative to UTC (e.g. -700 of PST)
  const timezoneAsNum = -1 * date.getTimezoneOffset() / 60 * 100

  // positive or negative sign representing offset relative to UTC. If no offset, +0000
  const offsetSign = timezoneAsNum < 0 ? '-' : '+' 

  // timezone should be string of length 5 with +/- and then 4 digits (may need to pad with zero), e.g. +0400
  // see https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC
  const timezone = offsetSign + String(Math.abs(timezoneAsNum)).padStart(4, '0')

  return [time, timezone]
}

/**
 * Get array of numbers from 0 to stop-1
 * @param {number} stop integer before which the sequence of integers is to be returned
 * @returns returns the sequence from 0 to stop - 1
 */
export const range = (stop:number):number[] => {
  return Array.from(Array(stop).keys())
}

/**
 * Given string of values with common separator, return array of strings and numbers
 * @param arrayAsString string of array values separated by sep
 * @param sep separator (';') as default
 * @returns array of strings and numbers
 */
export const stringToArray = (arrayAsString:string, sep=';'):Array<any> => {
  return arrayAsString.split(sep).map((val) => isNaN(Number(val)) ? val : Number(val))
}