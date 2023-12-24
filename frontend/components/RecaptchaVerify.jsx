import { Spinner } from '@nextui-org/react'
import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function recaptchaVerify({ theme, setCode, errors }) {
	return (
		<div className="relative flex flex-col items-center justify-center bg-default-50 bg-['#222'] pt-1">
			<div className="absolute inset-0 flex justify-center items-center z-0">
				<Spinner size="lg" />
			</div>
			<div className="overflow-hidden w-[298px] h-[72px] z-10">
				<ReCAPTCHA
					sitekey="6LchczEpAAAAAMFNmLdUOAoRodvmsZ2x4rvf7sor"
					className="-m-[2px]"
					theme={theme}
					onChange={(value) => setCode(value)}
				/>
			</div>
			<p className="text-tiny text-danger-300 self-start ms-4 mt-1">{errors?.code}</p>
		</div>
	)
}
