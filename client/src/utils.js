//format money => ₱2,000.00
export const money = (value) =>
  '₱' + Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

//format date => Apr 28, 2026   (YYYY-MM-DD is read as a local date)
export const formatDate = (value) => {
  if (!value) return '-'
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

//today => YYYY-MM-DD
export const today = () => {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

//school year that is running now => 2025-2026 (school year starts in June)
export const currentAcademicYear = () => {
  const now = new Date()
  const start = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}-${start + 1}`
}

export const APPLICATION_STATUS = ['Pending', 'Under Review', 'Approved', 'Denied', 'Rejected']
export const ASSISTANCE_STATUS = ['Pending', 'Released']
export const STUDENT_STATUS = ['Active', 'Inactive']
export const YEAR_LEVELS = [
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'
]
export const ROLES = ['Admin', 'Staff']
