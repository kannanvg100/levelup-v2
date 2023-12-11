import { Switch } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import React from 'react'

export default function ThemeSwitch() {
	const { theme, setTheme } = useTheme()
	const onChange = () => (theme === 'light' ? setTheme('dark') : setTheme('light'))
	return <Switch isSelected={theme === 'light'} onChange={onChange}></Switch>
}
