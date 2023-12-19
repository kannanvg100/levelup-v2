import { Spacer } from "@nextui-org/react";

export default function App() {
	return (
		<div>
			<div className="flex justify-start items-baseline gap-2">
				<span className="text-xl font-semibold" classNames={{ wrapper: 'w-[10px] h-[10px]' }}>
					Courses
				</span>
			</div>

            <Spacer y={4} />

			<div className="flex flex-col gap-4 mt-4">
                
            </div>
		</div>
	)
}
