/*
*  单例模式
*
* */

// 单例模式抽象，分离创建对象的函数和判断对象是否已经创建
export default class Singleton {
  constructor(fn) {
    this.fn = fn;
    this.instance = null;
  }
  // 构造一个接口，供用户对该类进行实例化
  static getInstance(fn) {
    if (!this.instance) {
      this.instance = new Singleton(fn);
    }
    return this.instance.fn;
  }
}
