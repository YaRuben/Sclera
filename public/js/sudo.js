'use strict';
const applyJson = (t, js, root) => {
    root = root || document.createElementAll(t.nodeName);
    Array.from(t.querySelectorAll('[data-match]'))
        .forEach(tl => {
            Object.entries(js)
                .forEach(j => {
                    if (tl.dataset.match === j[0]) {
                        let ne = tl.cloneNode(false);
                        root.append(ne);
                        // if ((Array.isArray(j[1])) || (typeof(j[1])==="object"))
                        if (Array.isArray(j[1])) 
                        {
                            if (ne.dataset.display) {
                                window[ne.dataset.display](ne, j);
                            } else {
                            ne.innerHTML = `<strong>${j[0]}</strong><br>`;
                            }
                            //let om = (Array.isArray(j[1]))?j[1]:Object.entries(j[1]);
                            j[1].forEach(je => {
                                applyJson(tl, je, ne);
                            });
                        } else {
                                if (ne.dataset.match == j[0]) {
                                if (ne.dataset.display) {
                                    window[ne.dataset.display](ne, j);
                                } else {
                                    ne.innerHTML = j[0] + ':' + `<strong>${j[1]}</strong>`;
                                }
                            }
                        }
                    }
                }); 
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



