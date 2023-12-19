const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const { Server } = require('socket.io')
const { createServer } = require('http')
const { initializeSocketIO } = require('./utils/socket.io')
const cors = require('cors')

const adminRouter = require('./routes/adminRouter')
const usersRouter = require('./routes/userRouter')
const courseRouter = require('./routes/courseRouter')
const categoryRouter = require('./routes/categoryRouter')
const chapterRouter = require('./routes/chapterRouter')
const segmentRouter = require('./routes/segmentRouter')
const reviewRouter = require('./routes/reviewRouter')
const enrollmentRouter = require('./routes/enrollmentRouter')
const commentRouter = require('./routes/commentRouter')
const liveVideoRouter = require('./routes/liveVideoRouter')
const chatRouter = require('./routes/chatRouter')
const analyticsRouter = require('./routes/analyticsRouter')
const favoriteRouter = require('./routes/favoriteRouter')
const promotionRouter = require('./routes/promotionRouter')

const webhookRouter = require('./routes/webhookRouter')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
	pingTimeout: 60000,
	cors: {
		origin: process.env.CLIENT_URL,
		credentials: true,
	},
})

app.set('io', io)

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
)

initializeSocketIO(io)

app.use(
	morgan((tokens, req, res) => {
		const status = tokens.status(req, res)
		if (Number(status) !== 304) {
            const statusColor = Number(status) >= 400 ? '\x1b[31m' : '\x1b[32m'
            let date = new Date(Date.now())
            date =  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
			return `${statusColor}${tokens.method(req, res)} ${tokens.url(req, res)} - ${tokens.status(
				req,
				res
			)} ${tokens.res(req, res, 'content-length')} - ${tokens['response-time'](
				req,
				res
			)} ms - ${date}\x1b[0m`
		}
		return null
	})
)
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/webhook', webhookRouter)

app.use(express.json())
app.use('/api', usersRouter)
app.use('/api', courseRouter)
app.use('/api', categoryRouter)
app.use('/api', chapterRouter)
app.use('/api', segmentRouter)
app.use('/api', reviewRouter)
app.use('/api', enrollmentRouter)
app.use('/api', commentRouter)
app.use('/api', liveVideoRouter)
app.use('/api', chatRouter)
app.use('/api', analyticsRouter)
app.use('/api', favoriteRouter)
app.use('/api', promotionRouter)

app.use('/api/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	console.log('route not found')
	res.status(404).json({ message: 'The resourse you have been requesting not found' })
})

// Middleware For Error Handling
app.use(errorHandler)

module.exports = httpServer
