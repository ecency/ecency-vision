export default (str: string) => str.replace(/<a id="/g, '<a data-id="');
