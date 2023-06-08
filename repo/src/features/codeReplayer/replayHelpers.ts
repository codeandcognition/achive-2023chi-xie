import { LogEventValues } from "../logger/loggerConstants"

/**
 * Given a logged event, return time in MS or -1 if no ClientTimestamp provided
 * @param loggedEvent 
 * @returns 
 */
export const getClientTimestampTime = (loggedEvent: LogEventValues) => {
  if (loggedEvent.ClientTimestamp) {
    return new Date(loggedEvent.ClientTimestamp).getTime()
  }
  return -1
}

/**
 * Given a time, convert this from milliseconds to minutes : seconds (mm:ss) format.
 * @param millis 
 * @returns 
 */
export const millisToMinutesAndSeconds = (millis: number) => {
  const minutes = Math.floor(millis / 60000)
  const seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds
}

/**
* Returns the index of the last element in the array where predicate is true, and -1
* otherwise.
* @param array The source array to search in
* @param predicate find calls predicate once for each element of the array, in descending
* order, until it finds one where predicate returns true. If such an element is found,
* findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
*/
export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
      if (predicate(array[l], l, array))
          return l;
  }
  return -1;
}