'use strict';

module.exports = { 
    inspectObject: (o) => {return Object.entries(o);},
    mapObject: (o) => {return new Map(Object.entries(o));},
    properyValues: (o) => {return Object.values(o).reduce( (acc,v) => {acc += ` '${v}',`; return acc;},'').slice(0,-1)}
}
