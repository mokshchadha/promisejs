const { STATE } = require("./constants");

const MyPromise = function (cb) {
  this._thenCallBacks = [];
  this._catchCallBacks = [];
  this._state = STATE.PENDING;
  this._value;

  try {
    this._onSuccess = this._onSuccess.bind(this);
    this._onFail = this._onFail.bind(this);
    cb(this._onSuccess, this._onFail);
  } catch (error) {
    this._onFail(error);
  }
};

MyPromise.prototype._onSuccess = function (value) {
  if (this._state !== STATE.PENDING) return;
  this._value = value;
  this._state = STATE.RESOLVED;
};

MyPromise.prototype._onFail = function (value) {
  if (this._state !== STATE.PENDING) return;
  this._value = value;
  this._state = STATE.REJECTED;
};

MyPromise.prototype._onSuccessBindForChaining = function () {
  return this._onSuccess.bind(this);
};

MyPromise.prototype._onFailBindForChaining = function () {
  return this._onFail.bind(this);
};

MyPromise.prototype.then = function (callBack, catchCallBack) {
  return new MyPromise((resolve, reject) => {
    this._thenCallBacks.push((result) => {
      if (callBack == null) {
        resolve(result);
        return;
      }
      try {
        resolve(callBack(result));
      } catch (error) {
        reject(error);
      }
    });

    this._catchCallBacks.push((result) => {
      if (catchCallBack == null) {
        reject(result);
        return;
      }
      try {
        resolve(catchCallBack(result));
      } catch (error) {
        reject(error);
      }
    });

    this._runCallBacks();
  });
};

MyPromise.prototype.catch = function (callBack) {
  this.then(null, callBack);
};

MyPromise.prototype.finally = function (callBack) {
  if (
    callBack &&
    (this._state === STATE.REJECTED || this._state === STATE.RESOLVED)
  ) {
    callBack(this._value);
  }
};

MyPromise.prototype._runCallBacks = function () {
  if (this._state === STATE.RESOLVED) {
    this._thenCallBacks.forEach((cb) => cb(this._value));
    this._thenCallBacks = [];
  } else if (this._state === STATE.REJECTED) {
    this._catchCallBacks.forEach((cb) => cb(this._value));
    this._catchCallBacks = [];
  }
};

const test = new MyPromise();

module.exports = MyPromise;
