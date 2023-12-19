'use client'
import { getAllAnalyticsTeacher } from '@/api/analytics'
import { Card, Spacer, Spinner } from '@nextui-org/react'
import { ResponsiveLine } from '@nivo/line'
import { ResponsivePie } from '@nivo/pie'
import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { nivoDark } from '@nivo/core'
import { useTheme } from 'next-themes'

export default function Page() {
	const { data, isPending, isError } = useQuery({
		queryKey: ['analytics'],
		queryFn: () => getAllAnalyticsTeacher(),
		keepPreviousData: true,
	})

	const [dataRange, setDataRange] = useState([0, 0])
	useEffect(() => {
		let min = 0,
			max = 0
		if (data) {
			data?.topCourses?.forEach((it) => {
				it.data.forEach((it2) => {
					min = Math.min(min, it2.y)
					max = Math.max(max, it2.y)
				})
			})
			setDataRange([min, max])
		}
	}, [data])

	const { theme } = useTheme()

	return (
		<div>
			<div className="flex justify-start items-baseline gap-2">
				<span className="text-xl font-semibold">Analytics</span>
				{isPending && <Spinner size="sm" />}
			</div>
			<Spacer y={4} />
			{data && (
				<div className="flex gap-4">
					<div className="bg-default-100 py-2 px-6 text-left">
						<p className="text-default-500 text-sm">Published Courses</p>
						<p className="text-3xl font-semibold">{data?.totalPublishedCourses || 0}</p>
					</div>
					<div className="bg-default-100 py-2 px-6 text-left">
						<p className="text-default-500 text-sm">Students Enrolled</p>
						<p className="text-3xl font-semibold">{data?.totalEnrolledCourses || 0}</p>
					</div>
					<div className="bg-default-100 py-2 px-6 text-left">
						<p className="text-default-500 text-sm">Total Purchase</p>
						<p className="text-3xl font-semibold">₹{data?.totalAmountEarned || 0}</p>
					</div>
				</div>
			)}
			<Spacer y={8} />
			<div className="flex w-full gap-4 h-[350px] items-center">
				<div className="w-[600px] h-full">
					{data?.topCourses && (
						<ResponsiveLine
							data={data?.topCourses}
							theme={{
								text: {
									fill: theme === 'dark' ? '#e4e4e7' : '#3f3f46',
								},
								grid: {
									line: {
										stroke: theme === 'dark' ? '#3f3f46' : '#e4e4e7',
									},
								},
							}}
							margin={{ top: 50, right: 20, bottom: 50, left: 60 }}
							xScale={{
								type: 'time',
								format: '%Y-%m-%d',
								useUTC: false,
								min: '2023-12-01',
								max: '2023-12-30',
							}}
							xFormat="time:%Y-%m-%d"
							yScale={{
								type: 'linear',
								min: dataRange[0] - 1,
								max: dataRange[1] + 1,
								stacked: false,
								reverse: false,
							}}
							curve="monotoneX"
							axisTop={null}
							axisRight={null}
							axisBottom={{
								format: '%b %d',
								tickValues: 'every 3 day',
								legend: '',
								legendOffset: 40,
								legendPosition: 'middle',
							}}
							axisLeft={{
								orient: 'left',
								tickSize: 1,
								tickPadding: 5,
								tickRotation: 0,
								legend: 'No of Enrollments',
								legendOffset: -40,
								legendPosition: 'middle',
								tickValues: [0, 1, 2, 3],
							}}
							enableGridX
							enableGridY
							colors={{ scheme: 'set2' }}
							lineWidth={4}
							enablePoints
							pointSize={8}
							pointColor={{ from: 'color' }}
							pointBorderWidth={2}
							pointBorderColor={{ from: 'serieColor' }}
							pointLabelYOffset={-12}
							useMesh
							legends={[
								{
									anchor: 'bottom-center',
									direction: 'column',
									justify: false,
									translateX: 5,
									translateY: 0,
									itemsSpacing: 0,
									itemDirection: 'left-to-right',
									itemWidth: 10,
									itemHeight: 20,
									itemOpacity: 0.75,
									symbolSize: 12,
									symbolShape: 'circle',
									symbolBorderColor: 'rgba(0, 0, 0, .5)',
									effects: [
										{
											on: 'hover',
											style: {
												itemBackground: 'rgba(0, 0, 0, .03)',
												itemOpacity: 1,
											},
										},
									],
								},
							]}
						/>
					)}
					<Spacer y={2} />
					{data && <p className="text-center text-default-700 text-tiny">Enrollments</p>}
				</div>
				<div className="w-[350px] h-full flex flex-col items-center justify-center">
					{data?.countByCategory && (
						<ResponsivePie
							data={data?.countByCategory}
							theme={{
								text: {
									fill: theme === 'dark' ? '#e4e4e7' : '#3f3f46',
								},
								grid: {
									line: {
										stroke: theme === 'dark' ? '#3f3f46' : '#e4e4e7',
									},
								},
							}}
                            colors={{ scheme: 'set2' }}
							margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
							innerRadius={0.5}
							padAngle={3}
							cornerRadius={0}
							borderWidth={1}
							borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
							radialLabelsSkipAngle={10}
							radialLabelsTextXOffset={6}
							radialLabelsTextColor="#333333"
							radialLabelsLinkOffset={0}
							radialLabelsLinkDiagonalLength={16}
							radialLabelsLinkHorizontalLength={24}
							radialLabelsLinkStrokeWidth={1}
							radialLabelsLinkColor={{ from: 'color' }}
							slicesLabelsSkipAngle={10}
							slicesLabelsTextColor="#333333"
							arcLinkLabelsOffset={-15}
							arcLinkLabelsStraightLength={10}
							animate
							motionStiffness={90}
							motionDamping={15}
						/>
					)}
					<Spacer y={2} />
					{data && <p className="text-center text-default-700 text-tiny">Courses by category</p>}
				</div>
			</div>
		</div>
	)
}
