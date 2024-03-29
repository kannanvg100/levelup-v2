'use client'
import { useCallback, useRef } from 'react'

export default function useInfiniteScroll({ hasNextPage, fetchNextPage, isFetchingNextPage }) {
    const observer = useRef();

    const loaderRef = useCallback((node) => {
        if (isFetchingNextPage) return
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                await fetchNextPage()
            }
        });
        if (node) observer.current.observe(node);
    }, [hasNextPage, fetchNextPage, isFetchingNextPage])

    return loaderRef
}
