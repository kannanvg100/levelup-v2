import React from 'react'
import ErrorBoundary from './ErrorBoundary'

export default function ErrorFinder({ children }) {
	const loopChildren = (children) => {
		return React.Children.map(children, (child) => {
			if (React.isValidElement(child)) {
				return loopChildren(child.props.children)
			}
		})
	}

	const loopedChildren = loopChildren(children)

	return <ErrorBoundary>{loopedChildren}</ErrorBoundary>
}
