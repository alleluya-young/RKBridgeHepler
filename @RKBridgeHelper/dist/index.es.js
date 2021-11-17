const U = navigator.userAgent;
const RKBridge = {
  isAndroid: () => U.indexOf('Android') > -1 || U.indexOf('Linux') > -1 || U.indexOf('Adr') > -1,
  isIOS: () => !!U.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) || /(iPhone|iPad|iPod|iOS|Mac)/i.test(U),
  isRKApp: () => U.indexOf('Rockontrol') > -1,
  RKAppVersion: () => U.split('Rockontrol=')[1],
  msgCallbackMap: {},
  callbackDispatcher: function (callbackId, resultjson) {
    let handler = RKBridge.msgCallbackMap[callbackId];

    if (handler && typeof handler === 'function') {
      let resultObj = resultjson ? JSON.parse(resultjson) : {};
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
    let params = JSON.stringify(data);

    try {
      if (this.isIOS()) {
        let resultjson = prompt(params);
        let resultObj = resultjson ? JSON.parse(resultjson) : {};
        return resultObj;
      }

      if (this.isAndroid()) {
        let resultjson = window.RKBridge && window.RKBridge.distributeMessage(params);
        let resultObj = resultjson ? JSON.parse(resultjson) : {};
        return resultObj;
      }
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
      let callbackId = this.getNextCallbackID();
      this.msgCallbackMap[callbackId] = callback;
      data.callbackId = callbackId;
      data.callbackFunction = 'window.callbackDispatcher';
    }

    let params = JSON.stringify(data);

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
   * JS接手Native 备用
   * @param {*} methodName
   * @param {*} callback
   */
  onReceive: function (methodName, callback) {
    window.RKBridge[methodName] = callback;
  }
};
window.callbackDispatcher = RKBridge.callbackDispatcher;

export { RKBridge as default };
