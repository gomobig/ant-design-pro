import WebSocketClient from './WebsocketClientWebWork';

const websocketClient = new WebSocketClient();

const ws = {};
const topics = new Set();
const callbackMap = new Map();

ws.connect = () => {
  if (!websocketClient.isConnected()) {
    websocketClient.setOnConnect(() => {
      topics.forEach(topic => {
        websocketClient.subscribe(topic);
      });
    });
    websocketClient.register(topicCallback);
    websocketClient.connect('public');
  }
};

// 订阅主题并注册回调
ws.subscribe = (topic, func) => {
  // 如果连接已经建立 直接订阅
  if (websocketClient.isConnected()) {
    websocketClient.subscribe(topic);
  }
  topics.add(topic);
  callbackMap.set(topic, func);
};

ws.unsubscribe = topic => {
  topics.delete(topic);
  callbackMap.delete(topic);
  websocketClient.unsubscribe(topic);
};

ws.close = () => {
  topics.forEach(topic => {
    websocketClient.unsubscribe(topic);
  });
  topics.clear();
  callbackMap.clear();
  websocketClient.disconnect();
};

// websocket 消息回调
const topicCallback = (topic, obj) => {
  const fn = callbackMap.get(topic);
  if (typeof fn === 'function') {
    fn(obj);
  }
};

websocketClient.setOnclose(() => {
  window.console.error('连接已断开');
});
websocketClient.setOnError(() => {
  window.console.error('连接失败');
});

if (!websocketClient.isConnected()) {
  websocketClient.setOnConnect(() => {
    window.console.info('connected.');
    websocketClient.subscribe('test');
  });

  websocketClient.register((topic, obj) => {
    window.console.log(topic, obj);
  });
}

export default ws;
