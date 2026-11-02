export class QueryPromise {
  constructor(executor) {
    this._executor = executor;
    this._sortField = null;
    this._sortAsc = true;
    this._limitNum = null;
  }

  sort(sortObj) {
    if (sortObj) {
      const [field, dir] = Object.entries(sortObj)[0] || [];
      this._sortField = field;
      this._sortAsc = dir === 1 || dir === 'asc' || dir === 'ascending';
    }
    return this;
  }

  limit(n) {
    this._limitNum = n;
    return this;
  }

  skip(n) {
    this._skipNum = n;
    return this;
  }

  populate() {
    return this;
  }

  async exec() {
    let list = await this._executor();
    if (!Array.isArray(list)) list = [];

    if (this._sortField) {
      list.sort((a, b) => {
        const valA = a[this._sortField];
        const valB = b[this._sortField];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return this._sortAsc ? -1 : 1;
        if (valA > valB) return this._sortAsc ? 1 : -1;
        return 0;
      });
    }

    if (this._skipNum) {
      list = list.slice(this._skipNum);
    }

    if (this._limitNum !== null && this._limitNum !== undefined) {
      list = list.slice(0, this._limitNum);
    }

    return list;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export default QueryPromise;
