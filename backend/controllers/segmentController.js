const Segment = require('../models/Segment')
const Chapter = require('../models/Chapter')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const Mux = require('@mux/mux-node')
const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET)
const { uploadToS3 } = require('../helpers/awsHelpers')

module.exports = {
	// Create new segment
	createSegment: async (req, res, next) => {
		try {
			const { title, description, uploadId } = req.body
			const { chapterId } = req.params

			const chapter = await Chapter.findById(chapterId)
			if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })

			const course = await Course.findById(chapter.course)
			if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
			if (!course.teacher.equals(req.user.id))
				return res.status(403).json({ success: false, message: 'You cannot modify this course' })

			if (!uploadId)
				return res
					.status(400)
					.json({ succes: false, errors: { video: 'Video upload failed, Pls try again later' } })
			const result = await Video.Uploads.get(uploadId)
			const assetId = result.asset_id
			if (!assetId)
				return res
					.status(400)
					.json({ succes: false, errors: { video: 'Video upload failed, Pls try again later' } })

			let asset = null
			if (assetId) asset = await Video.Assets.get(assetId)

			const playbackId = asset.playback_ids[0].id
			const duration = asset.duration
			const status = playbackId ? 'ready' : assetId ? 'processing' : 'pending'

			//TODO: add attchment

			const segment = await Segment.create({
				title,
				description,
				video: [
					{
						status,
						uploadId,
						assetId,
						playbackId,
						duration,
					},
				],
				course: course._id,
				chapter: chapter._id,
			})

			chapter.segments.push(segment._id)
			await chapter.save()

			res.status(200).json({ success: true, segment })
		} catch (error) {
			next(error)
		}
	},

	editSegment: async (req, res, next) => {
		try {
			const { title, description, uploadId, chapterId } = req.body
			const { segmentId } = req.params

			const segment = await Segment.findById(segmentId)
			if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' })

			const chapter = await Chapter.findById(chapterId)
			if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })

			const course = await Course.findById(chapter.course)
			if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
			if (!course.teacher.equals(req.user.id))
				return res.status(403).json({ success: false, message: 'You cannot modify this course' })

			if (!uploadId)
				return res
					.status(400)
					.json({ succes: false, errors: { video: 'Video upload failed, Pls try again later' } })
			const result = await Video.Uploads.get(uploadId)
			const assetId = result.asset_id
			if (!assetId)
				return res
					.status(400)
					.json({ succes: false, errors: { video: 'Video upload failed, Pls try again later' } })

			let asset = null
			if (assetId) asset = await Video.Assets.get(assetId)

			const playbackId = asset.playback_ids[0].id
			const duration = asset.duration
			const status = playbackId ? 'ready' : assetId ? 'processing' : 'pending'

			//TODO: add attchment

			segment.title = title
			segment.description = description
			segment.video = [
				{
					status,
					uploadId,
					assetId,
					playbackId,
					duration,
				},
			]
			await segment.save()

			res.status(200).json({ success: true, segment })
		} catch (error) {
			next(error)
		}
	},

	// Delete a segment
	deleteSegment: async (req, res, next) => {
		try {
			const { segmentId } = req.params

			const segment = await Segment.findById(segmentId)
			if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' })
			const chapter = await Chapter.findOne({ segments: segmentId })
			if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })
			const course = await Course.findById(chapter.course)
			if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
			if (!course.teacher.equals(req.user.id))
				return res.status(403).json({ success: false, message: 'You cannot modify this course' })

			try {
				await Video.Assets.del(segment.video[0].assetId)
			} catch (error) {
				console.log(error)
			}

			await Segment.findByIdAndDelete(segmentId)
			chapter.segments.pull(segmentId)
			await chapter.save()
			res.status(200).json({ success: true, segment, message: 'Segment deleted successfully' })
		} catch (error) {
			next(error)
		}
	},

	// Update a segment
	updateSegment: async (req, res, next) => {
		try {
			const { segmentId } = req.params
			const { title, description } = req.body

			const segment = await Segment.findById(segmentId)
			if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' })

			const chapter = await Chapter.findOne({ segments: segmentId })
			if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })
			const course = await Course.findById(chapter.course)
			if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
			if (!course.teacher.equals(req.user.id))
				return res.status(403).json({ success: false, message: 'You cannot modify this course' })
			segment.title = title
			segment.description = description
			await segment.save()
			res.status(200).json({ success: true, segment })
		} catch (error) {
			next(error)
		}
	},

	// Mark segment as complete
	markSegmentAsComplete: async (req, res, next) => {
		try {
			const { courseId, chapterId, segmentId } = req.params

			if (!courseId || !chapterId || !segmentId)
				return res.status(400).json({ success: false, message: 'Invalid request' })

			const enrollment = await Enrollment.findOne({ course: courseId, student: req.user.id })
			if (!enrollment)
				return res.status(403).json({ success: false, message: 'You are not enrolled in this course' })

			const course = await Course.findById(courseId)
			if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

			const chapter = await Chapter.findById(chapterId)
			if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' })
			const segment = await Segment.findById(segmentId)
			if (!segment) return res.status(404).json({ success: false, message: 'Segment not found' })

			const ch = { chapter: chapterId, segments: [{ segment: segmentId, progress: 100 }] }
			if (!enrollment.progress || enrollment.progress.length || enrollment.progress.length === 0)
				enrollment.progress = { chapters: [ch] }
			else {
				const progressChapter = enrollment.progress.chapters.find((c) => c.chapter.equals(chapterId))
				if (!progressChapter) {
					enrollment.progress.chapters.push(ch)
				} else {
					const progressSegment = progressChapter.segments.find((s) => s.segment.equals(segmentId))
					if (!progressSegment) progressChapter.segments.push({ segment: segmentId, progress: 100 })
					else progressSegment.progress = 100
				}
			}
			await enrollment.save()
			res.status(200).json({ success: true, message: 'Segment marked as complete' })
		} catch (error) {
			next(error)
		}
	},
}
