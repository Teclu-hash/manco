const express = require ('express')
const cors = require ('cors')
const app = express()
const port = 3006
const db = require('./models')
const schoolRouter = require('./routes/school')
const studentRouter = require('./routes/student')
const userRouter = require('./routes/user')
const applicationRouter = require('./routes/application')
const requirementRouter = require('./routes/requirement')
const applicationRequirementRouter = require('./routes/applicationRequirement')
const assistanceRecordRouter = require('./routes/assistanceRecord')
const authRouter = require('./routes/auth')
const dashboardRouter = require('./routes/dashboard')
const reportRouter = require('./routes/report')
const studentSubmissionRouter = require('./routes/studentSubmission')

app.use(cors())
app.use(express.json({ limit: '7mb' }))

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use('/api/school', schoolRouter)
app.use('/api/student', studentRouter)
app.use('/api/user', userRouter)
app.use('/api/application', applicationRouter)
app.use('/api/requirement', requirementRouter)
app.use('/api/application-requirement', applicationRequirementRouter)
app.use('/api/assistance-record', assistanceRecordRouter)
app.use('/api/auth', authRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/report', reportRouter)
app.use('/api/student-submission', studentSubmissionRouter)

db.sequelize.sync({ alter: true }).then(()=>{
    app.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
})
