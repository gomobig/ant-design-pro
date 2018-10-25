/**
 * Created by moda/candroid@126.com on 2017/12/26
 */

import router from 'umi/router';
import framework from '../lib/framework';

export function userLogin(params) {
  return new Promise(resolve => {
    framework.permission.logon(
      params.userName,
      params.password,
      (errCode, errMsg, data) => {
        const response = {
          err: errCode,
          msg: errMsg,
          res: data,
          url: 'login',
        };
        resolve(response);
      },
      '',
      { role: params.role }
    );
  });
}

export function userLogout() {
  return new Promise(resolve => {
    framework.permission.logout((errCode, errMsg, data) => {
      const response = {
        err: errCode,
        msg: errMsg,
        res: data,
        url: 'loginOut',
      };
      resolve(response);
    });
  });
}

export function wkrequest(path, params) {
  const options = [];
  if (params) {
    for (const key in params) {
      if ({}.hasOwnProperty.call(params, key)) {
        options.push(params[key]);
      }
    }
  }
  const urlPath = path.split('/', 2);
  return new Promise((resolve, reject) => {
    framework.service.request(...urlPath, ...options, (errCode, errMsg, data) => {
      const response = {
        err: errCode,
        msg: errMsg,
        res: data,
        url: urlPath[1],
      };
      if (response.err !== 0) {
        reject(response);
      } else {
        resolve(response);
      }
    });
  }).catch(r => {
    window.console.error(`${r.url}请求错误: ${r.err}`);
    if (r.err === 100) {
      // 跳转至登录界面
      router.push('/user/login');
    }
    return r;
  });
}
