import React, { Component } from 'react'

class ErrorBoundary extends Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null, errorInfo: null }
	}

	componentDidCatch(error, errorInfo) {
		this.setState({ hasError: true, error, errorInfo })
		console.log(error)
	}

	render() {
		// If an error occurred, render the fallback UI
		if (this.state.hasError) {
			return <div className="border text-small rounded-md p-2 text-danger-500">{this.state.error.toString()}</div>
		}

		// Otherwise, render the children
		return this.props.children
	}
}

export default ErrorBoundary
