import omit from 'lodash/omit'
import { findPersonByName, findPersonByPhoto } from '@/services/wkapi';

export default {
  namespace: 'search',
  state: {
    keepFinding: true,
    totalLen: 100,
    currentPos: 0,
    similarList: [],
  },

  effects: {
    *findPerson({ payload }, { put, call, select }) {
      yield put({
        type: 'clear',
      });
      const { name = null } = payload;
      let response = null;
      let params = null;
      const perCount = 99;
      let fromIndex = 1;
      let endIndex =  fromIndex + perCount;
      let totalLen = 100;
      let { keepFinding } = yield select(state => state.search);
      do {
        if (!name) {
          params = omit(payload, ['name']);
          response = yield call(findPersonByPhoto, {...params, fromIndex, endIndex});12
        } else {
          params = omit(payload, ['imageToken']);
          response = yield call(findPersonByName,  {...params, fromIndex, endIndex});
        }
        if (fromIndex === 1 && response.res.length !== 0) {
          totalLen = response.res.length
        }
        const similarList = response.res.map(person => ({
          id: person.id,
          score: person.score,
          personAgeLevel: person.personAgeLevelList,
          captureTime: person.captureTime,
        }));
        fromIndex = endIndex + 1;
        endIndex = fromIndex + perCount;
        yield put({
          type: 'updateFinding',
          payload: {
            similarList,
            totalLen,
            currentPos: fromIndex,
          }
        });
        ({ keepFinding } = yield select(state => state.search));
      } while (keepFinding);
    },
  },

  reducers: {
    updateFinding(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        keepFinding: true,
        totalLen: 100,
        currentPos: 0,
        similarList: [],
      }
    },
  },
};
