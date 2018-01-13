/* tiny JS toolkit - minimalistic little helpers - (c) 2010 by Alex Kloss <alexthkloss@web.de> */
/* Thanks to Andre Bogus and Hajo Pflueger for their invaluable help! */
/* Thanks to the nice people on the SelfHTML Forum, too! */
/* Released under LGPL2 */
(function(u) {
	// undefined (speed up things) and Helper functions
	// simple selector regexp -> TagName, Id, className, Name selectors
	// css parser regexp -> CSS2.1 + some irregular enhancements
	// ie opacity filter parser
	// RegExp Replacer
	// getElementsByClassName replacement (if necessary)
	var ss=/(^|^#|^\.)([^#.\s+~<>\[:=,]+|\[name=([^\]]+)\])$/, cp=/(\s*([>~* +,]|<<?)\s*|\[([^!\^$*~|=]+)([!\^$*~|]?=?)([^\]]*)\]|([#.:]?)([^#.:,\s +~<>\[^\(]+)(\(([^\)]+)\)|))/g, al=/alpha\(opacity=([\d\.]*)\)/gi, co=/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i, rr=/^#([\da-f])([\da-f])([\da-f])/, vf=function(v){return v.replace(/([.+*\[\]\(\)])/g, '\\$1');}, cn=(document.getElementsByClassName?function(s, b) { return b.getElementsByClassName(s); }:function(s, b) { return t.cf['.'](b.getElementsByTagName('*'), s); });
	// initialize RegExp: 
	/*
		DOM Selection:
		t([selector:String], [base:Node, optional], [zero methods:Boolean, optional]);
		selector: #id, .class, ...
	
		TODO: more Optimizations, 100% CSS3-compatible DOM Selection (maybe as a plugin)
		Should usually return an array of the selected DOM Nodes (if in the right mood),
		with some nice methods
	*/
	t=function(s, b, z) {
		if (s===u) { return; }
		// Initialize Values, init simple selector
		var s=s||[], b=b||document, I, n=[], e=u, E=u, S;
		// Do not rewrap a selection
		if (s instanceof t) { return s; }
		// This ought to be put inside the simple selectors...
		if (b.length) { t.i(b, function(i, S) { t.x(n, t(s, S, 1)); }, 1); }
		// Add methods to an array of nodes
		else if (s instanceof Array) { n=s; }
		// Add methods to a node
		else if (s.nodeName) { n=[s]; }
		// All (grand-)children (somewhat slow), Opera returns [0] if no elements are present, so we need to check
		else if (s==='*') { n=b.getElementsByTagName('*'); n=n.length?n:[]; }    
		// Do we have a rather simple selector (faster, based on native methods)?    
		else if (e=ss.exec(s)) {
			// No valid base for simple selector?
			if (!b) { n=[]; }
			// #id (if base is not document, check parents for being in base, otherwise we got an empty result)
			else if (e[1]==='#') { E=document.getElementById(e[2]); n=E&&(b===document||t.w(t.cf['<<']([E]), b)!==-1)?[E]:[]; }
			// .class
			else if (e[1]==='.') { n=cn(e[2], b); }
			// [name=...]
			else if (e[3]) { n=t.x(n, b.getElementsByName(e[3])); }
			// tagname
			else { n=t.x(n, b.getElementsByTagName(e[2])); }
		// otherwise use a complicated one
		} else {
			// initialize expression start and -Array.
			// we need to reset this RegExp twice to avoid errors in IE!        
			cp.lastIndex=0; cp.exec(s); e=RegExp.$2||'*'; E=e=e===' '?'*':e; S=[b]; cp.lastIndex=0;
			// next we need to parse each selector - here the magic happens
			// since we parse and execute at the same time, we get there pretty fast.
			s.replace(cp, function(f,y,j,k,l,m,o,p,z,q) {
				// Find out which values are important:
				// j=[ >~*+,<<?], o=[.:#], p=[Tag/Class/ID/pseudo], q=[pseudo arg], k=[attr key], m=[attr val]
				// Each subselector is run over the Selection Array, except '*',
				// which is saved for optimization later - here be dragons!
				// Multiple selections
				if (j===',') { if (e==='*') { S=t(e, S, 1); }; n=t.f(t.x([], n, S)); e=E; S=[b]; return; }
				// If our result is empty, we do not need to filter further
				if (!S.length) { return; }
				// Try for optimization: use simple selector, if possible, otherwise run last '*'
				if (e==='*') { if (ss.test(f)) { S=t(f, S, 1); e=f; return; } else { S=t.cf[e](S); } }
				// try to extract wisdom from the subselector
				var x=(j?(j===' '?'*':[j]):(p?(o===':'?[p, q]:[(o||''), p, q]):(k?[l||'=', k, m]:u)));
				// run complex filter
				if (x!==u&&x!=='*'&&t.cf[x[0]]) { S=t.cf[x[0]](S, x[1], x[2]); }
				// save last selector for optimizer
				e=x;
			});
			// get the last leftover '*' if necessary
			if (e==='*') { S=t(e, S, 1); }
			// put our selection into the main array
			n=t.x([], n, S);
		}
		n=t.f(t.f(n), function(_, x) { return x&&x.nodeName?x:u; }, true);
		// Extend Result Methods if zero methods not true
		return (z?n:(function() { z=new t(); t.i(n, function(i, x) { z[i]=x; }, true); z.length=n.length; return z; })());
	};
	// CSS Filter for query - an own object to be easily changeable
	t.cf={
		// Node, Class, ID
		'': function(n, i) { return t.f(n, function(_, x) { return x.nodeName.toLowerCase()===i?x:u; }, true); },
		'.': function(n, i) { var r=new RegExp('\\b'+i+'\\b'); return t.f(n, function(_, x) { return r.test(x.className)?x:u; }, true); },
		'#': function(n, i) { return t.f(n, function(_, x) { return x.id===i?x:u; }, true); },
		// Pseudoattributes
		'odd': function(n) { return t.f(n, function(i, x) { return i&1===1?u:x; }, true); },
		'even': function(n) { return t.f(n, function(i, x) { return i&1===1?x:u; }, true); },
		'empty': function(n) { return t.f(n, function(i, x) { return (!x||x.childNodes||[]).length?u:x; }, true); },
		'first-child': function(n) { return t.f(n, function(_, x) { var f=x.parentNode.firstChild; while (f&&f.nodeType!==1) {f=f.nextSibling;}; return x===f?x:u; }, true); },
		'last-child': function(n) { return t.f(n, function(_, x) { var l=x.parentNode.lastChild; while (l&&l.nodeType!==1) {l=l.previousSibling;}; return x===l?x:u; }, true); },
		'only-child': function(n) { return t.f(n, function(_, x) { return x.parentNode.getElementsByTagName('*').length===1?x:u; }, true); },
		'nth-child': function(n, i) { return t.f(n, function(_, x) { var I=0; while (x&&(x=x.previousSibling)) { if (x.nodeType===1) { I++; } }; return I===(i*1)?x:u; }, true); },
		'not': function(n, i) { return t.f(n, function(_, x) { return t.w(x, t.x([], t(i, document, true)))===-1?x:u; }, true); },
		'has': function(n, i) { return t.f(n, function(_, x) { return t(i, x, true).length?x:u; }, true); },
		'contains': function(n, i) { return t.f(n, function(_, x) { return x.innerHTML.replace(/<[\>]*>/g,'').indexOf(i)!==-1?x:u; }, true); },
		'lang': function(n, i) {return t.f(n, function(_, x) { return t('<<[lang|='+i+']', x, true).length?x:u; },true)},
		// Attributes
		'=': function(n, k, v) { return t.f(n, function(_, x) { var r=(t(x).a(k)); return r!==u&&r!==null&&r===(v||r)?x:u; }, true); },
		'!=': function(n, k, v) { return t.f(n, function(_, x) { var r=(t(x).a(k)); return (r!==u&&r!==null&&r!==v)?x:u; }, true); } ,
		'^=': function(n, k, v) { var r=new RegExp('^'+vf(v)); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, true); },
		'$=': function(n, k, v) { var r=new RegExp(vf(v)+'$'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, true); },
		'*=': function(n, k, v) { return t.f(n, function(_, x) { return (t(x).a(k)||'').indexOf(v)!==-1?x:u; }, true); },
		'~=': function(n, k, v) { var r=new RegExp('\\b'+vf(v)+'\\b'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, true); },
		'|=': function(n, k, v) { var r=new RegExp('^'+vf(v)+'($|\\-)'); return t.f(n, function(_, x) { return r.test(t(x).a(k))?x:u; }, true); },
		// Traversing
		'>': function(n) { var c=[]; t.i(n, function(_, x) { t.x(c, t.f(x.childNodes, function(_, z) { return z.nodeType===1?z:u; }, true)); }, true); return t.f(c); },
		'~': function(n) { var c=[]; t.i(n, function(_, x) { while (x=x.nextSibling) { if (x.nodeType===1) { c.push(x); } }}, true); return t.f(c); },
		'+': function(n) { var c=[]; t.i(n, function(_, x) { while (x&&(x=x.nextSibling)&&x.nodeType!==1); if (x) { c.push(x); } }, true); return t.f(c); },
		'*': function(n) { return t.f(t('*', n, false)); },
		// Irregular traversing: parent/parents
		'<': function(n) { return t.f(t.i(true, n, function(i, x) { this[i]=x.parentNode||u; }, true)); },
		'<<': function(n) { var c=[]; t.i(n, function(_, x) { var p=x; while((p=p.parentNode)&&p&&c.push(p)); }, true); return t.f(c); }
	};
	t.version='0.0.1';t.license='(c) 2010 Alex Kloss <alexthkloss@web.de>, LGPL2';
	// Prototypical Selector Result Methods - can be easily changed and extended
	t.prototype=t._={
		// Iterate
		i: function(c) { return t.i(this, c, true); },
		// Filter
		f: function(c) { return t(t.f(this, c, true)); },
		// get/set Attribute
		a: function(k, v) {
			if (v===u) {
				if (typeof k==='object') { var n=this; t.i(k, function(k, v) { n.a(k, v); }); return this; }
				var n=this[0]; return this.length?(this.nf[k]?this.nf[k][0](n):n[k]||null):u;
			}
			this.i(function(_, n) { this.nf[k]?this.nf[k][1](n, v):n[k]=v; }, true);
			return this;
		},
		// index -> node with index i in selection or index of node in selection or subselection
		g: function(i) { if (i===u||i===null) { return this; }; if (i.nodeName) { return t.w(i, this) }; if (typeof(i)==='string') { return t(i, this); }; return t(this[i]); },
		// html getter/setter
		h: function(h) { if (h===u) { return this.a('innerHTML'); }; this.a('innerHTML', h); return this; },
		// value getter/setter (value, all=parameterizer, e.g. t.p)
		v: function(v) { if (v===u) { return (this[0]||{}).value||''; }; if (typeof v==='function') { var r={}, x; this.i(function(i, n) { if (!/^(checkbox|radio|option)$/.test(n.type||'')||n.checked||n.selected) { x=t(n).v(); if (n.name&&x) { r[n.name]=(r[n.name]?r[n.name]+',':'')+x; } } }); return v(r); }; this.a('value', v);  return this; },
		// remove nodes
		r: function() { this.i(function(_, v) { if (v) { v.parentNode.removeChild(v); } }); },
		// get/set CSS Attributes, normalized
		c: function(k, v) {
			if (v===u) {
				if (typeof k==='object') { var n=this; t.i(k, function(k, v) { n.c(k, v); }); return this; }
				// get current style of first selected node, normalize rgb(...) to #rgb
				var n=this[0]; return this.length?this.nf.rgb2hex(this.nf[k]?this.nf[k][0](n):n.style[k]||window.getComputedStyle?(n.ownerDocument.defaultView.getComputedStyle(n,null)||{})[k]:(n.currentStyle||{})[k]||null):u;
			}
			this.i(function(_, n) { if (n.style) { if (this.nf[k]) { this.nf[k][1](n, v); } else { n.style[k]=v; } } }, true);
			return this;
		},
		// Common ()Attribute/CSS) Normalizer: parameter: [ getter, setter ]
		// rgb2hex normalization
		// Using feature detection for opacity and float CSS attributes
		nf: (function() {
				// Basic filters: rgb2hex, class, value (normalisation for select boxes)
				var f={
					'rgb2hex': function(r) { var z; return ((z=rr.exec(r))?['#',z[1],z[1],z[2],z[2],z[3],z[3]].join(''):(z=co.exec(r))?'#'+t.i([1,2,3],function(i, v){this[i]=('0'+(z[v]|0).toString(16)).substr(-2);}).join(''):r); },
					'class': [function(n) { return n.className; }, function (n, v) { n.className=v; }],
					'value': [function(n) { return n.options?n.options[n.selectedIndex]:n.value; }, function(n, v) { if (/select/i.test(n.nodeName)) { n.selectedIndex=t.w(v, t.i(true, n.options, function(i, o) { this[i]=o.value||o.innerHTML; }, true)); }; n.value=v; }]
				}, d=document.createElement('div'); d.style.display='none';
				d.innerHTML='<span class="color:red;float:left;opacity:0.5">x</span>';
				// Feature detection: float vs. stylefloat, opacity vs. alpha filter
				var s=d.getElementsByTagName('span')[0];
				if (s.style.opacity!=='0.5') { f.opacity=[function(n) { al.exec(t(n).c('filter')); return (parseFloat(RegExp.$1)/100); },function(n, v) { /* if you want to enforce hasLayout yourself, remove the following statement: */n.style.zoom=n.style.zoom||1;/**/ n.style.filter=(v>0&&v<1?'alpha(opacity='+(v*100)+')':n.style.filter.replace(al,'')+''); } ]; }
				if (s.style.styleFloat) { f['float']=[function(n) { return t(n).c('styleFloat'); }, function(n, v) { n.style.styleFloat=v; }] }
				return f;
			})(),
		// Events
		e: function(e, c, r) { return t.e(this, e, c, r); }
	};
	/*
		iterate
		t.i([object:Array|Object], [callback:Function, this=object, arguments=[key, value]], [array-Iteration]);
		returns the iterated object
	*/
	t.i=function(o, c, a, z) {
		// If not an Array or Object (which would both be object - or function, because Safari's node Collections are!),
		// we cannot iterate
		// first value===true -> run on a copy of the object
		if (o===true) { return t.i(t.x(z||c instanceof Array?[]:{},c), a, z); }
		// if we haven't got anything to iterate, return
		if (!o||!o.length&&!o.hasOwnProperty) { return o; }
		// Get length of an Array
		var l=o.length||0, a=a||o instanceof Array;
		// We use call to set this to the object we iterate over, thus we can manipulate it within the callback
		// Iterate Array over a counter
		if (a || !o.hasOwnProperty) { for (var i=0;i<l;i++) { c.call(o, i, o[i]); } }
		// Iterate Object over its Instances (hasOwnProperty to avoid the prototype)
		else { for (var k in o) { if (o.hasOwnProperty(k)) { c.call(o, k, o[k]); } } }
		// return iterated Object
		return o;
	};
	/*
		eXtend objects (Arrays will be concatenated), if an Object is used to extend an array, the keys will be omittedocument.
		t.x([object:Object], [object2:Object], [object3:Object, optional], ...);
	*/
	t.x=function() {
		// Preparation: base object, arguments iterator, object or array, internal function
		var b=arguments[0], o, i=0, y=b instanceof Array, a=(y?function(k, v) { b.push(v); }:function(k, v) { b[k]=v; });
		// return if nothing extendable present
		if (b.length!==u&&!b.hasOwnProperty) { return b; }
		// each argument is used as object to extend the first one; we use our iterator to save space
		while (o=arguments[++i]) { t.i(o, a, y); }
		return b;
	};
	/*
		filter objects/arrays
		t.f([object:Object|Array], [callback:function, this=object, arguments=key, value, optional: otherwise array-unique function], [parse as array:Boolean true, optional]);
		// returns filtered object
		if the callback returns undefined, the instance is filtered, otherwise the return value is taken
	*/
	t.f=function(o, c, y) {
		if (!o) { return o; }
		// find whether we have an array or an object and a callback function or comparative object
		var y=y||o instanceof Array;
		// if no callback or comparable object is defined, we predefine a unique function
		if (c===u) { y=true; var c=function(i, v) { var l=i; while (--l>=0) { if (this[l]===v) { return u; }}; return v; } }
		// Instanciate result Object/Array
		var r=(y ? [] : {});
		// Iterate over the original Object, if return value is not undefined, add instance to result
		t.i(o, function(k, v) { if ((c.call(o, k, v))!==u) {
			if (y) { r.push(v); } else { r[k]=v; }
		}}, y);
		return r;
	}
	/*
		where in the array is...?
		t.w([object], [array:Array]) // -> -1 if not found, 0-n if found.
	*/
	t.w=function(x, a) { 
		var l=a.length; 
		while (l>-1&&a[--l]!==x); 
		return l; 
	}
	/*
		parametrize
		t.p([object:Object], [middle:String, optional], [connector:String, optional], [prefix:String, optional], [suffix:String, optional], [filter1:Function, optional], [filter2:Function, optional]);
		// Defaults (without anything but "o" results in URL parameterisation
	*/
	t.p=function(o, m, c, p, s, f1, f2) {
		// instance => prefix+filtered key+middle+filtered value+suffix; instance + connector + instance => result
		var r=[];
		t.i(o, function(k, v) { r.push((p===u?'':p)+(f1||escape)(k)+(m===u?'=':m)+(f2||escape)(v)+(s===u?'':s)); });
		return r.join(c===u?'&':c);
	};
	/*
		basic yet powerful event system
		t.e([node(s):DOM Node|Array], [eventname:String, optional], [callback:Function, this=node, arguments=[event object], optional], [remove:Boolean=true, optional]);
		// even if no callback is given, the event array is returned
		// if no eventname is given, the whole event object is returned
	
		// Basic event handler
		t.e.h([event:Event Object, this=node])
		// To trigger an event object, use "t.e.h.call(node, event)"
	
		TODO: normalized events (mouseenter/leave)
	*/
	t.e=function(n, e, c, r) {
		// Handle Node Collections
		if (!n.nodeName && n.length) { return t.i(n, function(i, o) { t.e(o, e, c, r); }, true); }
		// Define Events Object, if not present
		if (!n.ev) { n.ev={}; }
		// return full object if event name is omitted
		if (e===u) { return n.ev; }
		// create Event array / handler if not present (and fill it with the current event)
		if (!n.ev[e]) { n.ev[e]=[]; if (typeof(n['on'+e])==='function') { n.ev[e].push(n['on'+e]); }; }
		if (n['on'+e]!==t.e.h) { n['on'+e]=t.e.h; }
		// add callback if present or delete if r is set
		if (c!==u) {
			if (r) { n.ev[e]=t.f(n.ev[e], function(_, x) { return c===x?u:x; }, true); }
			else { n.ev[e].push(c); }
		}
		return n.ev[e];
	}
	// Event Handler
	t.e.h = function(o) {
		// normalize event;
		var e=(o||window.event), D=document.documentElement, n=this;
		t.x(e, {key: (e.which||e.keyCode||e.charCode), ts: (new Date())*1, mouseX: (e.clientX||0)+(window.pageXOffset||D.scrollLeft||0), mouseY: (e.clientY||0)+(window.pageYOffset||D.scrollTop||0)});
		if (!e.target) { e.target=e.srcElement||document; }
		// iterate over event array
		t.i((n.ev||{})[e.type], function(i, c) { if (typeof c==='function') { c.call(n, e); }});
	};
	// very simple DOM Ready Event
	if (!document.readyState) {
		// Set readyState manually if neccessary
		var r=function() { document.readyState='complete'; };
		if (document.attachEvent) { document.attachEvent('onreadystatechange', r); }
		if (document.addEventListener) { document.addEventListener('DOMContentLoaded', r, false); }
		// use windowindow.onload as fallback
		t.e(window, 'load', r);
	}
	// Ready Event trigger
	ready=window.setInterval(function() {
		// if not ready, set timeout and return, otherwise call Event Handler
		if (document.body && document.readyState==='complete') {
			t.e.h.call(document, { cancelable: false, type: 'ready', target: document, view: window });
			window.clearInterval(ready);
		}
	}, 45);
	/*
		JS/JSONp: load additional JavaScript / loads informations via JSONp
		unnamed functions will be temporarily named; name will be deleted for security reasons after 1 s (past timeout)
		t.j([url:String], [callback:String(Function name), Function], [timeout,Integer(ms, optional)]);
	*/
	t.j=function(u,c,t){
		var f=typeof c==='function';
		// Name function if unnamed
		if (f) { window[(f='fn'+(Math.random()*1E8|0)+(new Date()*1))]=function(c){ return c; }(c); c=f; }
		// Create Script-Element with url and add it to body
		var s=document.createElement('script');
		s.type='text/javascript';
		s.src=u+(c||'');
		document.body.appendChild(s);
		// Timeout
		if (t) { window.setTimeout(function() { document.body.removeChild(s); }, t); }
		// Remove formerly unnamed function's name
		if (f) { window.setTimeout(function() { delete window[c]; }, (t||0)+5000); }
	};
	/*
		ajax:
		t.a({
			url:[url:String],
			method:[method:String,(GET|POST), optional],
			data:[postdata:String|Object, optional],
			type:[response Object:String(Text, Xml, ...), optional],
			async:[callback:Function, optional]
		});
	*/
	t.a=function(o) {
		// create XMLHttpRequest or leave
		var x=(window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"));
		if (!x) { return false; }
		// Open Request
		x.open(o.method||'GET', o.url, !!o.async, o.user, o.pass);
		// Send data
		x.send(o.data?(typeof o.data==='object'?t.p(o.data):o.data):null);
		// if not async, return result
		if (!o.async) { return o.type===true?x:x['response'+o.type||'Text']; }
		// if async, set result handler function
		x.onreadystatechange=function(e) { if (x.readyState===4) { o.async.call(x,x['response'+o.type||'Text']); } }
		// return Request object
		return x;
	};
	})();