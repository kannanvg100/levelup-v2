import { Spinner } from '@nextui-org/react'
import React from 'react'

export default function loading() {
	return (
		<div className='w-screen h-screen flex items-center justify-center'>
			<Spinner size="lg" />
		</div>
	)
}
