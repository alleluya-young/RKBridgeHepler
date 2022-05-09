const U = navigator.userAgent;

const RKBridge = {
  isAndroid: () => U.indexOf('Android') > -1 || U.indexOf('Linux') > -1 || U.indexOf('Adr') > -1,
  isIOS: () => !!U.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) || /(iPhone|iPad|iPod|iOS|Mac)/i.test(U),
  isRKApp: () => U.indexOf('Rockontrol') > -1,
  RKAppVersion: () => U.split('Rockontrol=')[1],
  msgCallbackMap: {},
  eventCallMap: {},
  callbackDispatcher: function (callbackId, resultjson) {
    const handler = RKBridge.msgCallbackMap[callbackId];
    if (handler && typeof handler === 'function') {
      const resultObj = resultjson ? JSON.parse(resultjson) : {};
      handler(resultObj);
    }
  },
  getNextCallbackID: function () {
    const timeStamp = new Date().getTime();
    return `callbackDispatcher_${timeStamp}`;
  },
  /**
   * JS调用Native同步返回
   * @param {*} data {moduleName,methodName,params}
   */
  sendSyncMessage: function (data) {
    const params = JSON.stringify(data);
    let resultjson;
    try {
      if (this.isIOS()) resultjson = prompt(params);
      if (this.isAndroid()) resultjson = window.RKBridge && window.RKBridge.distributeMessage(params);
      const resultObj = resultjson ? JSON.parse(resultjson) : {};
      return resultObj;
    } catch (err) {
      throw 'error';
    }
  },
  /**
   * JS异步调用Native, JS call Native
   * @param {*} data {moduleName,methodName,params,callbackId,callbackFunction }
   * @param {*} callback
   */
  sendAsyncMessage: function (data, callback) {
    if (callback && typeof callback === 'function') {
      const callbackId = this.getNextCallbackID();
      this.msgCallbackMap[callbackId] = callback;
      data.callbackId = callbackId;
      data.callbackFunction = 'window.callbackDispatcher';
    }
    const params = JSON.stringify(data);
    if (this.isIOS()) {
      try {
        window.webkit.messageHandlers.distributeMessage.postMessage(params);
      } catch (error) {
        throw 'error native message';
      }
    }

    if (this.isAndroid()) {
      try {
        window.RKBridge && window.RKBridge.distributeMessage(params);
      } catch (error) {
        throw 'error native message';
      }
    }
  },
  /**
   * JS接收Native 备用
   * @param {*} methodName
   * @param {*} callback
   */
  onReceive: function (methodName, callback) {
    window.RKBridge[methodName] = callback;
  },
};

window.callbackDispatcher = RKBridge.callbackDispatcher;

export default RKBridge;
