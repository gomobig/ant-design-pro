/**
 * Created by fan on 16/2/19.
 */
import request from 'superagent';
import isPlainObject from 'lodash/isPlainObject';
import frameworkConfig from '../config';
import WebsocketClient from './WebsocketClient';

const framework = {};
const useWebsocket = false;
// module.exports = framework

/**
 * 远程权限访问对象
 * */
framework.permission = {};

/**
 * 登入
 * @param {string} userName 用户名
 * @param {string} password 密码
 * @param {function} callback 回调函数
 * @param verificationCode
 * @param extendsParams
 * */
framework.permission.logon = (userName, password, callback, verificationCode, extendsParams) => {
  const url = '/logon';
  const paramsIn = {
    userName,
    password,
  };
  if (verificationCode !== undefined) {
    paramsIn.verification_code = verificationCode;
  }
  if (extendsParams !== undefined) {
    paramsIn.extends = JSON.stringify(extendsParams);
  }
  const params = { params: JSON.stringify(paramsIn) };

  framework.internal.sendPost(url, params, callback);
  // 登录后,清理ws连接
  framework.internal.resetConn();
};

/**
 * 登出
 * @param {function} callback 回调函数
 * */
framework.permission.logout = callback => {
  const url = '/logout';
  framework.internal.sendDelete(url, '', callback);

  // 退出登录后,清理ws连接
  framework.internal.resetConn();
};

/**
 * 远程service访问对象
 * */
framework.service = {};
/**
 * 发起请求
 * serviceRequest.request1('myService', 'myFunc', param1, param2, param3, ...);
 * @param serviceName 服务名
 * @param funcName 方法名
 * @param params 其他参数 没有多余参数时，info为[]
 */
framework.service.request = (serviceName, funcName, ...params) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  let callback;
  const url = `/service/${serviceName}/${funcName}`;
  if (!!params && typeof params[params.length - 1] === 'function') {
    callback = params.pop();
  }
  const data = { params: JSON.stringify(params) };
  framework.internal.callService(url, serviceName, funcName, data, callback);
};

/**
 * 发起请求
 * serviceRequest.request2('myService', 'myFunc', {param1:value1, param2:value2, param3:value3, ...});
 * @param {string} serviceName 服务名
 * @param {string} funcName 方法名
 * @param {json} funcParams 远程服务方法Map形式参数
 * @param {function} callback 回调函数
 * */
framework.service.request2 = (serviceName, funcName, funcParams, callback) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  const url = `/service/${serviceName}/${funcName}`;
  let params = '';
  if (isPlainObject(funcParams)) {
    Object.keys(funcParams).forEach(key => {
      if (params !== '') {
        params += '&';
      }
      params += `${key}=${JSON.stringify(funcParams[key])}`;
    });
  }
  framework.internal.sendPost(url, params, callback);
};

/**
 * 远程restfulservice访问对象
 * */
framework.restfulservice = {};

/**
 * 发起请求
 * restfulservice.get('myService', 'myFunc', {param1:value1, param2:value2, param3:value3, ...});
 * @param {string} serviceName 服务名
 * @param {string} funcName 方法名
 * @param {json} funcParams 远程服务方法Map形式参数
 * @param {function} callback 回调函数
 * */
framework.restfulservice.requestGet = (serviceName, funcName, funcParams, callback) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  const url = `/restfulservice/${serviceName}/${funcName}`;
  framework.internal.sendGet(url, funcParams, callback);
};

/**
 * 发起请求
 * restfulservice.get('myService', 'myFunc', {param1:value1, param2:value2, param3:value3, ...});
 * @param {string} serviceName 服务名
 * @param {string} funcName 方法名
 * @param {json} funcParams 远程服务方法Map形式参数
 * @param {function} callback 回调函数
 * */
framework.restfulservice.requestPost = (serviceName, funcName, funcParams, callback) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  const url = `/restfulservice/${serviceName}/${funcName}`;
  framework.internal.sendPost(url, funcParams, callback);
};

/**
 * 发起请求
 * restfulservice.get('myService', 'myFunc', {param1:value1, param2:value2, param3:value3, ...});
 * @param {string} serviceName 服务名
 * @param {string} funcName 方法名
 * @param {json} funcParams 远程服务方法Map形式参数
 * @param {function} callback 回调函数
 * */
framework.restfulservice.requestPut = (serviceName, funcName, funcParams, callback) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  const url = `/restfulservice/${serviceName}/${funcName}`;
  framework.internal.sendPut(url, funcParams, callback);
};

/**
 * 发起请求
 * restfulservice.get('myService', 'myFunc', {param1:value1, param2:value2, param3:value3, ...});
 * @param {string} serviceName 服务名
 * @param {string} funcName 方法名
 * @param {json} funcParams 远程服务方法Map形式参数
 * @param {function} callback 回调函数
 * */
framework.restfulservice.requestDelete = (serviceName, funcName, funcParams, callback) => {
  if (!serviceName || !funcName) {
    throw new Error('call request with wrong params.');
  }
  let url = `/restfulservice/${serviceName}/${funcName}`;
  let params = '';
  if (isPlainObject(funcParams)) {
    Object.keys(funcParams).forEach(key => {
      if (params !== '') {
        params += '&';
      }
      params += `${key}=${funcParams[key]}`;
    });
  }
  if (params !== '') {
    url = `${url}?${params}`;
  }
  framework.internal.sendDelete(url, '', callback);
};

/**
 * 文件处理对象
 * */
framework.file = {};

/**
 * 从远程下载文件
 * @param {string} serviceName 远程服务名
 * @param {string} funcName 远程服务方法名
 * @param fileName
 * @param params
 * */
framework.file.download = (serviceName, funcName, fileName, ...params) => {
  if (!fileName || !funcName || !serviceName) {
    throw new Error('call download with wrong params.');
  }
  let callback;
  let url = framework.internal.getFullUrl(`/download/${serviceName}/${funcName}`);
  if (!!params && typeof params[params.length - 1] === 'function') {
    callback = params.pop();
  }
  url += `?params=${JSON.stringify(params)}&fileName=${fileName}`;
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  if (typeof callback === 'function') {
    callback(0, 'download start succeed');
  }
};

/**
 * 获取download的地址
 * @param {string} serviceName 远程服务名
 * @param {string} funcName 远程服务方法名
 * @param {string} fileName
 * @param params
 * */
framework.file.downloadUrl = (serviceName, funcName, fileName, ...params) => {
  if (!fileName || !funcName || !serviceName) {
    throw new Error('call download with wrong params.');
  }
  let url = framework.internal.getFullUrl(`/download/${serviceName}/${funcName}`);
  if (!!params && typeof params[params.length - 1] === 'function') {
    params.pop();
  }
  url += `?params=${JSON.stringify(params)}&fileName=${fileName}`;
  return encodeURI(url);
};

/**
 * 从远程导出文件
 * @param {string} fileName
 * @param {string} type
 * @param {object} entity
 * @param {string} serviceName 远程服务名
 * @param {string} funcName 远程服务方法名
 * @param params
 * */
framework.file.export = (fileName, type, entity, serviceName, funcName, ...params) => {
  if (!funcName || !serviceName || !entity || !type || !fileName) {
    throw new Error('call export with wrong params.');
  }
  const url = framework.internal.getFullUrl(`/export/${serviceName}/${funcName}`);
  const requestParams = {
    args: JSON.stringify(params),
    fileName,
    type,
    entity: JSON.stringify(entity),
  };
  const frameName = `downloadFrame_${Math.floor(Math.random() * 1000)}`;
  const iframe = document.createElement('iframe');
  iframe.name = frameName;
  iframe.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'params';
  input.value = JSON.stringify(requestParams);

  const form = document.createElement('form');
  form.target = frameName;
  form.method = 'POST';
  form.action = url;
  form.style.display = 'none';

  form.appendChild(input);
  iframe.appendChild(form);

  document.body.appendChild(iframe);
  form.submit();
};

/**
 * 获取文件下载的路径
 * @param serviceName
 * @param funcName
 * @param args
 */
framework.file.uploadUrl = (serviceName, funcName, args) =>
  framework.internal.getFullUrl(`/upload/${serviceName}/${funcName}?params=`) +
  framework.file.uploadParams(args);

/**
 * 服务参数调用的地址
 * @param args
 */
framework.file.uploadParams = args => {
  if (!args) {
    return '';
  }
  const argStr = JSON.stringify(args);
  if (argStr.indexOf('%') > 0) {
    throw new Error('参数不能包含非法字符');
  }
  return encodeURIComponent(argStr);
};

/**
 * 文件上传回调
 * @param {Object} data
 * @param {number} data.errorCode
 * @param {string} data.errorMsg
 * @param {string} data.data
 * @param callback
 */
framework.file.uploadCallback = (data, callback) => {
  let result = '';
  if (!data) {
    if (typeof callback === 'function') {
      result = callback(-1, 'server error');
    }
    return result;
  }
  if (typeof callback !== 'function') {
    return result;
  }
  let newData = data;
  if (newData && typeof newData === 'string') {
    newData = JSON.parse(newData);
  }
  let errCode = 0;
  if (newData && newData.errorCode) {
    errCode = newData.errorCode;
  }

  let errMsg = '';
  if (data && data.errorMsg) {
    errMsg = data.errorMsg;
  }

  let resultData = '';
  if (data && data.data) {
    try {
      resultData = JSON.parse(data.data);
    } catch (e) {
      resultData = data.data;
    }
  }
  result = callback(errCode, errMsg, resultData);
  return result;
};

/**
 * 内部对象，仅供内部调用
 * */
framework.internal = {};

// 默认错误处理
framework.internal.defaultErrorHandler = {
  networkErrorHandler() {
    console.error('网络连接异常');
  },
  onBusinessProcessError() {
    console.error('后台业务处理遇到未知错误');
  },
  onDBConnectError() {
    console.error('数据库无法获得连接');
  },
  onEntityWithoutIdError() {
    console.error('entity定义错误，没有主键Id');
  },
  onFieldValidateError() {
    console.error('字段验证发生异常');
  },
  onJsonConvertError() {
    console.error('返回对象无法做json对象转换');
  },
  onJsonToJavaError() {
    console.error('请求参数无法转换java对象');
  },
  onNoInterfaceError() {
    console.error('请求接口错误');
  },
  onNoServiceError() {
    console.error('请求无对应服务');
  },
  onNotLogonError() {
    console.error('未登录');
  },
  onParameterCountError() {
    console.error('请求参数个数错误');
  },
  onParameterTypeError() {
    console.error('请求参数类型错误');
  },
  onPermissionDeniedError() {
    console.error('无权限访问');
  },
  onSessionInvalidError() {
    console.error('会话失效');
  },
  onTimeoutError() {
    console.error('请求超时, 请检查网络设置。');
  },
  onVersionNotSupportError() {
    console.error('访问版本不支持');
  },
  onCallServiceOverFrequencyError() {
    console.error('服务访问过频');
  },
  onUnhandledError(msg) {
    console.error(`未处理错误: ${msg}`);
  },
};

// 转换json为key/value格式
framework.internal.toQueryString = obj =>
  obj
    ? Object.keys(obj)
        .sort()
        .map(key => {
          const val = obj[key];
          if (Array.isArray(val)) {
            return val
              .sort()
              .map(val2 => `${encodeURIComponent(key)}=${encodeURIComponent(val2)}`)
              .join('&');
          }

          return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        })
        .join('&')
    : '';

framework.internal.request = (url, method, data, callback) => {
  let bodyData = data;
  let requestUrl = url;
  if (data !== null) {
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
      const str = framework.internal.toQueryString(data);
      if (str.length > 0) {
        requestUrl = `${url}?${framework.internal.toQueryString(data)}`;
      }
      bodyData = null;
    }
  }

  request(method, requestUrl)
    .timeout(frameworkConfig.timeout === null ? 30000 : frameworkConfig.timeout)
    .withCredentials()
    .set('Accept', 'text/plain;')
    //        .set('Accept-Encoding', 'deflate; g-zip')
    .set('Cache-Control', 'no-cache')
    //        .set('Connection', 'keep-alive')
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .send(framework.internal.toQueryString(bodyData))
    .end((err, res) => {
      // 网络访问的错误处理
      if (err !== null) {
        console.error(err);
        if (
          frameworkConfig &&
          frameworkConfig.errorHandlers &&
          frameworkConfig.errorHandlers.networkErrorHandler
        ) {
          frameworkConfig.errorHandlers.networkErrorHandler();
        } else {
          framework.internal.defaultErrorHandler.networkErrorHandler();
        }

        if (typeof callback === 'function') {
          callback(-1, 'network error');
        }

        return;
      }

      // 正常处理
      let errorCode = 200;
      try {
        const code = parseInt(res.xhr.getResponseHeader('error_code'), 10);
        if (`${code}` !== 'NaN') {
          errorCode = code;
        }
      } catch (e) {
        console.error(e);
      }
      if (errorCode === 200) {
        // success
        let rawData = res.text;
        if (rawData !== '') {
          rawData = JSON.parse(rawData);
        }
        let errCode = 0;
        if (rawData.errorCode !== null && rawData.errorCode !== undefined) {
          errCode = rawData.errorCode;
        }
        let errMsg = 'succeed';
        if (rawData.errorMsg !== null && rawData.errorMsg !== undefined) {
          errMsg = rawData.errorMsg;
        }

        let totalCount;
        if (typeof rawData.totalCount === 'number') {
          ({ totalCount } = rawData);
        }
        let pageCount;
        if (typeof rawData.pageCount === 'number') {
          ({ pageCount } = rawData.pageCount);
        }

        let resultData;
        if (rawData.data !== null && rawData.data !== '' && rawData.data !== undefined) {
          resultData = JSON.parse(rawData.data);
        }
        if (typeof callback === 'function') {
          try {
            callback(errCode, errMsg, resultData, totalCount, pageCount);
          } catch (error) {
            console.error(error);
          }
        }
      } else {
        framework.internal.errorHandler(errorCode, callback);
      }
    });
};

framework.internal.getFullUrl = url => {
  if (!frameworkConfig || !frameworkConfig.domain || !frameworkConfig.project) {
    throw new Error('no frameworkConfig found.');
  }
  return `${frameworkConfig.domain}/${frameworkConfig.project}${url}`;
};

// ws 请求service调用
framework.internal.ws = null;

// ws service
framework.internal.wsServiceCallback = (headerErrorCode, errCode, errMsg, result) => {
  const errorCode = headerErrorCode;
  if (errorCode === 200) {
    if (typeof this.callback === 'function') {
      let rawData = result;
      if (rawData !== '') {
        rawData = JSON.parse(rawData);
      }
      this.callback(errCode, errMsg, rawData);
    }
  } else {
    framework.internal.errorHandler(errorCode, this.callback);
  }
};

// 重置service请求的连接
framework.internal.resetConn = () => {
  if (!useWebsocket) return;
  if (framework.internal.ws !== null) {
    framework.internal.ws.disconnect();
    framework.internal.ws = null;
  }
};

// 处理全局的错误处理异常
framework.internal.errorHandler = (errorCode, callback) => {
  if (errorCode === WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_CLOSE) {
    // 如果是主动ws主动关闭连接,则不算是错误
  } else if (errorCode === WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_NETWORK) {
    // 如果是连接异常
    framework.internal.resetConn();
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.networkErrorHandler
    ) {
      frameworkConfig.errorHandlers.networkErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.networkErrorHandler();
    }
  } else if (errorCode === WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_TIMEOUT) {
    // 如果是超时
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.timeoutHandler
    ) {
      frameworkConfig.errorHandlers.timeoutHandler();
    } else {
      framework.internal.defaultErrorHandler.onTimeoutError();
    }
  } else if (errorCode === 100) {
    framework.internal.resetConn();
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.notLogonHandler
    ) {
      frameworkConfig.errorHandlers.notLogonHandler();
    } else {
      framework.internal.defaultErrorHandler.onNotLogonError();
    }
  } else if (errorCode === 101) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.permissionDeniedHandler
    ) {
      frameworkConfig.errorHandlers.permissionDeniedHandler();
    } else {
      framework.internal.defaultErrorHandler.onPermissionDeniedError();
    }
  } else if (errorCode === 102) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.versionNotSupportHandler
    ) {
      frameworkConfig.errorHandlers.versionNotSupportHandler();
    } else {
      framework.internal.defaultErrorHandler.onVersionNotSupportError();
    }
  } else if (errorCode === 103) {
    framework.internal.resetConn();
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.sessionInvalidHandler
    ) {
      frameworkConfig.errorHandlers.sessionInvalidHandler();
    } else {
      framework.internal.defaultErrorHandler.onSessionInvalidError();
    }
  } else if (errorCode === 104) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.noServiceHandler
    ) {
      frameworkConfig.errorHandlers.noServiceHandler();
    } else {
      framework.internal.defaultErrorHandler.onNoServiceError();
    }
  } else if (errorCode === 105) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.noInterfaceHandler
    ) {
      frameworkConfig.errorHandlers.noInterfaceHandler();
    } else {
      framework.internal.defaultErrorHandler.onNoInterfaceError();
    }
  } else if (errorCode === 106) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.jsonConvertErrorHandler
    ) {
      frameworkConfig.errorHandlers.jsonConvertErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onJsonConvertError();
    }
  } else if (errorCode === 107) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.parameterCountErrorHandler
    ) {
      frameworkConfig.errorHandlers.parameterCountErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onParameterCountError();
    }
  } else if (errorCode === 108) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.parameterTypeErrorHandler
    ) {
      frameworkConfig.errorHandlers.parameterTypeErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onParameterTypeError();
    }
  } else if (errorCode === 109) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.jsonToJavaErrorHandler
    ) {
      frameworkConfig.errorHandlers.jsonToJavaErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onJsonToJavaError();
    }
  } else if (errorCode === 110) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.businessProcessErrorHandler
    ) {
      frameworkConfig.errorHandlers.businessProcessErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onBusinessProcessError();
    }
  } else if (errorCode === 111) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.entityWithoutIdHandler
    ) {
      frameworkConfig.errorHandlers.entityWithoutIdHandler();
    } else {
      framework.internal.defaultErrorHandler.onEntityWithoutIdError();
    }
  } else if (errorCode === 112) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.dbConnectErrorHandler
    ) {
      frameworkConfig.errorHandlers.dbConnectErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onDBConnectError();
    }
  } else if (errorCode === 113) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.fieldValidateErrorHandler
    ) {
      frameworkConfig.errorHandlers.fieldValidateErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onFieldValidateError();
    }
  } else if (errorCode === 114) {
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.callServiceOverFrequencyErrorHandler
    ) {
      frameworkConfig.errorHandlers.callServiceOverFrequencyErrorHandler();
    } else {
      framework.internal.defaultErrorHandler.onCallServiceOverFrequencyError();
    }
  } else {
    framework.internal.resetConn();
    if (
      frameworkConfig &&
      frameworkConfig.errorHandlers &&
      frameworkConfig.errorHandlers.unhandledErrorHandler
    ) {
      frameworkConfig.errorHandlers.unhandledErrorHandler('other error');
    } else {
      framework.internal.defaultErrorHandler.onUnhandledError('other error');
    }
  }
  if (typeof callback === 'function') {
    try {
      callback(errorCode, 'call service error');
    } catch (error) {
      console.error(error);
    }
  }
};

// service 请求
framework.internal.callService = (url, service, func, data, callback) => {
  // 判断当前的配置使用 什么协议来访问service
  // 如果使用http协议
  if (frameworkConfig.serviceCallProtocol === 'http') {
    framework.internal.sendPost(url, data, callback);
    return;
  }
  if (!useWebsocket) return;

  // 如果是自动选择,则判断是否可以使用ws
  // 如果不可以使用ws,则默认都使用http
  if (frameworkConfig.serviceCallProtocol === '' || frameworkConfig.serviceCallProtocol === 'ws') {
    let { ws } = framework.internal;
    if (ws !== null && ws.isConnected()) {
      framework.internal.ws.callService(
        service,
        func,
        data,
        framework.internal.wsServiceCallback.bind({ callback }),
        frameworkConfig.timeout
      );
      return;
    }

    ws = new WebsocketClient();

    ws.setOnclose(() => {
      console.warn('web socket close!');
      framework.internal.ws = null;
    });
    ws.setOnError(() => {
      console.error('web socket error!');
      framework.internal.ws = null;

      // 处理如果连接失败的情况
      framework.internal.wsServiceCallback.call(
        { callback },
        WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_NETWORK
      );
    });
    ws.setOnConnect(() => {
      const call = (headerErrorCode, errCode, errMsg, result) => {
        try {
          callback(headerErrorCode, errCode, errMsg, result);
        } catch (e) {
          console.error(e);
        }
        if (framework.internal.ws !== ws) {
          setTimeout(() => {
            ws.disconnect();
          }, 3000);
        }
      };
      this.callService(
        service,
        func,
        data,
        framework.internal.wsServiceCallback.bind({ callback: call }),
        frameworkConfig.timeout
      );
    });
    if (!ws.connect('public')) {
      framework.internal.ws = null;
      frameworkConfig.serviceCallProtocol = 'http'; // 当前客户端无法使用ws,切换到http模式
      framework.internal.sendPost(url, data, callback);
      return;
    }
    if (framework.internal.ws === null) {
      framework.internal.ws = ws;
    }
    frameworkConfig.serviceCallProtocol = 'ws';
    return;
  }

  throw new Error('service call protocol config error!');
};

/**
 * 发起GET请求
 * @param url
 * @param {json} params 查询参数
 * @param callback
 * */
framework.internal.sendGet = (url, params, callback) => {
  const fullUrl = framework.internal.getFullUrl(url);
  framework.internal.request(fullUrl, 'GET', params, callback);
};

/**
 * 发起POST请求
 * @param url
 * @param data 要post的数据
 * @param callback
 * */
framework.internal.sendPost = (url, data, callback) => {
  const fullUrl = framework.internal.getFullUrl(url);
  framework.internal.request(fullUrl, 'POST', data, callback);
};

/**
 * 发起PUT请求
 * @param url
 * @param params
 * @param callback
 * */
framework.internal.sendPut = (url, params, callback) => {
  const fullUrl = framework.internal.getFullUrl(url);
  framework.internal.request(fullUrl, 'PUT', params, callback);
};

/**
 * 发起DELETE请求
 * @param url
 * @param {string} params 查询参数
 * @param callback
 * */
framework.internal.sendDelete = (url, params, callback) => {
  const fullUrl = framework.internal.getFullUrl(url);
  framework.internal.request(fullUrl, 'DELETE', params, callback);
};

export default framework;
