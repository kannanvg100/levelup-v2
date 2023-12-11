module.exports = {
	getUserNotifications: async (req, res) => {
		try {
			const { page, count, status } = req.query
			const query = { receiver: req.user._id }
			if (status !== 'all') query.status = status

			const notifications = await Notification.find(query)
				.sort({ createdAt: -1 })
				.skip((page - 1) * count)
				.limit(count)
                .populate('sender', 'name profileImage')

			res.status(200).json({ notifications })
		} catch (error) {
			res.status(500).json({ message: error.message })
		}
	},
}
