import { Actions, USER_ACTION_TYPES } from './../actions/user.action';

import { User } from './../models/user.model';

export const userInitialState:User = {
  authenticated: false,
  username: '',
  user_image: '',
  uid: '',
};

export function userStoreReducer(state: User = userInitialState, action: Actions) {
  switch (action.type) {
    case USER_ACTION_TYPES.AUTH:
      return {
        ...userInitialState,
        ...action.payload
      }

    case USER_ACTION_TYPES.UNAUTH:
      return Object.assign(state, { authenticated: false, username: '', user_image: '' });

    case USER_ACTION_TYPES.USER_SAVE:
    case USER_ACTION_TYPES.LOGIN:
    case USER_ACTION_TYPES.LOGIN_SUCCESS:
    case USER_ACTION_TYPES.LOGOUT:
    default:
      return state;
  }
}
