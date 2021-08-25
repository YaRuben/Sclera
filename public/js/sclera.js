const $ = (a) => { return document.getElementById(a); };
const inspectObject = (o) => { return Object.entries(o); };
const mapObject = (o) => { return new Map(Object.entries(o)); };
const properyValues = (o) => { return Object.values(o).reduce((acc, v) => { acc += ` '${v}',`; return acc; }, '').slice(0, -1) };

const getData = async (url, params) => {
    let result;
    url += Array.isArray(params) ? '/' + params.join('/') : '';
    await fetch(url)
        .then(r => r.json())
        .then(j => { result = j; })
        .catch(err => console.log(err));
    return result;
};
const buildOptions = async (url, params, root) => {
    let opt = await getData(url, params);
    opt.forEach(o => {let oe = document.createElement('option'); oe.value = o.ID; oe.innerHTML = o.Role; root.append(oe);});
    
}
