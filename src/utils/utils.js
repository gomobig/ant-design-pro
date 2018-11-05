import moment from 'moment';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}
export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }
  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }
    const beginTime = now.getTime() - day * oneDay;
    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }
  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();
    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }
  if (type === 'year') {
    const year = now.getFullYear();
    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}
export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}
export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}
function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}
function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}
/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}
/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;
export function isUrl(path) {
  return reg.test(path);
}

/**
 * 格式化数据为支持后端分页的格式
 */
export function formatTableData(data) {
  const content = data.content.map(item => ({
      ...item,
      key: item.id,
    }));
  const newData = {
    list: content,
    pagination: { current: data.pageNo, pageSize: data.pageSize, total: data.totalRecord },
  };
  return newData;
}
export function formatTableDataForGroup(data) {
  const content = data.employee.map(item => ({
      ...item,
      key: item.id,
    }));
  const newData = {
    list: content,
    employeeId: data.employeeId,
    pagination: { current: data.pageNo, pageSize: data.pageSize, total: data.totalRecord },
  };
  return newData;
}
/**
 * 格式化数据增加key和序号
 */

export function formatTableData2(data) {
  const content = data.map((item, index) => ({
      ...item,
      key: item.id,
      i: index + 1,
    }));
  return content;
}
/**
 * 判断obj是否为空对象
 * @param obj
 */
export function isEmptyObj(obj) {
  for (const key in obj) {
    return true;
  }
  return false;
}
/**
 * 根据时间戳转换为hh:mm 时和分
 * @param obj
 */
function getDateHM(timeStamp) {
  const time = new Date(timeStamp);
  const h = time.getHours();
  const mm = time.getMinutes();
  return `${h < 10 ? `0${h}` : h}:${mm < 10 ? `0${mm}` : mm}`;
}

/**
 * 获取当天日期 yyyy-MM-dd
 */
export function getTodayDate() {
  const date = new Date();
  const Y = date.getFullYear();
  const M = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const D = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${Y}-${M}-${String(D)}`;
}

/**
 * 根据时间戳 yyyy-MM-dd
 */
export function getDateByTime(timeStamp) {
  const date = new Date(timeStamp);
  const Y = date.getFullYear();
  const M = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const D = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return `${Y}-${M}-${String(D)}`;
}
/**
 *  转换时分秒
 * @param data 秒数(100252)
 * @param dataTime 返回转换后的值 10:02
 * */
export function getDateTime(data) {
  // console.log('date', data)
  if (data !== undefined) {
    const h = data.substr(0, 2);
    const m = data.substr(2, 2);
    const s = data.substr(4, 2);
    const dataTime = `${h}:${m}:${s}`;
    return dataTime;
  } 
    return '';
  
}

export function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '');
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms));
}

export function isStreamVaild(fileUrl) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileUrl, true);
    xhr.responseType = 'arraybuffer';
    let timer = null;
    xhr.onload = () => {
      clearTimeout(timer);
      resolve(false);
    };
    xhr.send(null);
    timer = setTimeout(() => {
      xhr.abort();
      resolve(true);
    }, 1000);
  });
}

export function inArray(v, data) {
  let result = false;
  for (let i = 0; i < data.length; i++) {
    if (v == data[i]) {
      result = true;
    }
  }
  return result;
}

<<<<<<< HEAD
export function getByteLen(str) {
  let len = 0;
  let char = 0;
  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    if (char >= 0 && char <= 128) len += 1;
    else len += 2;
  }
  return len;
}

// 根据姓名或者人员类型分组
export function groupBy(data, key, condition) {
  const grouped = {};
  for (const i in data) {
    const item = data[i];
    if (!(item[key] in grouped)) {
      grouped[item[key]] = [];
    }
    if (!condition || condition.call(null, item)) {
      grouped[item[key]].push(item);
    }
  }
  return grouped;
}

// 判断是否有重复
export function isRepeat(data, val) {
  return val in data && data[val].length > 1;
}

export function registerFullScreenChange(callback) {
  document.addEventListener('fullscreenchange', callback);
  document.addEventListener('mozfullscreenchange', callback);
  document.addEventListener('webkitfullscreenchange', callback);
  document.addEventListener('msfullscreenchange', callback);
}

export function getFullScreenElement() {
  const el = document;
  return (
    el.fullscreenElement ||
    el.webkitFullscreenElement ||
    el.msFullscreenElement ||
    el.mozFullScreenElement
  );
}

export function fullScreen(el) {
  const rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullScreen;
  if (typeof rfs !== 'undefined' && rfs) {
    rfs.call(el);
  }
}

export function exitFullScreen() {
  const el = document;
  const cfs =
    el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;
  if (typeof cfs !== 'undefined' && cfs) {
    cfs.call(el);
  }
=======
// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
>>>>>>> df47a9f788641cd7b100c35002ba522f6092b7ff
}
