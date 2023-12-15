import { Skeleton, Spacer } from '@nextui-org/react'
import React from 'react'

export default function () {
	return (
		<div className="w-[280px] border">
			<Skeleton>
				<div className="w-[280px] h-[160px] border-b border-default-100"></div>
			</Skeleton>
			<Spacer y={2} />

			<div className="flex flex-col items-start p-2">
				<Skeleton>
					<div className="w-[150px] h-5"></div>
				</Skeleton>
				<Spacer y={2} />
				<Skeleton>
					<div className="w-[100px] h-4"></div>
				</Skeleton>
				<Spacer y={4} />
				<Skeleton>
					<div className="w-full h-3 bg-primary-500"></div>
				</Skeleton>
			</div>
		</div>
	)
}
