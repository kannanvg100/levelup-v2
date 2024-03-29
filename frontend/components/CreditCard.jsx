import React from 'react'

export default function CreditCard() {
	return (
		<div className="relative w-[290px] h-[183px] m-auto rounded-xl text-white shadow-2xl bg-gradient-to-r from-[#2f53f2] to-[#5c9ef9]">
			<div className="flex flex-col gap-6 justify-end p-4 h-full">
				<p className="uppercase text-xs font-semibold">Test Card</p>
				<p className="font-medium text-2xl">4242 4242 4242 4242</p>
				<div className="flex justify-start gap-8">
					<div>
						<p className="font-light text-xs">Expiry</p>
						<p className="font-medium tracking-wider text-sm">12/24</p>
					</div>
					<div>
						<p className="font-light text-xs">CVV</p>
						<p className="font-bold tracking-more-wider text-sm">123</p>
					</div>
				</div>
			</div>
            <div className='absolute -top-4 -right-4 size-36 opacity-10 rounded-full bg-white border'></div>
            <div className='absolute -bottom-12 -right-2 size-36 opacity-10 rounded-full bg-white border'></div>
		</div>
	)
}
