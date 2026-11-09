const express = require ('express')
const router = express.Router()

const {sequelize} = require ('../models')

//summary used by the reports page
router.get("/", async (req, res) => {
    const {academic_year} = req.query
    const replacements = {academic_year: academic_year || null}

    try{
        const run = async (sql) => {
            const [rows] = await sequelize.query(sql, {replacements})
            return rows
        }

        const academicYears = await run(`
            SELECT DISTINCT academic_year FROM Applications ORDER BY academic_year DESC
        `)

        const applicationsByStatus = await run(`
            SELECT status, COUNT(*) AS total
            FROM Applications
            WHERE (:academic_year IS NULL OR academic_year = :academic_year)
            GROUP BY status
        `)

        const applicationsBySchool = await run(`
            SELECT s.school_name,
                   COUNT(a.application_id) AS total,
                   COALESCE(SUM(a.status = 'Approved'), 0) AS approved
            FROM Schools s
            LEFT JOIN Students st ON st.school_id = s.school_id
            LEFT JOIN Applications a ON a.student_id = st.student_id
                 AND (:academic_year IS NULL OR a.academic_year = :academic_year)
            GROUP BY s.school_id, s.school_name
            ORDER BY s.school_name
        `)

        const assistanceByStatus = await run(`
            SELECT status, COUNT(*) AS total, COALESCE(SUM(amount), 0) AS amount
            FROM AssistanceRecords
            GROUP BY status
        `)

        const releasedByMonth = await run(`
            SELECT DATE_FORMAT(release_date, '%Y-%m') AS month,
                   COUNT(*) AS total,
                   COALESCE(SUM(amount), 0) AS amount
            FROM AssistanceRecords
            WHERE status = 'Released' AND release_date IS NOT NULL
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        `)

        res.status(200).json({
            academicYears,
            applicationsByStatus,
            applicationsBySchool,
            assistanceByStatus,
            releasedByMonth
        })
    }catch(error) {
        res.status(500).json({message: "An error occurred while generating the report"})
    }
})

//last line
module.exports = router
