import { routerRedux } from 'dva/router';
import { parse, stringify } from 'qs';
import { login, logout } from '@/services/wkapi';
import { setAuthority } from '@/utils/authority';
import { setStorage } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import jumpMap from '../../config/router.redirect';

export default {
  namespace: 'login',
  state: {
    errMsg: '',
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      window.localStorage.setItem('username', payload.userName);
      window.localStorage.setItem('role', payload.role)
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.err === 0) {
        setAuthority(payload.role);
        yield put(routerRedux.push(jumpMap[payload.role]));
      } else {
        yield put({
          type: 'showErrorMsg',
          payload: response.msg,
        });
      }
    },

    *logout(_, { put, call }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
      yield put(routerRedux.push('/user/login'));
      yield call(logout);
      reloadAuthorized();

    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.err,
      };
    },

    showErrorMsg(state, { payload }) {
      return {
        ...state,
        errMsg: payload,
      };
    },
  },
};
