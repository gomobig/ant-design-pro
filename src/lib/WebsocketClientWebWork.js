export default class WebsocketClientWebWork {
  constructor(wsdomain, project) {
    this.touchTime = 30000; // 心跳包时间
    this.wsdomain = wsdomain;
    this.project = project;
    this.onMsgReceive = null;
    this.websocket = null;
    this.onerror = null;
    this.onconnect = null;
    this.onclose = null;
    this.serviceReqMap = new Map();
    this.connected = false;
    this.unique = 0;
  }

  uniqueNumber = () => {
    this.unique += 1;
    return this.unique;
  };

  setConnected = flag => {
    this.connected = flag;
  };

  setOnConnect = func => {
    this.onconnect = func;
  };

  setOnError = func => {
    this.onerror = func;
  };

  setOnClose = func => {
    this.onclose = func;
  };

  /**
   * 设置心跳时间
   * @param time ms
   */
  setTouchTime = time => {
    this.touchTime = time;
  };

  send = data => {
    this.websocket.send(JSON.stringify(data));
  };

  touch = () => {
    if (this.isConnected()) {
      const beatData = { oper: 'touch' };
      this.send(beatData);
      setInterval(() => {
        this.send(beatData);
      }, this.touchTime);
    }
  };

  isConnected = () => this.connected;

  initOnOpen = () => {
    this.websocket.onopen = event => {
      this.setConnected(true);
      if (this.onconnect) {
        this.onconnect(event);
      }
    };
  };

  initOnError = () => {
    this.websocket.onerror = event => {
      this.setConnected(false);
      this.onclose = null;
      if (this.onerror != null) {
        this.onerror(event);
      }
      this.disconnect(event);
    };
  };

  initOnClose = () => {
    this.websocket.onclose = event => {
      if (this.onclose && event && event.code !== 1000) {
        this.onclose(event);
        this.onclose = null;
      }
      this.disconnect(event);
    };
  };

  initOnMessage = () => {
    this.websocket.onmessage = event => {
      if (typeof event.data !== 'string') return;
      const response = JSON.parse(event.data);
      if (response.oper === 'subscribe' && response.errorCode === 0) {
        if (response.data) {
          if (this.onMsgReceive) this.onMsgReceive(response.topic, response.data);
        } else {
          console.warn(`onmessage response data is empty`);
        }
      } else if (response.oper === 'callservice') {
        const value = this.serviceReqMap.get(response.requestId);
        if (!value) {
          console.error(`${response.requestId} call error: ${event.data}`);
        } else {
          const { callback, timer } = value;
          clearTimeout(timer);
          if (callback)
            callback(
              response.headerErrorCode,
              response.errorCode,
              response.errorMsg,
              response.data
            );
          this.serviceReqMap.delete(response.requestId);
        }
      } else if (response.oper === 'unsubscribe' && response.errorCode === 0) {
        console.warn('receive unsubscribe oper');
      } else {
        console.error(`onmessage [${response.errorCode}][${response.errorMsg}][${event.data}]`);
      }
    };
  };

  initWebsocket = fullUrl => {
    if (typeof window === 'undefined') {
      this.websocket = new WebSocket(fullUrl);
    } else if ('WebSocket' in window) {
      this.websocket = new WebSocket(fullUrl);
    } else if ('MozWebSocket' in window) {
      /* eslint no-undef: "off" */
      this.websocket = new MozWebSocket(URL);
    } else {
      console.error('您的浏览器不支持WebSocket,请更换最新版本浏览器');
      return false;
    }
    this.initOnOpen();
    this.initOnMessage();
    this.initOnClose();
    this.initOnError();
    return true;
  };

  connect = (type, sessionId) => {
    if (!this.wsdomain || !this.project) {
      console.error('no wsdomain or project found.');
      return false;
    }
    let fullUrl = `${this.wsdomain}/${this.project}`;
    if (type === 'public') {
      fullUrl += '/wsPublicMessage';
    } else {
      fullUrl += '/wsMessage';
    }
    if (sessionId) {
      fullUrl = `${fullUrl}?token=${sessionId}`;
    }
    return this.initWebsocket(fullUrl);
  };

  disconnect = () => {
    if (this.websocket) {
      this.websocket.close(1000, 'close websocket');
      this.websocket = null;
      this.onconnect = null;
      this.onerror = null;
      this.setConnected(false);
      this.serviceReqMap.forEach(value => {
        const { callback, timer } = value;
        clearTimeout(timer);
        callback(WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_CLOSE);
      });
      this.serviceReqMap.clear();
    }
  };

  subscribe = (topic, params) => {
    if (!topic) {
      console.error('subscribe topic is incorrect');
    } else {
      let data = { oper: 'subscribe', topic };
      if (params) {
        data = { ...data, params };
      }
      this.send(data);
    }
  };

  unsubscribe = (topic, params) => {
    if (!topic) {
      console.error('unsubscribe topic is incorrect');
    } else {
      let data = { oper: 'unsubscribe', topic };
      if (params) {
        data = { ...data, params };
      }
      this.send(data);
    }
  };

  register = func => {
    this.onMsgReceive = func;
  };

  callService = (service, method, params, callback, timeout) => {
    if (!timeout) {
      /* eslint no-param-reassign: "off" */
      timeout = 1000;
    }
    if (!this.connected) {
      callback(WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_NETWORK);
    }
    const requestId = this.uniqueNumber().toString();
    const data = {
      oper: 'callservice',
      requestId,
      url: `/service/${service}/${method}`,
      params,
      method: 'POST',
    };

    // 指定超时回调
    const timer = setTimeout(() => {
      if (!callback) {
        return;
      }
      callback(WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_TIMEOUT);
      this.serviceReqMap.delete(requestId);
    }, timeout);

    this.serviceReqMap.set(requestId, { callback, timer });
    this.send(data);
  };
}

/* eslint un: "off" */
WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_NETWORK = -1; // service 调用的网络错误
WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_TIMEOUT = -2; // service 调用的超时错误
WebsocketClientWebWork.SERVICE_CALL_ERROR_CODE_CLOSE = -3; // service 调用的主动关注错误
