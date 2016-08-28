/**
 * Created by Jixun on 28/08/2016.
 */

interface IStorageObject {
  _time: number;
  [key: string]: any;
}


export class Storage {
  private _key: string;
  private _cache: IStorageObject;
  get key(): string { return this._key; }

  constructor(key: string) {
    this._key = key;
    this._cache = this.baseData;
  }

  get baseData(): any {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || {};
    } catch (err) {
      return {};
    }
  }

  set baseData(value: any) {
    if(typeof(value) != 'string')
      value = JSON.stringify(value);

    localStorage.setItem(this.key, value as string);
  }

  get(id: number|string): any {
    return this._cache[id as any];
  }

  set(id: number|string, value: any) {
    this._cache[id] = value;
    this._cache._time = +new Date();
    this.baseData = this._cache;
  }
}