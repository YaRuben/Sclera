const $ = (a) => {return document.getElementById(a);};
const inspectObject = (o) => { return Object.entries(o); };
const mapObject = (o) => { return new Map(Object.entries(o)); };
const properyValues = (o) => { return Object.values(o).reduce((acc, v) => { acc += ` '${v}',`; return acc; }, '').slice(0, -1) };
