import { routerRedux } from 'dva/router';
import router from 'umi/router';
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
    status: 0,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      setStorage('userName', payload.userName);
      setStorage('role', payload.role);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.err === 0) {
        setAuthority(payload.role);
        reloadAuthorized();
        console.log('----jump', jumpMap[payload.role]);
        // yield put(routerRedux.push(jumpMap[payload.role]))
        const urlParams = new URL(window.location.href);
        const params = parse(window.location.href.split('?')[1]);
        console.log('login', params);
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.startsWith('/#')) {
              redirect = redirect.substr(2);
            }
          } else {
            console.log('window-redirect', redirect);
            window.location.href = redirect;
            return;
          }
        }
        console.log('redirect', redirect);
        yield put(routerRedux.replace(jumpMap[payload.role] || '/'));
      }
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.err,
      };
    },
  },
};
