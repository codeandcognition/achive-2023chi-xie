import _ from 'lodash'

export const COLLECTION_KSL = 'ksl'
export const COLLECTION_USERS = 'users'

export const COLLECTION_ITEMS = 'practice'

export const COLLECTION_REFLECTIONS = 'reflection_response'
export const COLLECTION_REFLECTION_PROMPTS = 'reflection'

/**
 * Get full path to keystroke logs for a given user
 * @param uid unique id for firebase user
 * @param itemId id for item corresponding to log
 * @returns string path of ksl collection to push log to
 */
export const getKslPath = (uid: string, itemId: string): string => {
  const path = `${COLLECTION_KSL}/${uid}/${itemId}`
  return path
}

/**
 * Given a uid, return path in users collection for that user
 * @param uid unique user id
 * @returns string representing path to specific user's data
 */
export const getUsersPath = (uid: string): string => {
  return `${COLLECTION_USERS}/${uid}`
}


/**
 * Given an optional itemId, return path to practice items collection
 * @param itemId id of practice item
 */
export const getPracticeItemsPath = (itemId: string | undefined): string => {
  return _.isUndefined(itemId) ? COLLECTION_ITEMS : `${COLLECTION_ITEMS}/${itemId}`
}

/**
 * Given a uid, return path from user's input to reflection item responses
 * @param uid unique user id
 * @param problemSetId the problem set ID of the particular practice item
 * @param itemId the id of the practice item
 * @param reflectionId id of the reflection item
 * @returns string path of reflection collection to push to firebase
 */
export const getReflectionResponsePath = (uid: string, problemSetId: string, itemId: string, reflectionId: string): string => {
  const reflectionPath = `${COLLECTION_REFLECTIONS}/${uid}/${problemSetId}/${itemId}/${reflectionId}`
  return reflectionPath
}

/**
 * Given an optional reflectionId, return a path to reflection items collection
 * @param itemId The id of the reflection item 
 */
 export const getReflectionItemPath = (itemId: string | undefined): string => {
  return _.isUndefined(itemId) ? COLLECTION_REFLECTIONS : `${COLLECTION_REFLECTIONS}/${itemId}`
}


export const COLLECTION_MILESTONES = 'milestone'

/**
 * Given a user id, return a path to the milestones of that user (if they completed problem sets or reached certain milestones)
 * @param userId the id of the active user
 * @returns a path to the firebase database
 */
export const getMilestonePath = (userId: string): string => {
  return _.isUndefined(userId) ? COLLECTION_MILESTONES : 
    `${COLLECTION_MILESTONES}/${userId}`
}

export const COLLECTION_ITEM_STATUSES = 'item_status'

/**
 * Given a user id, problem set id, and item id, return a path to the item status of a given item (if an item is complete, attempt number, etc.)
 * @param userId the id of the current, active user
 * @param problemSetId the id of the problem set the item is in
 * @param itemId the id of the active problem item
 * @returns a path to the firebase database of the item status.
 */
export const getItemStatusPath = (userId: string, problemSetId: string, itemId: string): string => {
  const itemStatusPath = `${COLLECTION_ITEM_STATUSES}/${userId}/${problemSetId}/${itemId}`
  return itemStatusPath
}