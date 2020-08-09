export default (str: string) => {
    const i = document.createElement('input');
    i.setAttribute('type', 'text');
    i.value = str;
    document.body.appendChild(i);
    i.select();
    document.execCommand('Copy');
    document.body.removeChild(i);
}
