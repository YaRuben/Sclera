'use strict';

const applyJson = (t, js, root) => {
    let hels = Array.from(t.querySelectorAll('[data-match]'));
    let jent = Object.keys(js);
    if (Array.isArray(js)) {
        js.forEach(j => { applyJson(t, j, root); })
    }
    const matches = hels.filter(element => jent.includes(element.dataset.match));
    matches.forEach(m => {
        let ne = m.cloneNode(false);
        root.append(ne);
        let key = m.dataset.match;
        if (typeof (js[key]) === 'object') {
            applyJson(m, js[key], ne);
        }
        else {
            ne.innerHTML += (ne.dataset.display) ? window[ne.dataset.display](ne, js) : `<strong>${key}:</strong> ${js[key]}`;
        }

    });

};

const setContent = async (url, t, root, params) => {
    url += Array.isArray(params) ? '/' + params.join('/') : '';
    await fetch(url)
        .then(r => r.json())
        .then(j => { console.log(j); applyJson(t, j, root); })
        .catch(err => console.log(err));
};


const applyTemplate = async (t, root, params) => {
    root.innerHTML = '';
    let url = t.dataset.json;
    setContent(url, t, root, params);
};