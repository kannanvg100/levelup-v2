import { useEffect, useRef } from "react"

export default function useInfiniteScroll({ hasNextPage, fetchNextPage }) {
	const loaderRef = useRef()
	const scrollerRef = useRef()

	useEffect(() => {
		if (!hasNextPage) return

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
                console.log('fetching next page')
				fetchNextPage()
			}
		})

		if (loaderRef.current) {
			observer.observe(loaderRef.current)
		}

		return () => {
			observer.disconnect()
		}
	}, [hasNextPage, fetchNextPage])

	return [loaderRef, scrollerRef]
}
