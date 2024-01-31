const swaggerJSDoc = require('swagger-jsdoc')

// Swagger definition
const swaggerDefinition = {
	info: {
		title: 'LevelUp API',
		version: '1.0.0',
		description: 'Your API description',
	},
	host: 'localhost:5000', // Update with your server host and port
	basePath: '/', // The base path of your API
}

// Options for the swagger-jsdoc
const options = {
	swaggerDefinition,
	apis: ['./backend/routes/*.js'], // Path to the API routes folder
}

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options)

module.exports = swaggerSpec
