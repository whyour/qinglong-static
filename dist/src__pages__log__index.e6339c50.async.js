"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[9818],{51290:function(We,Z,e){e.r(Z),e.d(Z,{default:function(){return ve}});var Q=e(94434),X=e.n(Q),Y=e(46686),s=e.n(Y),$=e(30279),N=e.n($),r=e(63313),k=e(6946),b=e(97325),w=e(80743),q=e(7691),_=e(74318),ee=e(74309),te=e(2991),ae=e(30315),D=e(44280),E=e(9408),ne=e(35563),re=e(30555),F=e(45362),g={"left-tree-container":"left-tree-container___zHanw","left-tree-scroller":"left-tree-scroller___PInUN","log-container":"log-container___ba9Tr"},le=e(56522),oe=e(90138),se=e(55261),ue=e(39449),ie=e(79610),ce=e(32699),a=e(11527),de=k.Z.Text;function P(C,v){var S=[];if(C){var i=[];return v.forEach(function(c){if(c.title.toLocaleLowerCase().includes(C))i.push(c);else{var y=[];(c.children||[]).forEach(function(x){x.title.toLocaleLowerCase().includes(C)&&y.push(x)}),y.length>0&&(i.push(N()(N()({},c),{},{children:y})),S.push(c.key))}}),{tree:i,expandedKeys:S}}return{tree:v,expandedKeys:S}}var fe=function(){var v=(0,se.bx)(),S=v.headerStyle,i=v.isPhone,c=v.theme,y=(0,r.useState)("\u8BF7\u9009\u62E9\u65E5\u5FD7\u6587\u4EF6"),x=s()(y,2),A=x[0],m=x[1],he=(0,r.useState)(""),B=s()(he,2),h=B[0],K=B[1],ge=(0,r.useState)([]),I=s()(ge,2),u=I[0],T=I[1],Se=(0,r.useState)([]),O=s()(Se,2),ye=O[0],p=O[1],xe=(0,r.useState)(!1),W=s()(xe,2),me=W[0],z=W[1],pe=(0,r.useState)(),H=s()(pe,2),Ce=H[0],je=H[1],j=(0,r.useRef)(),Ee=(0,r.useState)([]),M=s()(Ee,2),ze=M[0],Fe=M[1],Le=(0,r.useState)(),R=s()(Le,2),d=R[0],V=R[1],Ze=(0,r.useState)(""),G=s()(Ze,2),Ne=G[0],De=G[1],Pe=function(){z(!0),F.W.get("".concat(E.Z.apiPrefix,"logs")).then(function(t){var n=t.code,o=t.data;n===200&&(T(o),p(o))}).finally(function(){return z(!1)})},Ae=function(t){F.W.get("".concat(E.Z.apiPrefix,"logs/").concat(t.title,"?path=").concat(t.parent||"")).then(function(n){var o=n.code,f=n.data;o===200&&m(f)})},U=function(t,n){if(V(n),K(t),!(n.key===h||!t)){if(n.type==="directory"){m("\u8BF7\u9009\u62E9\u65E5\u5FD7\u6587\u4EF6");return}m("\u52A0\u8F7D\u4E2D..."),Ae(n)}},Be=(0,r.useCallback)(function(l,t){U(l[0],t.node)},[]),Ke=(0,r.useCallback)(function(l){var t=l.target.value;Ie(t)},[u,p]),Ie=(0,r.useCallback)((0,ce.debounce)(function(l){De(l);var t=P(l.toLocaleLowerCase(),u),n=t.tree,o=t.expandedKeys;p(n),Fe(o)},300),[u,p]),Te=function(){b.Z.confirm({title:"\u786E\u8BA4\u5220\u9664",content:(0,a.jsxs)(a.Fragment,{children:["\u786E\u8BA4\u5220\u9664",(0,a.jsx)(de,{style:{wordBreak:"break-all"},type:"warning",children:h}),"\u6587\u4EF6",d.type==="directory"?"\u5939\u4E0B\u6240\u4EE5\u65E5\u5FD7":"","\uFF0C\u5220\u9664\u540E\u4E0D\u53EF\u6062\u590D"]}),onOk:function(){F.W.delete("".concat(E.Z.apiPrefix,"logs"),{data:{filename:d.title,path:d.parent||"",type:d.type}}).then(function(n){var o=n.code;if(o===200){w.ZP.success("\u5220\u9664\u6210\u529F");var f=X()(u);if(d.parent)f=(0,ie.I1)(f,function(L){return L.key===d.key});else{var J=f.findIndex(function(L){return L.key===d.key});J!==-1&&f.splice(J,1)}T(f),Oe()}})},onCancel:function(){console.log("Cancel")}})},Oe=function(){K(""),V(null),m("\u8BF7\u9009\u62E9\u811A\u672C\u6587\u4EF6")};return(0,r.useEffect)(function(){var l=Ne||"",t=P(l.toLocaleLowerCase(),u),n=t.tree;p(n)},[u]),(0,r.useEffect)(function(){Pe(),j&&j.current&&je(j.current.clientHeight)},[]),(0,a.jsx)(ne.ZP,{className:"ql-container-wrapper log-wrapper",title:h,loading:me,extra:i?[(0,a.jsx)(q.Z,{className:"log-select",value:h,dropdownStyle:{maxHeight:400,overflow:"auto"},treeData:u,placeholder:"\u8BF7\u9009\u62E9\u65E5\u5FD7",fieldNames:{value:"key",label:"title"},showSearch:!0,onSelect:U})]:[(0,a.jsx)(_.Z,{title:"\u5220\u9664",children:(0,a.jsx)(ee.Z,{type:"primary",disabled:!h,onClick:Te,icon:(0,a.jsx)(ue.Z,{})})})],header:{style:S},children:(0,a.jsxs)("div",{className:"".concat(g["log-container"]," log-container"),children:[!i&&(0,a.jsxs)(oe.Z,{split:"vertical",size:200,maxSize:-100,children:[(0,a.jsx)("div",{className:g["left-tree-container"],children:u.length>0?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(te.Z.Search,{className:g["left-tree-search"],onChange:Ke,placeholder:"\u8BF7\u8F93\u5165\u65E5\u5FD7\u540D",allowClear:!0}),(0,a.jsx)("div",{className:g["left-tree-scroller"],ref:j,children:(0,a.jsx)(ae.Z,{expandAction:"click",className:g["left-tree"],treeData:ye,showIcon:!0,height:Ce,selectedKeys:[h],showLine:{showLeafIcon:!0},onSelect:Be})})]}):(0,a.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100%"},children:(0,a.jsx)(D.Z,{description:"\u6682\u65E0\u65E5\u5FD7",image:D.Z.PRESENTED_IMAGE_SIMPLE})})}),(0,a.jsx)(re.ZP,{language:"shell",theme:c,value:A,options:{readOnly:!0,fontSize:12,lineNumbersMinChars:3,fontFamily:"Source Code Pro",folding:!1,glyphMargin:!1,wordWrap:"on"}})]}),i&&(0,a.jsx)(le.fk,{value:A,options:{lineNumbers:!0,lineWrapping:!0,styleActiveLine:!0,matchBrackets:!0,readOnly:!0},onBeforeChange:function(t,n,o){m(o)},onChange:function(t,n,o){}})]})})},ve=fe}}]);