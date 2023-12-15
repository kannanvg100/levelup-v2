import React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function recaptchaVerify({ theme, setCode, errors }) {

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="overflow-hidden w-[298px] h-[72px]">
				<ReCAPTCHA
					sitekey="6LchczEpAAAAAMFNmLdUOAoRodvmsZ2x4rvf7sor"
					className="-m-[2px]"
					theme={theme}
					onChange={(value) => setCode(value)}
				/>
			</div>
            <p className='text-tiny text-danger-300 self-start ms-4 mt-1'>{errors?.code}</p>
		</div>
	)
}
