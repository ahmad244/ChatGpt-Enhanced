import { UserState, Action } from '../../types';

const initialState: UserState = {
  _id: '',
  name: '',
  email: '',
  isAuthenticated: false
};

export const userReducer = (state = initialState, action: Action): UserState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true
      };
    case 'LOGOUT_USER':
      return initialState;
    default:
      return state;
  }
};