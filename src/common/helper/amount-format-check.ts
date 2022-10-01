export default (v: string) => /^\d{1,3}(,?\d{3})*(\.(\d{3},?)*\d{1,3})?$/.test(v);
