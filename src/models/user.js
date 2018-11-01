import { query as queryUsers, queryCurrent } from '@/services/user';
import { changePassword } from '@/services/wkapi';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { put }) {
      yield put({
        type: 'saveCurrentUser',
        payload: {
          name: window.localStorage.getItem('username'),
          role: window.localStorage.getItem('role'),
          notifyCount: 4,
        },
      });
    },
    *changePassword({ payload }, { call }) {
      return yield call(changePassword, payload);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
