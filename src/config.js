import '../public/remote';

let httpUrl = '';
let wsUrl = '';
let hostUrl = '';
/* eslint no-undef: 0 */
if (!globalDomain) {
  const host = window.location.href;
  const res = host.match(/(\w+):\/\/([^/:]+)(:\d*)?/);
  // console.log('host', res)
  let wsStr;
  if (res[1] && res[1] === 'https') {
    wsStr = 'wss';
  } else {
    wsStr = 'ws';
  }
  if (res[3]) {
    httpUrl = `${res[1]}://${res[2]}${res[3]}`;
    wsUrl = `${wsStr}://${res[2]}${res[3]}`;
    hostUrl = `${res[2]}`;
  } else {
    httpUrl = `${res[1]}://${res[2]}`;
    wsUrl = `${wsStr}://${res[2]}`;
    hostUrl = `${res[2]}`;
  }
} else {
  httpUrl = globalDomain;
  wsUrl = globalWsdomain;
  // console.log('globalDomain122222222222222', globalDomain)
  const hostRes = httpUrl.match(/(\w+):\/\/([^/:]+)(:\d*)?/);
  if (hostRes[2]) {
    hostUrl = `${hostRes[2]}`;
  }
}
const config = {
  domain: httpUrl,
  wsdomain: wsUrl,
  hostmain: hostUrl,
  project: 'guard',
  timeout: 10000,
  domain1: '',
  project1: '',
  domain2: '',
  project2: '',
  serviceCallProtocol: 'http', // 前端调用service选用的协议, "" 系统会自动选择(优先选择ws,如果不支持再选择http), "http" http调用, "ws" websocket调用
  errorHandlers: {
    // 自定义错误处理文件路径, 从app根目录开始
    notLogonHandler() {
      // 清除localStorage
      // localStorage.removeItem('trade_user_key')
      // localStorage.removeItem('trade_user_info')
      // var l_href = location.href.split('/')
      // l_href.pop()
      // var href = l_href.join('/').replace('/index.html#', '')
      // .replace('/index.htm#', '').replace('/#', '')
      // window.location.href = href + '/login.html'
    },
    //
    // permissionDeniedHandler: function () {
    //
    // },
    // versionNotSupportHandler: function () {
    //
    // },
    // sessionInvalidHandler: function () {
    //
    // },
    networkErrorHandler() {
      console.log('网络连接异常!');
    },
    noServiceHandler() {
      console.log('请求无对应服务');
    },
    noInterfaceHandler() {
      console.log('请求接口错误');
    },
    jsonConvertErrorHandler() {
      console.log('返回对象无法做json对象转换');
    },
    parameterCountErrorHandler() {
      console.log('请求参数个数错误');
    },
    parameterTypeErrorHandler() {
      console.log('请求参数类型错误');
    },
    jsonToJavaErrorHandler() {
      console.log('请求参数无法转换java对象');
    },
    businessProcessErrorHandler() {
      console.log('后台业务处理遇到未知错误');
    },
    entityWithoutIdHandler() {
      console.log('entity定义错误,没有主键Id');
    },
    dbConnectErrorHandler() {
      console.log('数据库无法获得连接');
    },
    fieldValidateErrorHandler(msg) {
      console.log(`字段校验异常：${msg}`);
    },
    callServiceOverFrequencyErrorHandler() {
      console.log('服务访问过频');
    },
    timeoutHandler() {
      console.log('服务访问超时');
    },
    unhandledErrorHandler(msg) {
      console.log('未知错误');
    },
  },
  changeDomain() {
    // 如果有多个服务端要访问，这种写法用于切换服务端地址，由于使用的是全局变量，要注意异步的问题
    this.domain = this.domain1;
    this.project = this.project1;
  },
  changeDomain1() {
    // 如果有多个服务端要访问，这种写法用于切换服务端地址，由于使用的是全局变量，要注意异步的问题
    this.domain = this.domain2;
    this.project = this.project2;
  },
};

export default config;
