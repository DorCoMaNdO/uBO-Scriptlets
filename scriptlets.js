// Collection of userscripts to be used for scriptlet injection on domains.

/// remove-shadowroot-elem.js
/// alias rsre.js
// example.com##+js(rsre, [selector])
(() => {
		  'use strict';
		  const selector = '{{1}}';
		  if ( selector === '' || selector === '{{1}}' ) { return; }
		  const behavior = '{{2}}';
		  let timer;
		  const queryShadowRootElement = (shadowRootElement, rootElement) => {
			if (!rootElement) {
			    return queryShadowRootElement(shadowRootElement, document.documentElement);
			}
			const els = rootElement.querySelectorAll(shadowRootElement);
			for (const el of els) { if (el) {return el;} }
			const probes = rootElement.querySelectorAll('*');
			for (const probe of probes) {
			     if (probe.shadowRoot) {
			         const shadowElement = queryShadowRootElement(shadowRootElement, probe.shadowRoot);
				 if (shadowElement) { return shadowElement; }
			     }
			}
			return null;
		  };
		  const rmshadowelem = () => {
			timer = undefined;
			try {
				const elem = queryShadowRootElement(selector);
				if (elem) { elem.remove(); }
			} catch { }
		  };
		  const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(rmshadowelem, { timeout: 67 });
		  };
		  const start = ( ) => {
			rmshadowelem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			      attributes: true,
			      childList: true,
			      subtree: true,
			});
		  };
		  if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		     } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		     } else {
			start();
		  }
})();

/// remove-node.js
/// alias rn.js
// example.com##+js(rn, /adblock|adsense/, script)
(() => { 
          'use strict';
          let needle = '{{1}}';
          if ( needle === '' || needle === '{{1}}' ) {
              needle = '^';
          } else if ( needle.slice(0,1) === '/' && needle.slice(-1) === '/' ) {
              needle = needle.slice(1,-1);
          } else {
              needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          }
          needle = new RegExp(needle);
	  const remnode = () => {
		  			const nodes = document.querySelectorAll('{{2}}');
		  			try {
                                                  for (const node of nodes) {
							if (needle.test(node.outerHTML)) {
                                                            node.textContent = ''; 
						       	    node.remove(); 
                                                       }     
                                                  }
                                        } catch { }
          };
	  const observer = new MutationObserver(remnode);
    	  observer.observe(document.documentElement, { childList: true, subtree: true });
	  if ( document.readyState === "complete" ) { observer.disconnect(); }
})();

/// set-attr.js
/// alias sa.js
// example.com##+js(sa, preload, none, video)
(() => {
		  'use strict';
		  const token = '{{1}}';
		  if ( token === '' || token === '{{1}}' ) { return; }
		  const tokens = token.split(/\s*\|\s*/);
		  const attrValue = '{{2}}';
		  let selector = '{{3}}';
		  if ( selector === '' || selector === '{{3}}' ) { selector = `[${tokens.join('],[')}]`; }
	          let timer;
		  const behavior = '{{4}}';
		  const setattr = () => {
			timer = undefined;  
			const nodes = document.querySelectorAll(selector);
			try {
				for (const node of nodes) {
					for ( const attr of tokens ) {
					      if ( attr !== attrValue) { 
					      	   node.setAttribute(attr, attrValue);
					      }	      
					}
				}
			} catch { }
		  };
		  const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(setattr, { timeout: 67 });
		  };
		  const start = ( ) => {
			setattr();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    attributeFilter: tokens,
			    childList: true,
			    subtree: true,
			});
		  };
		  if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		     } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		     } else {
			start();
		  }
})();

/// create-elem.js
/// alias ce.js
// example.com##+js(ce, [selector], display:block !important, div)
(() => {
		'use strict';
		const identifier = '{{1}}';
		if ( identifier === '' || identifier === '{{1}}' ) { return; }
		const identifiers = identifier.split(/\s*\|\s*/);
		let executeOnce = false;
		const createelem = () => {
						if (executeOnce !== false) { return; }
						try {
							for (const token of identifiers) {
							     const element = document.createElement('{{3}}');
							     if (token.charAt(0) === '#') {
								 element.id = token.substring(1);
							     } else if (token.charAt(0) === '.') {
								 element.className = token.substring(1);
							     } else { return; }
							     element.style.cssText = '{{2}}';
							     document.body.append(element);	
							}	
							executeOnce = true;
						} catch { }
	   	};
	   	const observer = new MutationObserver(createelem);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// rem-class.js
/// alias rmc.js
// example.com##+js(rmc, example, [selector])
(() => {
		    'use strict';
		    const token = '{{1}}';
		    if ( token === '' || token === '{{1}}' ) { return; }
		    const tokens = token.split(/\s*\|\s*/);
		    let selector = '{{2}}';
		    if ( selector === '' || selector === '{{2}}' ) {
			selector = `[${tokens.join('],[')}]`;
		    }
		    const behavior = '{{3}}';
		    let timer;
		    const rmclass = ( ) => {
			timer = undefined;
			try {
			    const nodes = document.querySelectorAll(selector);
			    for ( const node of nodes ) {
				   if ( node.classList.contains(...tokens) ) {
					node.classList.remove(...tokens);
				    }
			    }
			} catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(rmclass, { timeout: 67 });
		    };
		    const start = ( ) => {
			rmclass();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    attributeFilter: tokens,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// add-class.js
/// alias ac.js
// example.com##+js(ac, example, [selector])
(() => {
		    'use strict';
		    const needle = '{{1}}';
		    if ( needle === '' || needle === '{{1}}' ) { return; }
		    const needles = needle.split(/\s*\|\s*/);
		    let selector = '{{2}}';
		    if ( selector === '' || selector === '{{2}}' ) { selector = '.' + needles.map(a => CSS.escape(a)).join(',.'); }
		    const addclass = ev => {
						if (ev) { window.removeEventListener(ev.type, addclass, true);  }
						const nodes = document.querySelectorAll(selector);
						try {
							for ( const node of nodes ) {
							      node.classList.add(...needles);
							}
						} catch { }
		    };
		    if (document.readyState === 'loading') {
		    	      window.addEventListener('DOMContentLoaded', addclass, true);
	   	    } else {
		    	      addclass();
	   	    }
})();

/// multiup.js
/// alias mtu.js
// example.com##+js(mtu, form[action], button[link], action, link)
(() => {
		'use strict';
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const selector2 = '{{2}}';
		if ( selector2 === '' || selector2 === '{{2}}' ) { return; }
		const multiup = ev => {
						if (ev) { window.removeEventListener(ev.type, multiup, true); }
						try {
							const elem = document.querySelectorAll(selector);
							const elem2 = document.querySelectorAll(selector2);
							for (let i = 0; i < elem.length; i++) {
								elem[i].setAttribute('{{3}}', elem2[i].getAttribute('{{4}}'));
							}
						} catch { }
		};
		if (document.readyState === 'loading') {
		    	    window.addEventListener('DOMContentLoaded', multiup, true);
	   	} else {
		    	    multiup();
	   	}
})();

/// insert-iframe.js
/// alias ii.js
// example.com##+js(ii, 2, [selector], src, style)
(() => {
    	        'use strict';
		const iframes = '{{1}}';
		if ( iframes === '' || iframes === '{{1}}' ) { return; }
		let executeOnce = false;
		const insertframe = () => {
						  if (executeOnce !== false) { return; }
						  try {
							for ( let i = 0; i < iframes; i++ ) {
							      const iframe = document.createElement('iframe');
							      iframe.setAttribute('id', '{{2}}');
							      iframe.setAttribute('src', '{{3}}');
							      iframe.setAttribute('style', '{{4}}');
							      document.body.append(iframe);
							}
							executeOnce = true;
						  } catch { }
		};			
		const observer = new MutationObserver(insertframe);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// insert-elem-before.js
/// alias ieb.js
// example.com##+js(ieb, [selector], display:block !important, node, div)
(() => {
		'use strict';
		const identifier = '{{1}}';
		if ( identifier === '' || identifier === '{{1}}' ) { return; }
		const identifiers = identifier.split(/\s*\|\s*/);
		let executeOnce = false;
		const insertelem = () => {
						if (executeOnce !== false) { return; }
						try {
							for (const token of identifiers) {
							     const element = document.createElement('{{4}}');
							     const node = document.querySelector('{{3}}');
							     if (token.charAt(0) === '#') {
							    	 element.id = token.substring(1);
							     } else if (token.charAt(0) === '.') {
							    	 element.className = token.substring(1);
							     } else { return; }	 
							     element.style.cssText = '{{2}}';
							     document.body.insertBefore(element, node);
							}	
							executeOnce = true;
						} catch { }
	   	};
	   	const observer = new MutationObserver(insertelem);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// append-elem.js
/// alias ape.js
// example.com##+js(ape, [selector], element, attribute, value)
(() => {
		'use strict';
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const appendNode = ev => {
						if (ev) { window.removeEventListener(ev.type, appendNode, true); }
						try {
							const elements = document.querySelectorAll(selector);
							for ( const element of elements ) {
							      const node = document.createElement('{{2}}');
							      node.setAttribute('{{3}}', '{{4}}');
							      element.append(node);
							}
						} catch { }
		};
		if (document.readyState === 'complete') {
		    	    appendNode();
	   	} else {
		    	    window.addEventListener('load', appendNode, true);
	   	}
})();

/// removeItem.js
/// alias ri.js
// example.com##+js(ri, key)
(() => {
		    'use strict';
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    let timer;
	            const behavior = '{{2}}';
		    const removeItem = () => {
			  timer = undefined;
			  try {
				   for (const keyName of keys) {
					localStorage.removeItem(keyName);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(removeItem, { timeout: 67 });
		    };
		    const start = ( ) => {
			removeItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// setItem.js
/// alias si.js
// example.com##+js(si, key, value)
(() => {
		    'use strict';
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    const value = '{{2}}';
		    let timer;
	            const behavior = '{{3}}';
		    const setItem = () => {
			  timer = undefined;
			  try {
				   for (const keyName of keys) {
					if (localStorage.getItem(keyName) === value) { break; }
					   localStorage.setItem(keyName, value);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(setItem, { timeout: 67 });
		    };
		    const start = ( ) => {
			setItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// executesitefunction.js
/// alias esf.js
// example.com##+js(esf, funcName, funcDelay)
(() => {
	      'use strict';
	      const funcCall = '{{1}}';
	      if ( funcCall === '' || funcCall === '{{1}}' ) { return; }
	      const funcDelay = '{{2}}';
	      if ( funcDelay === '' || funcDelay === '{{2}}' ) { return; }
	      const funcInvoke = ev => { 
		      				if (ev) { window.removeEventListener(ev.type, funcInvoke, true); }
		      				try { 
							setTimeout(window[funcCall], funcDelay);
						} catch { }
	      };	      
	      if (document.readyState === 'interactive' || document.readyState === 'complete') {
		    	    funcInvoke();
	      } else {
		    	    window.addEventListener('DOMContentLoaded', funcInvoke, true);
	      }
})();

/// no-alert-if.js
/// alias noaif.js
// example.com##+js(noaif, loading ad)
(() => {
                'use strict';
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( needle.startsWith('/') && needle.endsWith('/') ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle === '' ? console.log : undefined;
                const reNeedle = new RegExp(needle);
                self.alert = new Proxy(self.alert, {
                        apply: (target, thisArg, args) => {
                            const params = String(args);
                            let defuse = false;
                            if ( log !== undefined ) {
                                 log('uBO: alert("%s")', params);
                            } else if ( reNeedle.test(params) !== needleNot ) {
                                 defuse = reNeedle.test(params) !== needleNot;
                            }
                            if ( !defuse ) {
                                 return target.apply(thisArg, args);
                            }  
                        }
                });
})();

/// no-xhr-if.js
/// alias noxif.js
// example.com##+js(noxif, /someSoup/)
(() => {
                'use strict';
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( needle.startsWith('/') && needle.endsWith('/') ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle === '' ? console.log : undefined;
                const reNeedle = new RegExp(needle);
                self.XMLHttpRequest.prototype.open = new Proxy(self.XMLHttpRequest.prototype.open, {
                     apply: (target, thisArg, args) => {
			         const params = String(args);
                                 let defuse = false;
                                 if ( log !== undefined ) {
                                      log('uBO: xhr("%s")', params);
                                 } else if ( reNeedle.test(params) !== needleNot ) {
				      defuse = reNeedle.test(params) !== needleNot;
				      Object.defineProperties(thisArg, {
						'readyState': {	
							writable: true,
							configurable: true
						},
						'responseURL': {
							writable: true,
							configurable: true
						},
						'status': {
							writable: true,
							configurable: true
						},
						'statusText': {
							writable: true,
							configurable: true
						}	
        			      });	 
				      const url = String(args[1]);	 
				      return thisArg.send = () => { 
					      thisArg.readyState = 4;
					      thisArg.responseURL = url;
        				      thisArg.status = 200;
        				      thisArg.statusText = "OK";
				      }	      
                                 }
                                 if ( !defuse ) {
                                      return target.apply(thisArg, args);
                                 }  
                     }
                });
})();

/// no-websocket-if.js
/// alias nowsif.js
// example.com##+js(nowsif, /^/)
(() => {
                'use strict';
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( needle.startsWith('/') && needle.endsWith('/') ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle === '' ? console.log : undefined;
                const reNeedle = new RegExp(needle);
                self.WebSocket = new Proxy(self.WebSocket, {
                     construct: (target, args) => {
                              const params = String(args);      
                              let defuse = false;
                              if ( log !== undefined ) {
                                   log('uBO: websocket("%s")', params);
                              } else if ( reNeedle.test(params) !== needleNot ) {
				   defuse = reNeedle.test(params) !== needleNot;
				   return new Object(new Response());
                              }
                              if ( !defuse ) {
                                    const ws = new target(...args);
                                    return ws;
                              }                                         
                     }
                });
})();
