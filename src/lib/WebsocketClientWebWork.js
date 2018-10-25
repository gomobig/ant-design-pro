function WebsocketClient(wsdomain, project) {
  if (wsdomain !== undefined || wsdomain != null) {
    this.wsdomain = wsdomain;
  } else {
    this.wsdomain = frameworkConfig.wsdomain;
  }

  if (project !== undefined || project != null) {
    this.project = project;
  } else {
    this.project = frameworkConfig.project;
  }

  this.websocket = null;
  this.connected = false;

  // 连接关闭时的回调
  this.onclose = null;
  // 连接建立后的回调
  this.onconnect = null;
  // 连接出错的回调
  this.onerror = null;

  this.touchTime = 30 * 1000;

  // 推送消息的外部回调函数 onMsgReceive(topic,data)
  this.onMsgReceive = null;

  // 回调请求的缓存 requestid:{timeout,callback}
  this.serviceReqMap = {};

  // 生成service请求号
  this.uniqueNumber = (function() {
    let value = 0;
    return function() {
      return ++value;
    };
  })();
}

// service 调用的网络错误
WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_NETWORK = -1;
// service 调用的超时错误
WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_TIMEOUT = -2;
// service 调用的主动关注错误
WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_CLOSE = -3;

// 连接
WebsocketClient.prototype.connect = function(type, sessionid) {
  if (!this.wsdomain || !this.project) {
    throw new error('no wsdomain or project found.');
  }
  let fullUrl = `${this.wsdomain  }/${  this.project}`;

  if (type == 'public') {
    // 是否是公共数据访问的访问
    fullUrl += '/wsPublicMessage';
  } else {
    // 需要会话的数据访问
    fullUrl += '/wsMessage';
  }

  if (sessionid != undefined && sessionid != null && sessionid != '') {
    fullUrl = `${fullUrl  }?token=${  sessionid}`;
  }

  try {
    if (typeof window === 'undefined') {
      this.websocket = new WebSocket(fullUrl);
    } else if ('WebSocket' in window) {
      this.websocket = new WebSocket(fullUrl);
    } else if ('MozWebSocket' in window) {
      this.websocket = new MozWebSocket(URL);
    } else {
      console.error('您的浏览器不支持WebSocket,请更换最新版本浏览器');
      return false;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  const self = this;
  this.websocket.onopen = function(evnt) {
    self.setConnected(true);

    if (self.onconnect != null) {
      self.onconnect(evnt);
    }

    console.log('connect success.');
  };
  this.websocket.onerror = function(evnt) {
    self.log(`错误: ${  JSON.stringify(evnt)}`);

    self.setConnected(false);
    self.onclose = null;
    if (self.onerror != null) {
      self.onerror(evnt);
    }

    self.disconnect(evnt);
  };
  this.websocket.onclose = function(evnt) {
    if (self.onclose != null && (event != null || event.code != 1000)) {
      self.onclose(evnt);
      self.onclose = null;
    }
    self.disconnect(evnt);
  };
  // 处理报文收取
  this.websocket.onmessage = function(evnt) {
    try {
      // 目前只处理string类型的报文
      if (typeof evnt.data !== 'string') {
        return;
      }

      const response = JSON.parse(evnt.data);

      // 处理报文类型
      if (response.oper == 'subscribe' && response.errorCode == 0) {
        // 处理订阅的报文

        if (response.data != '') {
          if (self.onMsgReceive != null) {
            self.onMsgReceive(response.topic, response.data);
          }
        } else {
          console.debug(evnt.data);
        }
      } else if (response.oper == 'callservice') {
        // 处理服务调用

        if (
          self.serviceReqMap == null ||
          typeof self.serviceReqMap[response.requestId] === 'undefined' ||
          self.serviceReqMap[response.requestId] == null
        ) {
          console.warn(`${response.requestId  } call error! ${  evnt.data}`);
          return;
        }

        const callback = self.serviceReqMap[response.requestId].callback;
        // 清理超时回调处理
        clearTimeout(self.serviceReqMap[response.requestId].t);

        if (callback != null) {
          callback(response.headerErrorCode, response.errorCode, response.errorMsg, response.data);
        }

        if (self.serviceReqMap != null) {
          delete self.serviceReqMap[response.requestId];
        }
      } else if (response.oper === 'unsubscribe' && response.errorCode === 0) {
        // 处理取消订阅的报文
        console.debug(evnt.data);
      } else {
        console.error(`${response.errorCode  }: ${  response.errorMsg  }\n${  evnt.data}`);
      }
    } catch (e) {
      console.error(`${e  }:${  evnt.data}`);
    }
  };

  // begin touch
  setTimeout(_WebsocketClientTouch(this), this.touchTime);
  return true;
};

WebsocketClient.prototype.setOnclose = function(func) {
  if (func === undefined || func == null) {
    return;
  }

  this.onclose = func;
};

// 连接成功回调
WebsocketClient.prototype.setOnConnect = function(func) {
  if (func === undefined || func == null) {
    return;
  }

  this.onconnect = func;
};

// 连接异常回调
WebsocketClient.prototype.setOnError = function(func) {
  if (func === undefined || func == null) {
    return;
  }

  this.onerror = func;
};

// 发送消息
WebsocketClient.prototype.send = function(data) {
  this.websocket.send(JSON.stringify(data));
};

// 订阅
WebsocketClient.prototype.subscribe = function(topic, params) {
  if (topic === undefined || topic == null || topic == '') {
    console.error('订阅主题不正确');
    return;
  }

  const data = { oper: 'subscribe', topic };

  if (params != null && params !== undefined) {
    data.params = params;
  }

  this.send(data);
};
// 取消订阅
WebsocketClient.prototype.unsubscribe = function(topic, params) {
  if (topic === undefined || topic == null || topic == '') {
    console.error('订阅主题不正确');
    return;
  }

  const data = { oper: 'unsubscribe', topic };
  if (params != null && params !== undefined) {
    data.params = params;
  }
  this.send(data);
};
// 注册消息接收方法
WebsocketClient.prototype.register = function(callback) {
  this.onMsgReceive = callback;
};

// 退出
WebsocketClient.prototype.disconnect = function() {
  if (this.websocket != null) {
    this.websocket.close(1000, '关闭连接');
    this.websocket = null;
    this.onclose = null;
    this.onconnect = null;
    this.onerror = null;

    this.log('关闭连接');
    this.setConnected(false);

    // 处理 未处理的service 回调
    for (const obj in this.serviceReqMap) {
      const callback = this.serviceReqMap[obj].callback;

      // -2 代表超时, -1 代表网络出现问题, -3 代表主动关闭连接
      callback(WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_CLOSE);
    }

    this.serviceReqMap = null;
  }
};
// 设置连接状态
WebsocketClient.prototype.setConnected = function(flag) {
  this.connected = flag;
};
// 判断是否连接
WebsocketClient.prototype.isConnected = function() {
  return this.connected;
};

WebsocketClient.prototype.log = function(message) {
  console.info(message);
};

// 保持连接
WebsocketClient.prototype.touch = function() {
  if (this.connected) {
    const data = { oper: 'touch' };

    this.websocket.send(JSON.stringify(data));
    console.log('WebsocketClient touched');
    setTimeout(_WebsocketClientTouch(this), this.touchTime);
  }
};

// touch的时间间隔
WebsocketClient.prototype.setTouchTime = function(time) {
  this.touchTime = time;
};

// 调用service
// callback(headerErrorCode, errCode, errMsg, result)
// headerErrorCode: -2 代表超时, -1 代表网络出现问题
WebsocketClient.prototype.callService = function(service, method, params, callback, timeout) {
  if (timeout === undefined || timeout == null || timeout == '') {
    timeout = 1000;
  }
  // -1 代表网络出现问题
  if (this.connected == false) {
    callback(WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_NETWORK);
  }

  // 拼装需要发送的对象报文
  const data = { oper: 'callservice' };
  let requestId = this.uniqueNumber();
  requestId = requestId.toString();
  data.requestId = requestId;
  data.url = `/service/${  service  }/${  method}`;
  data.params = params;
  data.method = 'POST';

  // 指定超时回调
  const t = setTimeout(
    () => {
      if (
        this.serviceReqMap == null ||
        typeof this.serviceReqMap[requestId] === 'undefined' ||
        this.serviceReqMap[requestId] == null
      ) {
        return;
      }

      const callback = this.serviceReqMap[requestId].callback;

      // -2 代表超时, -1 代表网络出现问题
      if (callback != null) {
        callback(WebsocketClient.prototype.SERVICE_CALL_ERROR_CODE_TIMEOUT);
      }

      delete this.serviceReqMap[requestId];
    },
    timeout
  );

  // 指定回调
  this.serviceReqMap[requestId] = { callback, timeout: t };

  // 发送报文
  this.send(data);
};

// 保持心跳回调函数
function _WebsocketClientTouch(socketClient) {
  const client = socketClient;
  return function() {
    client.touch();
  };
}

export default WebsocketClient;
