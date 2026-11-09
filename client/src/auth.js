//the logged in user is kept in the browser until logout
const KEY = 'lgu_user'

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export const saveUser = (user) => localStorage.setItem(KEY, JSON.stringify(user))

export const clearUser = () => localStorage.removeItem(KEY)
