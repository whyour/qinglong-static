"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8247],{2679:function(ce,D,e){e.d(D,{Z:function(){return M}});var A=e(79105),E=e(63313),Z={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372 0-89 31.3-170.8 83.5-234.8l523.3 523.3C682.8 852.7 601 884 512 884zm288.5-137.2L277.2 223.5C341.2 171.3 423 140 512 140c205.4 0 372 166.6 372 372 0 89-31.3 170.8-83.5 234.8z"}}]},name:"stop",theme:"outlined"},T=Z,S=e(17980),v=function(p,i){return E.createElement(S.Z,(0,A.Z)((0,A.Z)({},p),{},{ref:i,icon:T}))};v.displayName="StopOutlined";var M=E.forwardRef(v)},84201:function(ce,D,e){var A=e(46686),E=e.n(A),Z=e(63313),T=e.n(Z),S=e(61761),v=e(89993);D.Z=function(M,_){var p=(0,Z.useState)(),i=E()(p,2),O=i[0],k=i[1];return(0,S.Z)(M,function(s){var P=s.target;P.classList.contains("ant-table-wrapper")||(P=s.target.querySelector(".ant-table-wrapper")),k((0,v.W9)({extraHeight:_,target:P}))}),O}},51281:function(ce,D,e){e.r(D);var A=e(35290),E=e.n(A),Z=e(411),T=e.n(Z),S=e(46686),v=e.n(S),M=e(63313),_=e.n(M),p=e(78455),i=e(80743),O=e(97325),k=e(2991),s=e(76385),P=e(7619),R=e(11527),U=function(d){var L=d.ids,K=d.handleCancel,N=d.visible,c=p.Z.useForm(),w=v()(c,1),$=w[0],oe=(0,M.useState)(!1),q=v()(oe,2),H=q[0],J=q[1],y=function(){var Q=T()(E()().mark(function m(ee){var I,j,B;return E()().wrap(function(g){for(;;)switch(g.prev=g.next){case 0:return J(!0),g.prev=1,g.next=4,s.W.put("".concat(P.Z.apiPrefix,"envs/name"),{data:{ids:L,name:ee.name}});case 4:I=g.sent,j=I.code,B=I.data,j===200&&(i.ZP.success("\u66F4\u65B0\u73AF\u5883\u53D8\u91CF\u540D\u79F0\u6210\u529F"),K()),J(!1),g.next=14;break;case 11:g.prev=11,g.t0=g.catch(1),J(!1);case 14:case"end":return g.stop()}},m,null,[[1,11]])}));return function(ee){return Q.apply(this,arguments)}}();return(0,M.useEffect)(function(){$.resetFields()},[L,N]),(0,R.jsx)(O.Z,{title:"\u4FEE\u6539\u73AF\u5883\u53D8\u91CF\u540D\u79F0",open:N,forceRender:!0,centered:!0,maskClosable:!1,onOk:function(){$.validateFields().then(function(m){y(m)}).catch(function(m){console.log("Validate Failed:",m)})},onCancel:function(){return K()},confirmLoading:H,children:(0,R.jsx)(p.Z,{form:$,layout:"vertical",name:"edit_name_modal",children:(0,R.jsx)(p.Z.Item,{name:"name",rules:[{required:!0,message:"\u8BF7\u8F93\u5165\u65B0\u7684\u73AF\u5883\u53D8\u91CF\u540D\u79F0"}],children:(0,R.jsx)(k.Z,{placeholder:"\u8BF7\u8F93\u5165\u65B0\u7684\u73AF\u5883\u53D8\u91CF\u540D\u79F0"})})})})};D.default=U},48482:function(ce,D,e){e.r(D),e.d(D,{default:function(){return Ge}});var A=e(35290),E=e.n(A),Z=e(411),T=e.n(Z),S=e(94434),v=e.n(S),M=e(30279),_=e.n(M),p=e(46686),i=e.n(p),O=e(44463),k=e.n(O),s=e(63313),P=e(6946),R=e(2991),U=e(74318),le=e(26591),d=e(34541),L=e(97325),K=e(80743),N=e(77588),c=e(74309),w=e(46669),$=e(26099),oe=e(96320),q=e(2679),H=e(39449),J=e(2455),y=e(7619),Q=e(38418),m=e(76385),ee=e(47805),I=e(51281),j=e(40034),B=e(97920),X=e(21158),g=e(66255),ue=e(89993),se=e(63335),me=e(84201),a=e(11527),ve=["index","moveRow","className","style"],ne=P.Z.Text,_e=P.Z.Paragraph,fe=R.Z.Search,C;(function(u){u[u.\u5DF2\u542F\u7528=0]="\u5DF2\u542F\u7528",u[u.\u5DF2\u7981\u7528=1]="\u5DF2\u7981\u7528"})(C||(C={}));var h;(function(u){u[u.success=0]="success",u[u.error=1]="error"})(h||(h={}));var ae;(function(u){u[u.\u542F\u7528=0]="\u542F\u7528",u[u.\u7981\u7528=1]="\u7981\u7528"})(ae||(ae={}));var Pe;(function(u){u[u.enable=0]="enable",u[u.disable=1]="disable"})(Pe||(Pe={}));var Re="DragableBodyRow",ze=function(W){var te=W.index,ye=W.moveRow,Be=W.className,Me=W.style,je=k()(W,ve),ie=(0,s.useRef)(),x=(0,j.L)({accept:Re,collect:function(V){var De=V.getItem()||{},Oe=De.index;return Oe===te?{}:{isOver:V.isOver(),dropClassName:Oe<te?" drop-over-downward":" drop-over-upward"}},drop:function(V){ye(V.index,te)}}),z=i()(x,2),ge=z[0],he=ge.isOver,Ee=ge.dropClassName,pe=z[1],xe=(0,B.c)({type:Re,item:{index:te},collect:function(V){return{isDragging:V.isDragging()}}}),Ce=i()(xe,2),Fe=Ce[1];return pe(Fe(ie)),(0,a.jsx)("tr",_()({ref:ie,className:"".concat(Be).concat(he?Ee:""),style:_()({cursor:"move"},Me)},je))},Ve=function(){var W=(0,se.bx)(),te=W.headerStyle,ye=W.isPhone,Be=W.theme,Me=[{title:"\u5E8F\u53F7",align:"center",width:60,render:function(n,t,l){return(0,a.jsxs)("span",{style:{cursor:"text"},children:[l+1," "]})}},{title:"\u540D\u79F0",dataIndex:"name",key:"name",align:"center",sorter:function(n,t){return n.name.localeCompare(t.name)}},{title:"\u503C",dataIndex:"value",key:"value",align:"center",width:"35%",render:function(n,t){return(0,a.jsx)(_e,{style:{wordBreak:"break-all",marginBottom:0,textAlign:"left"},ellipsis:{tooltip:n,rows:2},copyable:!0,children:n})}},{title:"\u5907\u6CE8",dataIndex:"remarks",key:"remarks",align:"center"},{title:"\u66F4\u65B0\u65F6\u95F4",dataIndex:"timestamp",key:"timestamp",align:"center",width:165,ellipsis:{showTitle:!1},sorter:{compare:function(n,t){var l=new Date(n.updatedAt||n.timestamp).getTime(),o=new Date(t.updatedAt||t.timestamp).getTime();return l-o}},render:function(n,t){var l=navigator.language||navigator.languages[0],o=t.updatedAt||t.timestamp,f=new Date(o).toLocaleString(l,{hour12:!1}).replace(" 24:"," 00:");return(0,a.jsx)(U.Z,{placement:"topLeft",title:f,trigger:["hover","click"],children:(0,a.jsx)("span",{children:f})})}},{title:"\u72B6\u6001",key:"status",dataIndex:"status",align:"center",width:70,filters:[{text:"\u5DF2\u542F\u7528",value:0},{text:"\u5DF2\u7981\u7528",value:1}],onFilter:function(n,t){return t.status===n},render:function(n,t,l){return(0,a.jsx)(le.Z,{size:"middle",style:{cursor:"text"},children:(0,a.jsx)(d.Z,{color:h[t.status],style:{marginRight:0},children:C[t.status]})})}},{title:"\u64CD\u4F5C",key:"action",width:120,align:"center",render:function(n,t,l){var o=!ye;return(0,a.jsxs)(le.Z,{size:"middle",children:[(0,a.jsx)(U.Z,{title:o?"\u7F16\u8F91":"",children:(0,a.jsx)("a",{onClick:function(){return an(t,l)},children:(0,a.jsx)($.Z,{})})}),(0,a.jsx)(U.Z,{title:o?t.status===C.\u5DF2\u7981\u7528?"\u542F\u7528":"\u7981\u7528":"",children:(0,a.jsx)("a",{onClick:function(){return en(t,l)},children:t.status===C.\u5DF2\u7981\u7528?(0,a.jsx)(oe.Z,{}):(0,a.jsx)(q.Z,{})})}),(0,a.jsx)(U.Z,{title:o?"\u5220\u9664":"",children:(0,a.jsx)("a",{onClick:function(){return tn(t,l)},children:(0,a.jsx)(H.Z,{})})})]})}}],je=(0,s.useState)([]),ie=i()(je,2),x=ie[0],z=ie[1],ge=(0,s.useState)(!0),he=i()(ge,2),Ee=he[0],pe=he[1],xe=(0,s.useState)(!1),Ce=i()(xe,2),Fe=Ce[0],re=Ce[1],V=(0,s.useState)(!1),De=i()(V,2),Oe=De[0],Te=De[1],ke=(0,s.useState)(),Se=i()(ke,2),He=Se[0],Le=Se[1],Je=(0,s.useState)([]),Ie=i()(Je,2),b=Ie[0],We=Ie[1],Qe=(0,s.useState)(""),be=i()(Qe,2),Ue=be[0],Xe=be[1],Ye=(0,s.useState)(!1),Ke=i()(Ye,2),we=Ke[0],Ae=Ke[1],Ne=(0,s.useRef)(),qe=(0,me.Z)(Ne,59),de=function(){pe(!0),m.W.get("".concat(y.Z.apiPrefix,"envs?searchValue=").concat(Ue)).then(function(n){var t=n.code,l=n.data;t===200&&z(l)}).finally(function(){return pe(!1)})},en=function(n,t){L.Z.confirm({title:"\u786E\u8BA4".concat(n.status===C.\u5DF2\u7981\u7528?"\u542F\u7528":"\u7981\u7528"),content:(0,a.jsxs)(a.Fragment,{children:["\u786E\u8BA4",n.status===C.\u5DF2\u7981\u7528?"\u542F\u7528":"\u7981\u7528","Env"," ",(0,a.jsx)(ne,{style:{wordBreak:"break-all"},type:"warning",children:n.value})," ","\u5417"]}),onOk:function(){m.W.put("".concat(y.Z.apiPrefix,"envs/").concat(n.status===C.\u5DF2\u7981\u7528?"enable":"disable"),{data:[n.id]}).then(function(o){var f=o.code,G=o.data;if(f===200){K.ZP.success("".concat(n.status===C.\u5DF2\u7981\u7528?"\u542F\u7528":"\u7981\u7528","\u6210\u529F"));var Y=n.status===C.\u5DF2\u7981\u7528?C.\u5DF2\u542F\u7528:C.\u5DF2\u7981\u7528,Ze=v()(x);Ze.splice(t,1,_()(_()({},n),{},{status:Y})),z(Ze)}})},onCancel:function(){console.log("Cancel")}})},nn=function(){Le(null),re(!0)},an=function(n,t){Le(n),re(!0)},tn=function(n,t){L.Z.confirm({title:"\u786E\u8BA4\u5220\u9664",content:(0,a.jsxs)(a.Fragment,{children:["\u786E\u8BA4\u5220\u9664\u53D8\u91CF"," ",(0,a.jsxs)(ne,{style:{wordBreak:"break-all"},type:"warning",children:[n.name,": ",n.value]})," ","\u5417"]}),onOk:function(){m.W.delete("".concat(y.Z.apiPrefix,"envs"),{data:[n.id]}).then(function(o){var f=o.code,G=o.data;if(f===200){K.ZP.success("\u5220\u9664\u6210\u529F");var Y=v()(x);Y.splice(t,1),z(Y)}})},onCancel:function(){console.log("Cancel")}})},rn=function(n){re(!1),n&&on(n)},ln=function(n){Te(!1),de()},on=function(n){var t=v()(x),l=x.findIndex(function(o){return o.id===n.id});l===-1?(n=Array.isArray(n)?n:[n],t.push.apply(t,v()(n))):t.splice(l,1,_()({},n)),z(t)},un={body:{row:ze}},sn=(0,s.useCallback)(function(r,n){if(r!==n){var t=x[r];m.W.put("".concat(y.Z.apiPrefix,"envs/").concat(t.id,"/move"),{data:{fromIndex:r,toIndex:n}}).then(function(l){var o=l.code,f=l.data;if(o===200){var G=v()(x);G.splice(r,1),G.splice(n,0,_()(_()({},t),f.data)),z(v()(G))}})}},[x]),dn=function(n){We(n)},cn={selectedRowKeys:b,onChange:dn},mn=function(){L.Z.confirm({title:"\u786E\u8BA4\u5220\u9664",content:(0,a.jsx)(a.Fragment,{children:"\u786E\u8BA4\u5220\u9664\u9009\u4E2D\u7684\u53D8\u91CF\u5417"}),onOk:function(){m.W.delete("".concat(y.Z.apiPrefix,"envs"),{data:b}).then(function(t){var l=t.code,o=t.data;l===200&&(K.ZP.success("\u6279\u91CF\u5220\u9664\u6210\u529F"),We([]),de())})},onCancel:function(){console.log("Cancel")}})},$e=function(n){L.Z.confirm({title:"\u786E\u8BA4".concat(ae[n]),content:(0,a.jsxs)(a.Fragment,{children:["\u786E\u8BA4",ae[n],"\u9009\u4E2D\u7684\u53D8\u91CF\u5417"]}),onOk:function(){m.W.put("".concat(y.Z.apiPrefix,"envs/").concat(Pe[n]),{data:b}).then(function(l){var o=l.code,f=l.data;o===200&&de()})},onCancel:function(){console.log("Cancel")}})},vn=function(){var n=x.filter(function(t){return b.includes(t.id)}).map(function(t){return{value:t.value,name:t.name,remarks:t.remarks}});(0,ue.w7)("env.json",JSON.stringify(n))},_n=function(){Te(!0)},fn=function(n){Xe(n.trim())},gn={accept:"application/json",beforeUpload:function(){var r=T()(E()().mark(function t(l){var o,f,G,Y;return E()().wrap(function(F){for(;;)switch(F.prev=F.next){case 0:return o=new FormData,o.append("env",l),Ae(!0),F.prev=3,F.next=6,m.W.post("".concat(y.Z.apiPrefix,"envs/upload"),{data:o});case 6:f=F.sent,G=f.code,Y=f.data,G===200&&(K.ZP.success("\u6210\u529F\u4E0A\u4F20".concat(Y.length,"\u4E2A\u73AF\u5883\u53D8\u91CF")),de()),Ae(!1),F.next=16;break;case 13:F.prev=13,F.t0=F.catch(3),Ae(!1);case 16:return F.abrupt("return",!1);case 17:case"end":return F.stop()}},t,null,[[3,13]])}));function n(t){return r.apply(this,arguments)}return n}(),fileList:[]};return(0,s.useEffect)(function(){de()},[Ue]),(0,a.jsxs)(Q.ZP,{className:"ql-container-wrapper env-wrapper",title:"\u73AF\u5883\u53D8\u91CF",extra:[(0,a.jsx)(fe,{placeholder:"\u8BF7\u8F93\u5165\u540D\u79F0/\u503C/\u5907\u6CE8",style:{width:"auto"},enterButton:!0,loading:Ee,onSearch:fn}),(0,a.jsx)(N.Z,_()(_()({},gn),{},{children:(0,a.jsx)(c.Z,{type:"primary",icon:(0,a.jsx)(J.Z,{}),loading:we,children:"\u5BFC\u5165"})})),(0,a.jsx)(c.Z,{type:"primary",onClick:function(){return nn()},children:"\u65B0\u5EFA\u53D8\u91CF"},"2")],header:{style:te},children:[b.length>0&&(0,a.jsxs)("div",{style:{marginBottom:16},children:[(0,a.jsx)(c.Z,{type:"primary",style:{marginBottom:5},onClick:_n,children:"\u6279\u91CF\u4FEE\u6539\u53D8\u91CF\u540D\u79F0"}),(0,a.jsx)(c.Z,{type:"primary",style:{marginBottom:5,marginLeft:8},onClick:mn,children:"\u6279\u91CF\u5220\u9664"}),(0,a.jsx)(c.Z,{type:"primary",onClick:function(){return vn()},style:{marginLeft:8,marginRight:8},children:"\u6279\u91CF\u5BFC\u51FA"}),(0,a.jsx)(c.Z,{type:"primary",onClick:function(){return $e(0)},style:{marginLeft:8,marginBottom:5},children:"\u6279\u91CF\u542F\u7528"}),(0,a.jsx)(c.Z,{type:"primary",onClick:function(){return $e(1)},style:{marginLeft:8,marginRight:8},children:"\u6279\u91CF\u7981\u7528"}),(0,a.jsxs)("span",{style:{marginLeft:8},children:["\u5DF2\u9009\u62E9",(0,a.jsx)("a",{children:b==null?void 0:b.length}),"\u9879"]})]}),(0,a.jsx)(X.W,{backend:g.PD,children:(0,a.jsx)(w.Z,{ref:Ne,columns:Me,rowSelection:cn,pagination:!1,dataSource:x,rowKey:"id",size:"middle",scroll:{x:1e3,y:qe},components:un,loading:Ee,onRow:function(n,t){return{index:t,moveRow:sn}}})}),(0,a.jsx)(ee.default,{visible:Fe,handleCancel:rn,env:He}),(0,a.jsx)(I.default,{visible:Oe,handleCancel:ln,ids:b})]})},Ge=Ve},47805:function(ce,D,e){e.r(D);var A=e(35290),E=e.n(A),Z=e(30279),T=e.n(Z),S=e(411),v=e.n(S),M=e(46686),_=e.n(M),p=e(63313),i=e.n(p),O=e(78455),k=e(80743),s=e(97325),P=e(2991),R=e(39958),U=e(76385),le=e(7619),d=e(11527),L=function(N){var c=N.env,w=N.handleCancel,$=N.visible,oe=O.Z.useForm(),q=_()(oe,1),H=q[0],J=(0,p.useState)(!1),y=_()(J,2),Q=y[0],m=y[1],ee=function(){var I=v()(E()().mark(function j(B){var X,g,ue,se,me,a,ve,ne,_e,fe;return E()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return m(!0),X=B.value,g=B.split,ue=B.name,se=B.remarks,me=c?"put":"post",c?a=T()(T()({},B),{},{id:c.id}):g==="1"?(ve=X.includes("&")?"&":`
`,a=X.split(ve).map(function(ae){return{name:ue,value:ae,remarks:se}})):a=[{value:X,name:ue,remarks:se}],h.prev=4,h.next=7,U.W[me]("".concat(le.Z.apiPrefix,"envs"),{data:a});case 7:ne=h.sent,_e=ne.code,fe=ne.data,_e===200&&(k.ZP.success(c?"\u66F4\u65B0\u53D8\u91CF\u6210\u529F":"\u65B0\u5EFA\u53D8\u91CF\u6210\u529F"),w(fe)),m(!1),h.next=17;break;case 14:h.prev=14,h.t0=h.catch(4),m(!1);case 17:case"end":return h.stop()}},j,null,[[4,14]])}));return function(B){return I.apply(this,arguments)}}();return(0,p.useEffect)(function(){H.resetFields()},[c,$]),(0,d.jsx)(s.Z,{title:c?"\u7F16\u8F91\u53D8\u91CF":"\u65B0\u5EFA\u53D8\u91CF",open:$,forceRender:!0,centered:!0,maskClosable:!1,onOk:function(){H.validateFields().then(function(j){ee(j)}).catch(function(j){console.log("Validate Failed:",j)})},onCancel:function(){return w()},confirmLoading:Q,children:(0,d.jsxs)(O.Z,{form:H,layout:"vertical",name:"env_modal",initialValues:c,children:[(0,d.jsx)(O.Z.Item,{name:"name",label:"\u540D\u79F0",rules:[{required:!0,message:"\u8BF7\u8F93\u5165\u73AF\u5883\u53D8\u91CF\u540D\u79F0",whitespace:!0},{pattern:/^[a-zA-Z_][0-9a-zA-Z_]*$/,message:"\u53EA\u80FD\u8F93\u5165\u5B57\u6BCD\u6570\u5B57\u4E0B\u5212\u7EBF\uFF0C\u4E14\u4E0D\u80FD\u4EE5\u6570\u5B57\u5F00\u5934"}],children:(0,d.jsx)(P.Z,{placeholder:"\u8BF7\u8F93\u5165\u73AF\u5883\u53D8\u91CF\u540D\u79F0"})}),!c&&(0,d.jsx)(O.Z.Item,{name:"split",label:"\u81EA\u52A8\u62C6\u5206",initialValue:"0",tooltip:"\u591A\u4E2A\u4F9D\u8D56\u662F\u5426\u6362\u884C\u5206\u5272",children:(0,d.jsxs)(R.ZP.Group,{children:[(0,d.jsx)(R.ZP,{value:"1",children:"\u662F"}),(0,d.jsx)(R.ZP,{value:"0",children:"\u5426"})]})}),(0,d.jsx)(O.Z.Item,{name:"value",label:"\u503C",rules:[{required:!0,message:"\u8BF7\u8F93\u5165\u73AF\u5883\u53D8\u91CF\u503C",whitespace:!0}],children:(0,d.jsx)(P.Z.TextArea,{rows:4,autoSize:!0,placeholder:"\u8BF7\u8F93\u5165\u73AF\u5883\u53D8\u91CF\u503C"})}),(0,d.jsx)(O.Z.Item,{name:"remarks",label:"\u5907\u6CE8",children:(0,d.jsx)(P.Z,{placeholder:"\u8BF7\u8F93\u5165\u5907\u6CE8"})})]})})};D.default=L}}]);