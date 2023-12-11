import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	user:
		typeof window !== 'undefined' && localStorage.getItem('userInfo')
			? JSON.parse(localStorage.getItem('userInfo'))
			: null,
}

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		addUser: (state, action) => {
			state.user = action.payload
			localStorage.setItem('userInfo', JSON.stringify(action.payload))
		},
		removeUser: (state) => {
			state.user = null
			localStorage.removeItem('userInfo')
		},
	},
})

export const { addUser, removeUser } = userSlice.actions
export default userSlice.reducer
