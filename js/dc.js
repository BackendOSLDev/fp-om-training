/* BCB Academy page runtime. Runs the same page templates as the approved mockup:
   <x-dc> template with {{path}} holes, <sc-if value>, <sc-for list as>, on* event holes and ref callbacks.
   A page defines `class Component extends DCLogic` with renderVals(); setState() re-renders and patches the page in place. */
(function(){
"use strict";
function DCLogic(props){ this.props = props || {}; this.state = {}; }
DCLogic.prototype.setState = function(o){ Object.assign(this.state, typeof o === "function" ? o(this.state) : o); if(this.__render) this.__render(); };
window.DCLogic = DCLogic;

var HOLE = /\{\{\s*([^}]*?)\s*\}\}/g, ONE = /^\{\{\s*([^}]*?)\s*\}\}$/;
function look(expr, vals, scopes){
  expr = String(expr).trim();
  if(expr === "true") return true; if(expr === "false") return false;
  var parts = expr.split("."), cur;
  for(var i = scopes.length - 1; i >= 0; i--){ if(Object.prototype.hasOwnProperty.call(scopes[i], parts[0])){ cur = scopes[i][parts[0]]; break; } }
  if(i < 0) cur = vals ? vals[parts[0]] : undefined;
  for(var j = 1; j < parts.length && cur != null; j++) cur = cur[parts[j]];
  return cur;
}
function str(v){ return v == null || v === false ? "" : String(v); }

/* build fresh DOM nodes from the template for the current values */
function build(tpl, vals, scopes, out){
  for(var n = tpl.firstChild; n; n = n.nextSibling){
    if(n.nodeType === 3){ var t = n.nodeValue; out.appendChild(document.createTextNode(t.indexOf("{{") < 0 ? t : t.replace(HOLE, function(_, e){ return str(look(e, vals, scopes)); }))); continue; }
    if(n.nodeType !== 1) continue;
    var tag = n.tagName.toLowerCase();
    var sc = tag === "template" ? n.getAttribute("data-sc") : null;
    if(sc === "if"){ var m = ONE.exec(n.getAttribute("value") || ""); if(m && look(m[1], vals, scopes)) build(n.content, vals, scopes, out); continue; }
    if(sc === "for"){
      var lm = ONE.exec(n.getAttribute("list") || ""), as = n.getAttribute("as") || "item", list = lm ? look(lm[1], vals, scopes) : null;
      (Array.isArray(list) ? list : []).forEach(function(item, idx){ var o = {}; o[as] = item; o[as + "Index"] = idx; build(n.content, vals, scopes.concat([o]), out); });
      continue;
    }
    var el = n.namespaceURI && n.namespaceURI !== "http://www.w3.org/1999/xhtml" ? document.createElementNS(n.namespaceURI, n.localName) : document.createElement(n.tagName);
    for(var k = 0; k < n.attributes.length; k++){
      var a = n.attributes[k], name = a.name, val = a.value;
      if(name.indexOf("hint-") === 0) continue;
      var one = ONE.exec(val);
      if(/^on[a-z]+$/i.test(name)){ if(one){ var fn = look(one[1], vals, scopes); if(typeof fn === "function"){ (el.__dcH = el.__dcH || {})[name.slice(2).toLowerCase()] = fn; } } continue; }
      if(name === "ref"){ if(one){ var rf = look(one[1], vals, scopes); if(typeof rf === "function") el.__dcRef = rf; } continue; }
      if(one){ var v = look(one[1], vals, scopes);
        if(v === false || v == null){ if(name === "value") el.__dcVal = ""; continue; }
        if(v === true){ el.setAttribute(name, ""); continue; }
        if(name === "value") el.__dcVal = String(v);
        el.setAttribute(name, String(v)); continue; }
      el.setAttribute(name, val.indexOf("{{") < 0 ? val : val.replace(HOLE, function(_, e){ return str(look(e, vals, scopes)); }));
    }
    if(tag === "template") el.innerHTML = n.innerHTML; else build(n.content || n, vals, scopes, el);
    if("__dcVal" in el && (tag === "textarea" || tag === "input" || tag === "select")) el.value = el.__dcVal;
    out.appendChild(el);
  }
  return out;
}

/* events: one listener per type per element; the handler lives on el.__dcH so re-renders just swap it */
var TYPES = {};
function bindTypes(el){ if(!el.__dcH) return; Object.keys(el.__dcH).forEach(function(t){ if(!TYPES[t]){ TYPES[t] = 1; document.addEventListener(t, dispatch, t === "focus" || t === "blur"); } }); }
function dispatch(ev){
  for(var el = ev.target; el && el !== document; el = el.parentNode){
    var h = el.__dcH && el.__dcH[ev.type];
    if(h){
      var r = h(ev);
      /* a handler may return a URL to open instead of the link's own href */
      if(typeof r === "string" && r){ ev.preventDefault(); location.href = r; }
      if(ev.defaultPrevented || ev.type !== "click") return;
      return;
    }
  }
}
function walkNew(el, fn){ if(el.nodeType !== 1) return; fn(el); for(var c = el.firstChild; c; c = c.nextSibling) walkNew(c, fn); }
function fresh(el){ walkNew(el, function(x){ bindTypes(x); }); }
function refs(el){ walkNew(el, function(x){ if(x.__dcRef){ var f = x.__dcRef; x.__dcRefDone = 1; try{ f(x); }catch(e){ console.error(e); } } }); }

/* patch the live DOM (a) to look like the freshly built nodes (b), keeping focus, typed values and ref'd hosts */
function morph(a, b){
  var ac = a.firstChild, bc = b.firstChild, added = [];
  while(bc){
    var nb = bc.nextSibling;
    if(ac && ac.nodeType === bc.nodeType && (ac.nodeType !== 1 || (ac.tagName === bc.tagName && !!ac.__dcRefDone === !!bc.__dcRef))){
      if(ac.nodeType === 3){ if(ac.nodeValue !== bc.nodeValue) ac.nodeValue = bc.nodeValue; }
      else if(ac.nodeType === 1){
        syncAttrs(ac, bc);
        ac.__dcH = bc.__dcH; bindTypes(ac);
        if(!ac.__dcRefDone) morph(ac, bc);   /* a ref'd host owns its own children (practice, sandbox) */
      }
      ac = ac.nextSibling;
    } else {
      a.insertBefore(bc, ac); fresh(bc); added.push(bc);
    }
    bc = nb;
  }
  while(ac){ var nx = ac.nextSibling; a.removeChild(ac); ac = nx; }
  added.forEach(refs);
}
function syncAttrs(a, b){
  var i, n;
  for(i = a.attributes.length - 1; i >= 0; i--){ n = a.attributes[i].name; if(!b.hasAttribute(n)) a.removeAttribute(n); }
  for(i = 0; i < b.attributes.length; i++){ n = b.attributes[i]; if(a.getAttribute(n.name) !== n.value) a.setAttribute(n.name, n.value); }
  if("__dcVal" in b && document.activeElement !== a && a.value !== b.__dcVal) a.value = b.__dcVal;
  if(a.tagName === "INPUT" && (a.type === "checkbox" || a.type === "radio")) a.checked = b.hasAttribute("checked");
}

window.DC = {
  /* root: element to render into. tplText: the page template as raw text (shipped in a <script type="text/x-dc-template">). */
  mount: function(root, tplText, Component, props){
    var tpl = document.createElement("template");
    /* loop and if tags become <template> so the browser keeps them inside tables */
    tpl.innerHTML = tplText.replace(/<sc-(if|for)\b/g, '<template data-sc="$1"').replace(/<\/sc-(if|for)>/g, "</template>");
    var host = document.createElement("div"); host.className = "dc-root"; root.appendChild(host);
    var c = new Component(props || {}), queued = false, first = true;
    function render(){
      queued = false;
      var vals; try{ vals = c.renderVals(); }catch(e){ console.error(e); return; }
      var frag = build(tpl.content, vals, [], document.createDocumentFragment()), wrap = document.createElement("div"); wrap.appendChild(frag);
      if(first){ while(wrap.firstChild){ var x = wrap.firstChild; host.appendChild(x); fresh(x); refs(x); } first = false; }
      else morph(host, wrap);
    }
    c.__render = function(){ if(!queued){ queued = true; Promise.resolve().then(render); } };
    render();
    if(typeof c.componentDidMount === "function") try{ c.componentDidMount(); }catch(e){ console.error(e); }
    window.__dcPage = c;
    return c;
  }
};
})();
