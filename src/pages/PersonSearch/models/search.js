import omit from 'lodash/omit';
import { message } from 'antd';
import moment from 'moment';
import { findPersonByName, findPersonByPhoto } from '@/services/wkapi';
import { formatMessage } from 'umi/locale';
import { delay } from '@/utils/utils';

const perCount = 19;
function* pollFindPerson(sagaEffects) {
  const { call, put, select } = sagaEffects;
  /* eslint no-constant-condition: "off" */
  while (true) {
    let response = null;
    const { params, totalLen } = yield select(state => state.search);
    if (params.name === null) {
      const paramsImage = omit(params, ['name']);
      response = yield call(findPersonByPhoto, paramsImage);
    } else if (params.imageToken == null) {
      const paramsName = omit(params, ['imageToken']);
      response = yield call(findPersonByName, paramsName);
    }
    if (response.err === 0) {
      if (response.res) {
        yield put({
          type: 'addResult',
          payload: response.res.similarCaptureList,
        });
        if (params.fromIndex === 1) {
          if (
            response.res.similarPersonList &&
            response.res.similarPersonList.length === 0 &&
            params.imageToken
          ) {
            message.error(formatMessage({ id: 'message.search.no-similar-person' }));
          }
          yield put({
            type: 'save',
            payload: {
              totalLen: response.res.length,
              similarPersonList: response.res.similarPersonList
                ? response.res.similarPersonList
                : [],
            },
          });
        }
        // 更新查询条件
        const fromIndex = params.endIndex + 1;
        const endIndex = fromIndex + perCount;
        if (fromIndex > totalLen) {
          yield put({ type: 'stopFindPerson' });
        }
        yield put({
          type: 'changeConditions',
          payload: { ...params, fromIndex, endIndex },
        });
      }
    }
    yield call(delay, 100);
  }
}
export default {
  namespace: 'search',
  state: {
    params: {
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      imageToken: null,
      name: null,
      matchLevel: 'GENERAL',
      gender: null,
      glasses: null,
      personAgeLevel: null,
      fromIndex: 1,
      endIndex: 20,
      queryEndTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    },
    searching: false,
    totalLen: 100,
    findResult: [],
    similarPersonList: [],
  },

  effects: {
    pollFindPerson: [
      function* polling(sagaEffects) {
        const { call, take, race } = sagaEffects;
        while (true) {
          yield take('startFindPerson');
          yield race([call(pollFindPerson, sagaEffects), take('stopFindPerson')]);
        }
      },
      { type: 'watcher' },
    ],
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearData(state) {
      return {
        ...state,
        params: { ...state.params, fromIndex: 1, endIndex: 20 },
        searching: false,
        totalLen: 100,
        findResult: [],
        similarPersonList: [],
      };
    },
    startFindPerson(state) {
      return {
        ...state,
        searching: true,
      };
    },
    stopFindPerson(state) {
      return {
        ...state,
        searching: false,
      };
    },
    changeConditions(state, { payload }) {
      return {
        ...state,
        params: { ...state.params, ...payload },
      };
    },
    addResult(state, { payload }) {
      return {
        ...state,
        findResult: [...payload, ...state.findResult],
      };
    },
  },
};
