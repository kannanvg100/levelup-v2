import { Skeleton, Spacer } from '@nextui-org/react'
import React from 'react'

export default function () {
	return (
		<div className="w-[280px] bg-default-50">
			<Skeleton>
				<div className="w-[280px] h-[150px] border-b border-default-100"></div>
			</Skeleton>

			<div className="flex flex-col justify-center items-center py-2">
				<Skeleton>
					<div className="w-[150px] h-5"></div>
				</Skeleton>
				<Spacer y={2} />
				<Skeleton>
					<div className="w-[100px] h-4"></div>
				</Skeleton>
				<Spacer y={2} />
				<div className="w-full h-[1px] bg-default-100"></div>
				<Spacer y={3} />
                <Skeleton>
					<div className="w-[100px] h-4 bg-primary-500"></div>
				</Skeleton>
			</div>
		</div>
	)
}
