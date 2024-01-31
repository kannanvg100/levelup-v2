import { Skeleton, Spacer } from '@nextui-org/react'
import React from 'react'

export default function loading() {
	return (
		<div className="max-w-5xl mx-auto mt-2 h-screen">
			<div className="flex justify-center sm:justify-start items-start gap-8 flex-wrap">
				<div>
					<div className="flex gap-4">
						<Skeleton className="h-5 w-5"></Skeleton>
						<Skeleton className="h-5 w-[120px]"></Skeleton>
					</div>
					<Spacer y={2} />
					<Skeleton>
						<div className="h-[200px] w-[350px]"></div>
					</Skeleton>
					<Spacer y={4} />
					<div className="ml-3 flex gap-2 items-end">
						<Skeleton className="w-[70px]">
							<div className="h-[30px]"></div>
						</Skeleton>
						<Skeleton className="w-[120px]">
							<div className="h-[22px]"></div>
						</Skeleton>
					</div>
					<Spacer y={2} />
					<div className="mx-3">
						<Skeleton className="">
							<div className="h-[48px]"></div>
						</Skeleton>
					</div>
				</div>
				<div className="flex-grow max-w-[600px] mt-8">
					<Skeleton className="w-[300px]">
						<div className="h-8"></div>
					</Skeleton>
					<Spacer y={2} />
					<Skeleton className="w-[500px]">
						<div className="h-[70px]"></div>
					</Skeleton>
				</div>
			</div>
		</div>
	)
}
