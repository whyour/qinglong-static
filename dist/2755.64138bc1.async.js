"use strict";var Ft=Object.defineProperty,Wt=Object.defineProperties;var Ht=Object.getOwnPropertyDescriptors;var Ee=Object.getOwnPropertySymbols;var Bt=Object.prototype.hasOwnProperty,Kt=Object.prototype.propertyIsEnumerable;var Se=(S,M,m)=>M in S?Ft(S,M,{enumerable:!0,configurable:!0,writable:!0,value:m}):S[M]=m,A=(S,M)=>{for(var m in M||(M={}))Bt.call(M,m)&&Se(S,m,M[m]);if(Ee)for(var m of Ee(M))Kt.call(M,m)&&Se(S,m,M[m]);return S},Re=(S,M)=>Wt(S,Ht(M));(self.webpackChunk=self.webpackChunk||[]).push([[2755],{82755:function(S,M,m){m.d(M,{SV:function(){return kt},ZP:function(){return zt},_m:function(){return Z}});function Ce(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ae(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function ce(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?ae(Object(r),!0).forEach(function(n){Ce(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ae(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function Pe(e,t){if(e==null)return{};var r={},n=Object.keys(e),i,a;for(a=0;a<n.length;a++)i=n[a],!(t.indexOf(i)>=0)&&(r[i]=e[i]);return r}function Te(e,t){if(e==null)return{};var r=Pe(e,t),n,i;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],!(t.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}function Ie(e,t){return _e(e)||Ae(e,t)||De(e,t)||ke()}function _e(e){if(Array.isArray(e))return e}function Ae(e,t){if(!(typeof Symbol=="undefined"||!(Symbol.iterator in Object(e)))){var r=[],n=!0,i=!1,a=void 0;try{for(var u=e[Symbol.iterator](),h;!(n=(h=u.next()).done)&&(r.push(h.value),!(t&&r.length===t));n=!0);}catch(p){i=!0,a=p}finally{try{!n&&u.return!=null&&u.return()}finally{if(i)throw a}}return r}}function De(e,t){if(e){if(typeof e=="string")return ue(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return ue(e,t)}}function ue(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function ke(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ne(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function se(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function le(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?se(Object(r),!0).forEach(function(n){Ne(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):se(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function xe(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(n){return t.reduceRight(function(i,a){return a(i)},n)}}function D(e){return function t(){for(var r=this,n=arguments.length,i=new Array(n),a=0;a<n;a++)i[a]=arguments[a];return i.length>=e.length?e.apply(this,i):function(){for(var u=arguments.length,h=new Array(u),p=0;p<u;p++)h[p]=arguments[p];return t.apply(r,[].concat(i,h))}}}function z(e){return{}.toString.call(e).includes("Object")}function Ue(e){return!Object.keys(e).length}function k(e){return typeof e=="function"}function Le(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function qe(e,t){return z(t)||C("changeType"),Object.keys(t).some(function(r){return!Le(e,r)})&&C("changeField"),t}function ze(e){k(e)||C("selectorType")}function Ve(e){k(e)||z(e)||C("handlerType"),z(e)&&Object.values(e).some(function(t){return!k(t)})&&C("handlersType")}function Fe(e){e||C("initialIsRequired"),z(e)||C("initialType"),Ue(e)&&C("initialContent")}function We(e,t){throw new Error(e[t]||e.default)}var He={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},C=D(We)(He),V={changes:qe,selector:ze,handler:Ve,initial:Fe};function Be(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};V.initial(e),V.handler(t);var r={current:e},n=D(Ye)(r,t),i=D(Ge)(r),a=D(V.changes)(e),u=D(Ke)(r);function h(){var O=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(I){return I};return V.selector(O),O(r.current)}function p(O){xe(n,i,a,u)(O)}return[h,p]}function Ke(e,t){return k(t)?t(e.current):t}function Ge(e,t){return e.current=le(le({},e.current),t),t}function Ye(e,t,r){return k(t)?t(e.current):Object.keys(r).forEach(function(n){var i;return(i=t[n])===null||i===void 0?void 0:i.call(t,e.current[n])}),r}var Ze={create:Be},fe=Ze,Je={paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/min/vs"}},Qe=Je;function Xe(e){return function t(){for(var r=this,n=arguments.length,i=new Array(n),a=0;a<n;a++)i[a]=arguments[a];return i.length>=e.length?e.apply(this,i):function(){for(var u=arguments.length,h=new Array(u),p=0;p<u;p++)h[p]=arguments[p];return t.apply(r,[].concat(i,h))}}}var $e=Xe;function et(e){return{}.toString.call(e).includes("Object")}var tt=et;function rt(e){return e||pe("configIsRequired"),tt(e)||pe("configType"),e.urls?(nt(),{paths:{vs:e.urls.monacoBase}}):e}function nt(){console.warn(de.deprecation)}function ot(e,t){throw new Error(e[t]||e.default)}var de={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:`Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `},pe=$e(ot)(de),it={config:rt},at=it,ct=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return function(i){return r.reduceRight(function(a,u){return u(a)},i)}},ut=ct;function ge(e,t){return Object.keys(t).forEach(function(r){t[r]instanceof Object&&e[r]&&Object.assign(t[r],ge(e[r],t[r]))}),ce(ce({},e),t)}var st=ge,lt={type:"cancelation",msg:"operation is manually canceled"};function ft(e){var t=!1,r=new Promise(function(n,i){e.then(function(a){return t?i(lt):n(a)}),e.catch(i)});return r.cancel=function(){return t=!0},r}var G=ft,dt=fe.create({config:Qe,isInitialized:!1,resolve:null,reject:null,monaco:null}),ve=Ie(dt,2),N=ve[0],F=ve[1];function pt(e){var t=at.config(e),r=t.monaco,n=Te(t,["monaco"]);F(function(i){return{config:st(i.config,n),monaco:r}})}function gt(){var e=N(function(t){var r=t.monaco,n=t.isInitialized,i=t.resolve;return{monaco:r,isInitialized:n,resolve:i}});if(!e.isInitialized){if(F({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),G(Y);if(window.monaco&&window.monaco.editor)return me(window.monaco),e.resolve(window.monaco),G(Y);ut(vt,ht)(bt)}return G(Y)}function vt(e){return document.body.appendChild(e)}function mt(e){var t=document.createElement("script");return e&&(t.src=e),t}function ht(e){var t=N(function(n){var i=n.config,a=n.reject;return{config:i,reject:a}}),r=mt("".concat(t.config.paths.vs,"/loader.js"));return r.onload=function(){return e()},r.onerror=t.reject,r}function bt(){var e=N(function(r){var n=r.config,i=r.resolve,a=r.reject;return{config:n,resolve:i,reject:a}}),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],function(r){me(r),e.resolve(r)},function(r){e.reject(r)})}function me(e){N().monaco||F({monaco:e})}function yt(){return N(function(e){var t=e.monaco;return t})}var Y=new Promise(function(e,t){return F({resolve:e,reject:t})}),Mt={config:pt,init:gt,__getMonacoInstance:yt},Z=Mt,c=m(63313),T=m.n(c),Ot=m(40507),o=m.n(Ot);const wt={display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"};function jt({content:e}){return T().createElement("div",{style:wt},e)}var Et=jt,J={wrapper:{display:"flex",position:"relative",textAlign:"initial"},fullWidth:{width:"100%"},hide:{display:"none"}};function he({width:e,height:t,isEditorReady:r,loading:n,_ref:i,className:a,wrapperClassName:u}){return T().createElement("section",{style:Re(A({},J.wrapper),{width:e,height:t}),className:u},!r&&T().createElement(Et,{content:n}),T().createElement("div",{ref:i,style:A(A({},J.fullWidth),!r&&J.hide),className:a}))}he.propTypes={width:o().oneOfType([o().number,o().string]).isRequired,height:o().oneOfType([o().number,o().string]).isRequired,loading:o().oneOfType([o().element,o().string]).isRequired,isEditorReady:o().bool.isRequired,className:o().string,wrapperClassName:o().string};var St=he,Rt=(0,c.memo)(St),be=Rt;function Ct(e){(0,c.useEffect)(e,[])}var ye=Ct;function Pt(e,t,r=!0){const n=(0,c.useRef)(!0);(0,c.useEffect)(n.current||!r?()=>{n.current=!1}:e,t)}var E=Pt;function x(){}function Me(e,t,r,n){return Tt(e,n)||It(e,t,r,n)}function Tt(e,t){return e.editor.getModel(Oe(e,t))}function It(e,t,r,n){return e.editor.createModel(t,r,n&&Oe(e,n))}function Oe(e,t){return e.Uri.parse(t)}function _t(e){return e===void 0}function Q({original:e,modified:t,language:r,originalLanguage:n,modifiedLanguage:i,originalModelPath:a,modifiedModelPath:u,keepCurrentOriginalModel:h,keepCurrentModifiedModel:p,theme:O,loading:I,options:R,height:$,width:ee,className:te,wrapperClassName:re,beforeMount:ne,onMount:oe}){const[w,U]=(0,c.useState)(!1),[P,g]=(0,c.useState)(!0),j=(0,c.useRef)(null),b=(0,c.useRef)(null),H=(0,c.useRef)(null),y=(0,c.useRef)(oe),s=(0,c.useRef)(ne);ye(()=>{const l=Z.init();return l.then(v=>(b.current=v)&&g(!1)).catch(v=>(v==null?void 0:v.type)!=="cancelation"&&console.error("Monaco initialization: error:",v)),()=>j.current?ie():l.cancel()}),E(()=>{const l=j.current.getModifiedEditor();l.getOption(b.current.editor.EditorOption.readOnly)?l.setValue(t):t!==l.getValue()&&(l.executeEdits("",[{range:l.getModel().getFullModelRange(),text:t,forceMoveMarkers:!0}]),l.pushUndoStop())},[t],w),E(()=>{j.current.getModel().original.setValue(e)},[e],w),E(()=>{const{original:l,modified:v}=j.current.getModel();b.current.editor.setModelLanguage(l,n||r),b.current.editor.setModelLanguage(v,i||r)},[r,n,i],w),E(()=>{b.current.editor.setTheme(O)},[O],w),E(()=>{j.current.updateOptions(R)},[R],w);const L=(0,c.useCallback)(()=>{s.current(b.current);const l=b.current.editor.createModel(e,n||r,a&&b.current.Uri.parse(a)),v=b.current.editor.createModel(t,i||r,u&&b.current.Uri.parse(u));j.current.setModel({original:l,modified:v})},[r,t,i,e,n,a,u]),B=(0,c.useCallback)(()=>{j.current=b.current.editor.createDiffEditor(H.current,A({automaticLayout:!0},R)),L(),b.current.editor.setTheme(O),U(!0)},[R,O,L]);(0,c.useEffect)(()=>{w&&y.current(j.current,b.current)},[w]),(0,c.useEffect)(()=>{!P&&!w&&B()},[P,w,B]);function ie(){const l=j.current.getModel();if(!h){var v;(v=l.original)===null||v===void 0||v.dispose()}if(!p){var q;(q=l.modified)===null||q===void 0||q.dispose()}j.current.dispose()}return T().createElement(be,{width:ee,height:$,isEditorReady:w,loading:I,_ref:H,className:te,wrapperClassName:re})}Q.propTypes={original:o().string,modified:o().string,language:o().string,originalLanguage:o().string,modifiedLanguage:o().string,originalModelPath:o().string,modifiedModelPath:o().string,keepCurrentOriginalModel:o().bool,keepCurrentModifiedModel:o().bool,theme:o().string,loading:o().oneOfType([o().element,o().string]),options:o().object,width:o().oneOfType([o().number,o().string]),height:o().oneOfType([o().number,o().string]),className:o().string,wrapperClassName:o().string,beforeMount:o().func,onMount:o().func},Q.defaultProps={theme:"light",loading:"Loading...",options:{},keepCurrentOriginalModel:!1,keepCurrentModifiedModel:!1,width:"100%",height:"100%",beforeMount:x,onMount:x};var At=Q,Dt=(0,c.memo)(At),kt=Dt;function Yt(){const[e,t]=useState(loader.__getMonacoInstance());return useMount(()=>{let r;return e||(r=loader.init(),r.then(n=>{t(n)})),()=>{var n;return(n=r)===null||n===void 0?void 0:n.cancel()}}),e}var Zt=null;function Nt(e){const t=(0,c.useRef)();return(0,c.useEffect)(()=>{t.current=e},[e]),t.current}var xt=Nt;const[we,Ut]=fe.create({backup:null}),W=new Map;function X({defaultValue:e,defaultLanguage:t,defaultPath:r,value:n,language:i,path:a,theme:u,line:h,loading:p,options:O,overrideServices:I,saveViewState:R,keepCurrentModel:$,width:ee,height:te,className:re,wrapperClassName:ne,beforeMount:oe,onMount:w,onChange:U,onValidate:P}){const[g,j]=(0,c.useState)(!1),[b,H]=(0,c.useState)(!0),y=(0,c.useRef)(null),s=(0,c.useRef)(null),L=(0,c.useRef)(null),B=(0,c.useRef)(w),ie=(0,c.useRef)(oe),l=(0,c.useRef)(null),v=(0,c.useRef)(n),q=xt(a);ye(()=>{const f=Z.init();return f.then(d=>(y.current=d)&&H(!1)).catch(d=>(d==null?void 0:d.type)!=="cancelation"&&console.error("Monaco initialization: error:",d)),()=>s.current?Vt():f.cancel()}),E(()=>{const f=Me(y.current,e||n,t||i,a);f!==s.current.getModel()&&(R&&W.set(q,s.current.saveViewState()),s.current.setModel(f),R&&s.current.restoreViewState(W.get(a)))},[a],g),E(()=>{s.current.updateOptions(O)},[O],g),E(()=>{s.current.getOption(y.current.editor.EditorOption.readOnly)?s.current.setValue(n):n!==s.current.getValue()&&(s.current.executeEdits("",[{range:s.current.getModel().getFullModelRange(),text:n,forceMoveMarkers:!0}]),s.current.pushUndoStop())},[n],g),E(()=>{y.current.editor.setModelLanguage(s.current.getModel(),i)},[i],g),E(()=>{_t(h)||s.current.revealLine(h)},[h],g),E(()=>{y.current.editor.setTheme(u)},[u],g);const je=(0,c.useCallback)(()=>{ie.current(y.current);const f=a||r,d=Me(y.current,n||e,t||i,f);s.current=y.current.editor.create(L.current,A({model:d,automaticLayout:!0},O),I),R&&s.current.restoreViewState(W.get(f)),y.current.editor.setTheme(u),we().backup||Ut({backup:y.current.editor.setModelMarkers}),j(!0)},[e,t,r,n,i,a,O,I,R,u]);(0,c.useEffect)(()=>{g&&B.current(s.current,y.current)},[g]),(0,c.useEffect)(()=>{!b&&!g&&je()},[b,g,je]),v.current=n,(0,c.useEffect)(()=>{if(g&&U){var f,d;(f=l.current)===null||f===void 0||f.dispose(),l.current=(d=s.current)===null||d===void 0?void 0:d.onDidChangeModelContent(K=>{const _=s.current.getValue();v.current!==_&&U(_,K)})}},[g,U]),(0,c.useEffect)(()=>{g&&(y.current.editor.setModelMarkers=function(f,d,K){var _;(_=we().backup)===null||_===void 0||_.call(y.current.editor,f,d,K),P==null||P(K)})},[g,P]);function Vt(){var f;if((f=l.current)===null||f===void 0||f.dispose(),$)R&&W.set(a,s.current.saveViewState());else{var d;(d=s.current.getModel())===null||d===void 0||d.dispose()}s.current.dispose()}return T().createElement(be,{width:ee,height:te,isEditorReady:g,loading:p,_ref:L,className:re,wrapperClassName:ne})}X.propTypes={defaultValue:o().string,defaultPath:o().string,defaultLanguage:o().string,value:o().string,language:o().string,path:o().string,theme:o().string,line:o().number,loading:o().oneOfType([o().element,o().string]),options:o().object,overrideServices:o().object,saveViewState:o().bool,keepCurrentModel:o().bool,width:o().oneOfType([o().number,o().string]),height:o().oneOfType([o().number,o().string]),className:o().string,wrapperClassName:o().string,beforeMount:o().func,onMount:o().func,onChange:o().func,onValidate:o().func},X.defaultProps={theme:"light",loading:"Loading...",options:{},overrideServices:{},saveViewState:!0,keepCurrentModel:!1,width:"100%",height:"100%",beforeMount:x,onMount:x,onValidate:x};var Lt=X,qt=(0,c.memo)(Lt),zt=qt}}]);