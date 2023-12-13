import { Button } from '@nextui-org/react'
import React from 'react'
import { Google } from './icons/Google'

export default function GoogleLogin({ isLoading, loginwithGoogle }) {
	return (
		<Button
			className="py-5 hover:bg-default-200"
			radius="none"
			isLoading={isLoading}
			spinnerPlacement={'end'}
			variant="bordered"
			startContent={<Google />}
			size="md"
			fullWidth={true}
			onClick={() => loginwithGoogle()}>
			<p className="font-medium">Continue with Google</p>
		</Button>
	)
}
