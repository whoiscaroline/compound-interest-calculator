(function (root) {
  'use strict';
  function simulate({ initial, monthly, years, rate, inflation = 0 }) {
    const values = { initial, monthly, years, rate, inflation };
    for (const [key, value] of Object.entries(values)) {
      if (!Number.isFinite(value)) throw new Error(`${key} must be finite`);
    }
    if (initial < 0 || monthly < 0 || years < 1 || years > 60 || !Number.isInteger(years) || rate <= -100 || inflation <= -100) throw new Error('Invalid scenario');
    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
    let balance = initial;
    const rows = [{ year: 0, contributions: initial, nominal: initial, real: initial }];
    for (let month = 1; month <= years * 12; month++) {
      balance = balance * (1 + monthlyRate) + monthly;
      if (month % 12 === 0) {
        const year = month / 12;
        rows.push({ year, contributions: initial + monthly * month, nominal: balance, real: balance / Math.pow(1 + inflation / 100, year) });
      }
    }
    return rows;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { simulate };
  root.ReturnLab = { simulate };
})(typeof globalThis !== 'undefined' ? globalThis : this);
