(self.webpackChunk=self.webpackChunk||[]).push([[1554],{44965:function(ee,S,e){"use strict";e.r(S),e.d(S,{default:function(){return De}});var C=e(30279),d=e.n(C),N=e(46686),A=e.n(N),r=e(63313),E=e.n(r),m=e(71976),D=e(15882),p=e(24255),T=e(21391),W=e(47161),te=e(84875),U=e.n(te),oe=e(56453),se=e(30486),G=e(83235),I=e(52113),K=e(86027),B=e(1423),Q=e(55859),V=["className","prefixCls","style","active","status","iconPrefix","icon","wrapperStyle","stepNumber","disabled","description","title","subTitle","progressDot","stepIcon","tailContent","icons","stepIndex","onStepClick","onClick"];function j(b){return typeof b=="string"}var u=function(b){(0,B.Z)(f,b);var l=(0,Q.Z)(f);function f(){var c;(0,G.Z)(this,f);for(var o=arguments.length,n=new Array(o),t=0;t<o;t++)n[t]=arguments[t];return c=l.call.apply(l,[this].concat(n)),(0,p.Z)((0,K.Z)(c),"onClick",function(){var s=c.props,x=s.onClick,g=s.onStepClick,h=s.stepIndex;x&&x.apply(void 0,arguments),g(h)}),c}return(0,I.Z)(f,[{key:"renderIconNode",value:function(){var o,n=this.props,t=n.prefixCls,s=n.progressDot,x=n.stepIcon,g=n.stepNumber,h=n.status,F=n.title,k=n.description,O=n.icon,w=n.iconPrefix,_=n.icons,v,L=U()("".concat(t,"-icon"),"".concat(w,"icon"),(o={},(0,p.Z)(o,"".concat(w,"icon-").concat(O),O&&j(O)),(0,p.Z)(o,"".concat(w,"icon-check"),!O&&h==="finish"&&(_&&!_.finish||!_)),(0,p.Z)(o,"".concat(w,"icon-cross"),!O&&h==="error"&&(_&&!_.error||!_)),o)),R=r.createElement("span",{className:"".concat(t,"-icon-dot")});return s?typeof s=="function"?v=r.createElement("span",{className:"".concat(t,"-icon")},s(R,{index:g-1,status:h,title:F,description:k})):v=r.createElement("span",{className:"".concat(t,"-icon")},R):O&&!j(O)?v=r.createElement("span",{className:"".concat(t,"-icon")},O):_&&_.finish&&h==="finish"?v=r.createElement("span",{className:"".concat(t,"-icon")},_.finish):_&&_.error&&h==="error"?v=r.createElement("span",{className:"".concat(t,"-icon")},_.error):O||h==="finish"||h==="error"?v=r.createElement("span",{className:L}):v=r.createElement("span",{className:"".concat(t,"-icon")},g),x&&(v=x({index:g-1,status:h,title:F,description:k,node:v})),v}},{key:"render",value:function(){var o,n=this.props,t=n.className,s=n.prefixCls,x=n.style,g=n.active,h=n.status,F=h===void 0?"wait":h,k=n.iconPrefix,O=n.icon,w=n.wrapperStyle,_=n.stepNumber,v=n.disabled,L=n.description,R=n.title,i=n.subTitle,y=n.progressDot,Z=n.stepIcon,H=n.tailContent,z=n.icons,ce=n.stepIndex,ue=n.onStepClick,pe=n.onClick,re=(0,se.Z)(n,V),X=U()("".concat(s,"-item"),"".concat(s,"-item-").concat(F),t,(o={},(0,p.Z)(o,"".concat(s,"-item-custom"),O),(0,p.Z)(o,"".concat(s,"-item-active"),g),(0,p.Z)(o,"".concat(s,"-item-disabled"),v===!0),o)),he=(0,oe.Z)({},x),Y={};return ue&&!v&&(Y.role="button",Y.tabIndex=0,Y.onClick=this.onClick),r.createElement("div",(0,D.Z)({},re,{className:X,style:he}),r.createElement("div",(0,D.Z)({onClick:pe},Y,{className:"".concat(s,"-item-container")}),r.createElement("div",{className:"".concat(s,"-item-tail")},H),r.createElement("div",{className:"".concat(s,"-item-icon")},this.renderIconNode()),r.createElement("div",{className:"".concat(s,"-item-content")},r.createElement("div",{className:"".concat(s,"-item-title")},R,i&&r.createElement("div",{title:typeof i=="string"?i:void 0,className:"".concat(s,"-item-subtitle")},i)),L&&r.createElement("div",{className:"".concat(s,"-item-description")},L))))}}]),f}(r.Component),ie=["prefixCls","style","className","children","direction","type","labelPlacement","iconPrefix","status","size","current","progressDot","stepIcon","initial","icons","onChange","items"],P=function(b){(0,B.Z)(f,b);var l=(0,Q.Z)(f);function f(){var c;(0,G.Z)(this,f);for(var o=arguments.length,n=new Array(o),t=0;t<o;t++)n[t]=arguments[t];return c=l.call.apply(l,[this].concat(n)),(0,p.Z)((0,K.Z)(c),"onStepClick",function(s){var x=c.props,g=x.onChange,h=x.current;g&&h!==s&&g(s)}),c}return(0,I.Z)(f,[{key:"render",value:function(){var o,n=this,t=this.props,s=t.prefixCls,x=t.style,g=x===void 0?{}:x,h=t.className,F=t.children,k=t.direction,O=t.type,w=t.labelPlacement,_=t.iconPrefix,v=t.status,L=t.size,R=t.current,i=t.progressDot,y=t.stepIcon,Z=t.initial,H=t.icons,z=t.onChange,ce=t.items,ue=ce===void 0?[]:ce,pe=(0,se.Z)(t,ie),re=O==="navigation",X=i?"vertical":w,he=U()(s,"".concat(s,"-").concat(k),h,(o={},(0,p.Z)(o,"".concat(s,"-").concat(L),L),(0,p.Z)(o,"".concat(s,"-label-").concat(X),k==="horizontal"),(0,p.Z)(o,"".concat(s,"-dot"),!!i),(0,p.Z)(o,"".concat(s,"-navigation"),re),o));return E().createElement("div",(0,D.Z)({className:he,style:g},pe),ue.filter(function(Y){return Y}).map(function(Y,Te){var me=(0,oe.Z)({},Y),fe=Z+Te;return v==="error"&&Te===R-1&&(me.className="".concat(s,"-next-error")),me.status||(fe===R?me.status=v:fe<R?me.status="finish":me.status="wait"),E().createElement(u,(0,D.Z)({},me,{active:fe===R,stepNumber:fe+1,stepIndex:fe,key:fe,prefixCls:s,iconPrefix:_,wrapperStyle:g,progressDot:i,stepIcon:y,icons:H,onStepClick:z&&n.onStepClick}))}))}}]),f}(E().Component);(0,p.Z)(P,"Step",u),(0,p.Z)(P,"defaultProps",{type:"default",prefixCls:"rc-steps",iconPrefix:"rc",direction:"horizontal",labelPlacement:"horizontal",initial:0,current:0,status:"process",size:"",progressDot:!1});var $=P,_e=e(47295),Pe=e(66432),be=e(74635),Oe=e(33246);function xe(b){return b.filter(function(l){return l})}function Ie(b,l){if(b)return b;var f=(0,Oe.Z)(l).map(function(c){if(r.isValidElement(c)){var o=c.props,n=(0,D.Z)({},o);return n}return null});return xe(f)}var Ee=function(b,l){var f={};for(var c in b)Object.prototype.hasOwnProperty.call(b,c)&&l.indexOf(c)<0&&(f[c]=b[c]);if(b!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,c=Object.getOwnPropertySymbols(b);o<c.length;o++)l.indexOf(c[o])<0&&Object.prototype.propertyIsEnumerable.call(b,c[o])&&(f[c[o]]=b[c[o]]);return f},ge=function(l){var f,c=l.percent,o=l.size,n=l.className,t=l.direction,s=l.items,x=l.responsive,g=x===void 0?!0:x,h=l.current,F=h===void 0?0:h,k=l.children,O=Ee(l,["percent","size","className","direction","items","responsive","current","children"]),w=(0,Pe.Z)(g),_=w.xs,v=r.useContext(_e.E_),L=v.getPrefixCls,R=v.direction,i=r.useCallback(function(){return g&&_?"vertical":t},[_,t]),y=L("steps",l.prefixCls),Z=L("",l.iconPrefix),H=Ie(s,k),z=U()((f={},(0,p.Z)(f,"".concat(y,"-rtl"),R==="rtl"),(0,p.Z)(f,"".concat(y,"-with-progress"),c!==void 0),f),n),ce={finish:r.createElement(T.Z,{className:"".concat(y,"-finish-icon")}),error:r.createElement(W.Z,{className:"".concat(y,"-error-icon")})},ue=function(re){var X=re.node,he=re.status;if(he==="process"&&c!==void 0){var Y=o==="small"?32:40;return r.createElement("div",{className:"".concat(y,"-progress-icon")},r.createElement(be.Z,{type:"circle",percent:c,width:Y,strokeWidth:4,format:function(){return null}}),X)}return X};return r.createElement($,(0,D.Z)({icons:ce},O,{current:F,size:o,items:H,direction:i(),stepIcon:ue,prefixCls:y,iconPrefix:Z,className:z}))};ge.Step=$.Step;var de=ge,ve=e(61839),ye=e(87670),le=e(59225),ne=e(30314),ae=e(27382),Ne=e(69500),M={container:"container___p6QCp",top:"top___Juq26",header:"header___tqj_6",logo:"logo___YomRq",title:"title___0O1DN",desc:"desc___J3UaF",main:"main___II0mY","ant-steps":"ant-steps___T0WmF","steps-container":"steps-container___Zhjdk",extra:"extra___c8tGm"},q=e(74083),a=e(11527),Ae=m.Z.Item,Ce=de.Step,Me=ve.Z.Option,J=ye.Z.Link,Se=function(){var l=(0,r.useState)(!1),f=A()(l,2),c=f[0],o=f[1],n=E().useState(0),t=A()(n,2),s=t[0],x=t[1],g=(0,r.useState)([]),h=A()(g,2),F=h[0],k=h[1],O=function(){x(s+1)},w=function(){x(s-1)},_=function(y){o(!0),q.W.put("".concat(ae.Z.apiPrefix,"user/init"),{data:{username:y.username,password:y.password}}).then(function(Z){var H=Z.code,z=Z.data;H===200&&O()}).finally(function(){return o(!1)})},v=function(y){o(!0),q.W.put("".concat(ae.Z.apiPrefix,"user/notification/init"),{data:d()({},y)}).then(function(Z){var H=Z.code,z=Z.data;H===200&&O()}).finally(function(){return o(!1)})},L=function(y){var Z=ae.Z.notificationModeMap[y];k(Z||[])};(0,r.useEffect)(function(){localStorage.removeItem(ae.Z.authKey)},[]);var R=[{title:"\u6B22\u8FCE\u4F7F\u7528",content:(0,a.jsxs)("div",{className:M.top,style:{marginTop:100},children:[(0,a.jsx)("div",{className:M.header,children:(0,a.jsx)("span",{className:M.title,children:"\u6B22\u8FCE\u4F7F\u7528\u9752\u9F99\u63A7\u5236\u9762\u677F"})}),(0,a.jsx)("div",{className:M.action,children:(0,a.jsx)(le.Z,{type:"primary",onClick:function(){O()},children:"\u5F00\u59CB\u5B89\u88C5"})})]})},{title:"\u901A\u77E5\u8BBE\u7F6E",content:(0,a.jsxs)(m.Z,{onFinish:v,layout:"vertical",children:[(0,a.jsx)(m.Z.Item,{label:"\u901A\u77E5\u65B9\u5F0F",name:"type",rules:[{required:!0,message:"\u8BF7\u9009\u62E9\u901A\u77E5\u65B9\u5F0F"}],style:{maxWidth:350},children:(0,a.jsx)(ve.Z,{onChange:L,placeholder:"\u8BF7\u9009\u62E9\u901A\u77E5\u65B9\u5F0F",children:ae.Z.notificationModes.filter(function(i){return i.value!=="closed"}).map(function(i){return(0,a.jsx)(Me,{value:i.value,children:i.label},i.value)})})}),F.map(function(i){return(0,a.jsx)(m.Z.Item,{label:i.label,name:i.label,extra:i.tip,rules:[{required:i.required}],style:{maxWidth:400},children:(0,a.jsx)(ne.Z.TextArea,{autoSize:!0,placeholder:"\u8BF7\u8F93\u5165".concat(i.label)})},i.label)}),(0,a.jsx)(le.Z,{type:"primary",htmlType:"submit",loading:c,children:"\u4FDD\u5B58"}),(0,a.jsx)(le.Z,{type:"link",htmlType:"button",onClick:function(){return O()},children:"\u8DF3\u8FC7"})]})},{title:"\u8D26\u6237\u8BBE\u7F6E",content:(0,a.jsxs)(m.Z,{onFinish:_,layout:"vertical",children:[(0,a.jsx)(m.Z.Item,{label:"\u7528\u6237\u540D",name:"username",rules:[{required:!0}],style:{maxWidth:350},children:(0,a.jsx)(ne.Z,{placeholder:"\u7528\u6237\u540D"})}),(0,a.jsx)(m.Z.Item,{label:"\u5BC6\u7801",name:"password",rules:[{required:!0},{pattern:/^(?!admin$).*$/,message:"\u5BC6\u7801\u4E0D\u80FD\u4E3Aadmin"}],hasFeedback:!0,style:{maxWidth:350},children:(0,a.jsx)(ne.Z,{type:"password",placeholder:"\u5BC6\u7801"})}),(0,a.jsx)(m.Z.Item,{name:"confirm",label:"\u786E\u8BA4\u5BC6\u7801",dependencies:["password"],hasFeedback:!0,style:{maxWidth:350},rules:[{required:!0},function(i){var y=i.getFieldValue;return{validator:function(H,z){return!z||y("password")===z?Promise.resolve():Promise.reject(new Error("\u60A8\u8F93\u5165\u7684\u4E24\u4E2A\u5BC6\u7801\u4E0D\u5339\u914D\uFF01"))}}}],children:(0,a.jsx)(ne.Z.Password,{placeholder:"\u786E\u8BA4\u5BC6\u7801"})}),(0,a.jsx)(le.Z,{type:"primary",htmlType:"submit",loading:c,children:"\u63D0\u4EA4"})]})},{title:"\u5B8C\u6210\u5B89\u88C5",content:(0,a.jsxs)("div",{className:M.top,style:{marginTop:80},children:[(0,a.jsxs)("div",{className:M.header,children:[(0,a.jsx)("span",{className:M.title,children:"\u606D\u559C\u5B89\u88C5\u5B8C\u6210\uFF01"}),(0,a.jsx)(J,{href:"https://github.com/whyour/qinglong",target:"_blank",children:"Github"}),(0,a.jsx)(J,{href:"https://t.me/jiao_long",target:"_blank",children:"Telegram\u9891\u9053"})]}),(0,a.jsx)("div",{style:{marginTop:16},children:(0,a.jsx)(le.Z,{type:"primary",onClick:function(){Ne.m8.push("/login")},children:"\u53BB\u767B\u5F55"})})]})}];return(0,a.jsxs)("div",{className:M.container,children:[(0,a.jsx)("div",{className:M.top,children:(0,a.jsxs)("div",{className:M.header,children:[(0,a.jsx)("img",{alt:"logo",className:M.logo,src:"https://qn.whyour.cn/logo.png"}),(0,a.jsx)("span",{className:M.title,children:"\u521D\u59CB\u5316\u914D\u7F6E"})]})}),(0,a.jsxs)("div",{className:M.main,children:[(0,a.jsx)(de,{current:s,direction:"vertical",size:"small",className:M["ant-steps"],children:R.map(function(i){return(0,a.jsx)(Ce,{title:i.title},i.title)})}),(0,a.jsx)("div",{className:M["steps-container"],children:R[s].content})]})]})},De=Se},27382:function(ee,S){"use strict";S.Z={siteName:"\u9752\u9F99\u63A7\u5236\u9762\u677F",apiPrefix:"/api/",authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Portugu\xEAs",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:"\u4E2D\u6587",flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:"\u5B9A\u65F6\u4EFB\u52A1",value:"crons"},{name:"\u73AF\u5883\u53D8\u91CF",value:"envs"},{name:"\u8BA2\u9605\u7BA1\u7406",value:"subscriptions"},{name:"\u914D\u7F6E\u6587\u4EF6",value:"configs"},{name:"\u811A\u672C\u7BA1\u7406",value:"scripts"},{name:"\u65E5\u5FD7\u7BA1\u7406",value:"logs"},{name:"\u4F9D\u8D56\u7BA1\u7406",value:"dependencies"},{name:"\u7CFB\u7EDF\u4FE1\u606F",value:"system"}],scopesMap:{crons:"\u5B9A\u65F6\u4EFB\u52A1",envs:"\u73AF\u5883\u53D8\u91CF",subscriptions:"\u8BA2\u9605\u7BA1\u7406",configs:"\u914D\u7F6E\u6587\u4EF6",scripts:"\u811A\u672C\u7BA1\u7406",logs:"\u65E5\u5FD7\u7BA1\u7406",dependencies:"\u4F9D\u8D56\u7BA1\u7406",system:"\u7CFB\u7EDF\u4FE1\u606F"},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:"Server\u9171"},{value:"pushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:"Telegram\u673A\u5668\u4EBA"},{value:"dingtalkBot",label:"\u9489\u9489\u673A\u5668\u4EBA"},{value:"weWorkBot",label:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA"},{value:"weWorkApp",label:"\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528"},{value:"aibotk",label:"\u667A\u80FD\u5FAE\u79D8\u4E66"},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"chat",label:"\u7FA4\u8F89chat"},{value:"email",label:"\u90AE\u7BB1"},{value:"lark",label:"\u98DE\u4E66\u673A\u5668\u4EBA"},{value:"webhook",label:"\u81EA\u5B9A\u4E49\u901A\u77E5"},{value:"closed",label:"\u5DF2\u5173\u95ED"}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:"gotify\u7684url\u5730\u5740,\u4F8B\u5982 https://push.example.de:8080",required:!0},{label:"gotifyToken",tip:"gotify\u7684\u6D88\u606F\u5E94\u7528token\u7801",required:!0},{label:"gotifyPriority",tip:"\u63A8\u9001\u6D88\u606F\u7684\u4F18\u5148\u7EA7"}],chat:[{label:"chatUrl",tip:"chat\u7684url\u5730\u5740",required:!0},{label:"chatToken",tip:"chat\u7684token\u7801",required:!0}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:"\u63A8\u9001\u5230\u4E2A\u4EBAQQ: http://127.0.0.1/send_private_msg\uFF0C\u7FA4\uFF1Ahttp://127.0.0.1/send_group_msg",required:!0},{label:"goCqHttpBotToken",tip:"\u8BBF\u95EE\u5BC6\u94A5",required:!0},{label:"goCqHttpBotQq",tip:"\u5982\u679CGOBOT_URL\u8BBE\u7F6E /send_private_msg \u5219\u9700\u8981\u586B\u5165 user_id=\u4E2A\u4EBAQQ \u76F8\u53CD\u5982\u679C\u662F /send_group_msg \u5219\u9700\u8981\u586B\u5165 group_id=QQ\u7FA4",required:!0}],serverChan:[{label:"serverChanKey",tip:"Server\u9171SENDKEY",required:!0}],pushDeer:[{label:"pushDeerKey",tip:"PushDeer\u7684Key\uFF0Chttps://github.com/easychen/pushdeer",required:!0},{label:"pushDeerUrl",tip:"PushDeer\u7684\u81EA\u67B6API endpoint\uFF0C\u9ED8\u8BA4\u662F https://api2.pushdeer.com/message/push"}],bark:[{label:"barkPush",tip:"Bark\u7684\u4FE1\u606FIP/\u8BBE\u5907\u7801\uFF0C\u4F8B\u5982\uFF1Ahttps://api.day.app/XXXXXXXX",required:!0},{label:"barkIcon",tip:"BARK\u63A8\u9001\u56FE\u6807,\u81EA\u5B9A\u4E49\u63A8\u9001\u56FE\u6807 (\u9700iOS15\u6216\u4EE5\u4E0A\u624D\u80FD\u663E\u793A)"},{label:"barkSound",tip:"BARK\u63A8\u9001\u94C3\u58F0,\u94C3\u58F0\u5217\u8868\u53BBAPP\u67E5\u770B\u590D\u5236\u586B\u5199"},{label:"barkGroup",tip:"BARK\u63A8\u9001\u6D88\u606F\u7684\u5206\u7EC4, \u9ED8\u8BA4\u4E3Aqinglong"}],telegramBot:[{label:"telegramBotToken",tip:"telegram\u673A\u5668\u4EBA\u7684token\uFF0C\u4F8B\u5982\uFF1A1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw",required:!0},{label:"telegramBotUserId",tip:"telegram\u7528\u6237\u7684id\uFF0C\u4F8B\u5982\uFF1A129xxx206",required:!0},{label:"telegramBotProxyHost",tip:"\u4EE3\u7406IP"},{label:"telegramBotProxyPort",tip:"\u4EE3\u7406\u7AEF\u53E3"},{label:"telegramBotProxyAuth",tip:"telegram\u4EE3\u7406\u914D\u7F6E\u8BA4\u8BC1\u53C2\u6570, \u7528\u6237\u540D\u4E0E\u5BC6\u7801\u7528\u82F1\u6587\u5192\u53F7\u8FDE\u63A5 user:password"},{label:"telegramBotApiHost",tip:"telegram api\u81EA\u5EFA\u7684\u53CD\u5411\u4EE3\u7406\u5730\u5740\uFF0C\u9ED8\u8BA4tg\u5B98\u65B9api"}],dingtalkBot:[{label:"dingtalkBotToken",tip:"\u9489\u9489\u673A\u5668\u4EBAwebhook token\uFF0C\u4F8B\u5982\uFF1A5a544165465465645d0f31dca676e7bd07415asdasd",required:!0},{label:"dingtalkBotSecret",tip:"\u5BC6\u94A5\uFF0C\u673A\u5668\u4EBA\u5B89\u5168\u8BBE\u7F6E\u9875\u9762\uFF0C\u52A0\u7B7E\u4E00\u680F\u4E0B\u9762\u663E\u793A\u7684SEC\u5F00\u5934\u7684\u5B57\u7B26\u4E32"}],weWorkBot:[{label:"weWorkBotKey",tip:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7684 webhook(\u8BE6\u89C1\u6587\u6863 https://work.weixin.qq.com/api/doc/90000/90136/91770)\uFF0C\u4F8B\u5982\uFF1A693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa",required:!0}],weWorkApp:[{label:"weWorkAppKey",tip:"corpid,corpsecret,touser(\u6CE8:\u591A\u4E2A\u6210\u5458ID\u4F7F\u7528|\u9694\u5F00),agentid,\u6D88\u606F\u7C7B\u578B(\u9009\u586B,\u4E0D\u586B\u9ED8\u8BA4\u6587\u672C\u6D88\u606F\u7C7B\u578B) \u6CE8\u610F\u7528,\u53F7\u9694\u5F00(\u82F1\u6587\u8F93\u5165\u6CD5\u7684\u9017\u53F7)\uFF0C\u4F8B\u5982\uFF1Awwcfrs,B-76WERQ,qinglong,1000001,2COat",required:!0}],aibotk:[{label:"aibotkKey",tip:"\u5BC6\u94A5key,\u667A\u80FD\u5FAE\u79D8\u4E66\u4E2A\u4EBA\u4E2D\u5FC3\u83B7\u53D6apikey\uFF0C\u7533\u8BF7\u5730\u5740\uFF1Ahttps://wechat.aibotk.com/signup?from=ql",required:!0},{label:"aibotkType",tip:"\u53D1\u9001\u7684\u76EE\u6807\uFF0C\u7FA4\u7EC4\u6216\u8005\u597D\u53CB",required:!0,placeholder:"\u8BF7\u8F93\u5165\u8981\u53D1\u9001\u7684\u76EE\u6807",items:[{value:"room",label:"\u7FA4\u804A"},{value:"contact",label:"\u597D\u53CB"}]},{label:"aibotkName",tip:"\u8981\u53D1\u9001\u7684\u7528\u6237\u6635\u79F0\u6216\u7FA4\u540D\uFF0C\u5982\u679C\u76EE\u6807\u662F\u7FA4\uFF0C\u9700\u8981\u586B\u7FA4\u540D\uFF0C\u5982\u679C\u76EE\u6807\u662F\u597D\u53CB\uFF0C\u9700\u8981\u586B\u597D\u53CB\u6635\u79F0",required:!0}],iGot:[{label:"iGotPushKey",tip:"iGot\u7684\u4FE1\u606F\u63A8\u9001key\uFF0C\u4F8B\u5982\uFF1Ahttps://push.hellyw.com/XXXXXXXX",required:!0}],pushPlus:[{label:"pushPlusToken",tip:"\u5FAE\u4FE1\u626B\u7801\u767B\u5F55\u540E\u4E00\u5BF9\u4E00\u63A8\u9001\u6216\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762\u7684token(\u60A8\u7684Token)\uFF0C\u4E0D\u63D0\u4F9BPUSH_PLUS_USER\u5219\u9ED8\u8BA4\u4E3A\u4E00\u5BF9\u4E00\u63A8\u9001\uFF0C\u53C2\u8003 https://www.pushplus.plus/",required:!0},{label:"pushPlusUser",tip:"\u4E00\u5BF9\u591A\u63A8\u9001\u7684\u201C\u7FA4\u7EC4\u7F16\u7801\u201D\uFF08\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762->\u60A8\u7684\u7FA4\u7EC4(\u5982\u65E0\u5219\u65B0\u5EFA)->\u7FA4\u7EC4\u7F16\u7801\uFF0C\u5982\u679C\u60A8\u662F\u521B\u5EFA\u7FA4\u7EC4\u4EBA\u3002\u4E5F\u9700\u70B9\u51FB\u201C\u67E5\u770B\u4E8C\u7EF4\u7801\u201D\u626B\u63CF\u7ED1\u5B9A\uFF0C\u5426\u5219\u4E0D\u80FD\u63A5\u53D7\u7FA4\u7EC4\u6D88\u606F\u63A8\u9001\uFF09"}],lark:[{label:"larkKey",tip:"\u98DE\u4E66\u7FA4\u7EC4\u673A\u5668\u4EBA\uFF1Ahttps://www.feishu.cn/hc/zh-CN/articles/360024984973",required:!0}],email:[{label:"emailService",tip:"\u90AE\u7BB1\u670D\u52A1\u540D\u79F0\uFF0C\u6BD4\u5982126\u3001163\u3001Gmail\u3001QQ\u7B49\uFF0C\u652F\u6301\u5217\u8868https://nodemailer.com/smtp/well-known/",required:!0},{label:"emailUser",tip:"\u90AE\u7BB1\u5730\u5740",required:!0},{label:"emailPass",tip:"\u90AE\u7BB1SMTP\u6388\u6743\u7801",required:!0}],webhook:[{label:"webhookMethod",tip:"\u8BF7\u6C42\u65B9\u6CD5",required:!0,items:[{value:"GET"},{value:"POST"},{value:"PUT"}]},{label:"webhookContentType",tip:"\u8BF7\u6C42\u5934Content-Type",required:!0,items:[{value:"application/json"},{value:"multipart/form-data"},{value:"application/x-www-form-urlencoded"}]},{label:"webhookUrl",tip:"\u8BF7\u6C42\u94FE\u63A5\u4EE5http\u6216\u8005https\u5F00\u5934\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",required:!0,placeholder:`https://xxx.cn/api?content=$title
`},{label:"webhookHeaders",tip:"\u8BF7\u6C42\u5934\u683C\u5F0FCustom-Header1: Header1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272",placeholder:`Custom-Header1: Header1
Custom-Header2: Header2`},{label:"webhookBody",tip:"\u8BF7\u6C42\u4F53\u683C\u5F0Fkey1: value1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",placeholder:`key1: $title
key2: $content`}]},documentTitleMap:{"/login":"\u767B\u5F55","/initialization":"\u521D\u59CB\u5316","/crontab":"\u5B9A\u65F6\u4EFB\u52A1","/env":"\u73AF\u5883\u53D8\u91CF","/subscription":"\u8BA2\u9605\u7BA1\u7406","/config":"\u914D\u7F6E\u6587\u4EF6","/script":"\u811A\u672C\u7BA1\u7406","/diff":"\u5BF9\u6BD4\u5DE5\u5177","/log":"\u65E5\u5FD7\u7BA1\u7406","/setting":"\u7CFB\u7EDF\u8BBE\u7F6E","/error":"\u9519\u8BEF\u65E5\u5FD7","/dependence":"\u4F9D\u8D56\u7BA1\u7406"},dependenceTypes:["nodejs","python3","linux"]}},74083:function(ee,S,e){"use strict";e.d(S,{W:function(){return se}});var C=e(35290),d=e.n(C),N=e(411),A=e.n(N),r=e(30279),E=e.n(r),m=e(50659),D=e(63533),p=e(27382),T=e(69500);D.ZP.config({duration:1.5});var W=Date.now(),te=function(I){if(I.response){var K=I.data?I.data.message||I.message||I.data:I.response.statusText,B=I.response.status;[502,504].includes(B)?T.m8.push("/error"):B===401?T.m8.location.pathname!=="/login"&&(D.ZP.error("\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55"),localStorage.removeItem(p.Z.authKey),T.m8.push("/login")):D.ZP.error(K)}else console.log(I.message);throw I},U=(0,m.l7)({timeout:6e4,params:{t:W},errorHandler:te}),oe=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];U.interceptors.request.use(function(G,I){var K=localStorage.getItem(p.Z.authKey);if(K&&!oe.includes(G)){var B={Authorization:"Bearer ".concat(K)};return{url:G,options:E()(E()({},I),{},{headers:B})}}return{url:G,options:I}}),U.interceptors.response.use(function(){var G=A()(d()().mark(function I(K){var B,Q,V;return d()().wrap(function(u){for(;;)switch(u.prev=u.next){case 0:if(B=K.status,![502,504].includes(B)){u.next=5;break}T.m8.push("/error"),u.next=14;break;case 5:if(B!==401){u.next=9;break}T.m8.location.pathname!=="/login"&&(localStorage.removeItem(p.Z.authKey),T.m8.push("/login")),u.next=14;break;case 9:return u.next=11,K.clone().json();case 11:return Q=u.sent,Q.code!==200&&(V=Q.message||Q.data,V&&D.ZP.error(V)),u.abrupt("return",Q);case 14:return u.abrupt("return",K);case 15:case"end":return u.stop()}},I)}));return function(I){return G.apply(this,arguments)}}());var se=U},60214:function(ee,S,e){"use strict";e.d(S,{Z:function(){return A}});var C=e(6614),d=e(63313),N=e.n(d);function A(){var r=d.useReducer(function(D){return D+1},0),E=(0,C.Z)(r,2),m=E[1];return m}},16204:function(ee,S,e){"use strict";e.d(S,{fk:function(){return A},jD:function(){return d}});var C=e(90784),d=function(){return(0,C.Z)()&&window.document.documentElement},N,A=function(){if(!d())return!1;if(N!==void 0)return N;var E=document.createElement("div");return E.style.display="flex",E.style.flexDirection="column",E.style.rowGap="1px",E.appendChild(document.createElement("div")),E.appendChild(document.createElement("div")),document.body.appendChild(E),N=E.scrollHeight===1,document.body.removeChild(E),N}},66432:function(ee,S,e){"use strict";var C=e(63313),d=e.n(C),N=e(60214),A=e(79315);function r(){var E=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!0,m=(0,C.useRef)({}),D=(0,N.Z)();return(0,C.useEffect)(function(){var p=A.ZP.subscribe(function(T){m.current=T,E&&D()});return function(){return A.ZP.unsubscribe(p)}},[]),m.current}S.Z=r},61839:function(ee,S,e){"use strict";var C=e(24255),d=e(15882),N=e(84875),A=e.n(N),r=e(7032),E=e(33759),m=e(63313),D=e.n(m),p=e(47295),T=e(57746),W=e(84858),te=e(6633),U=e(76093),oe=e(73442),se=e(82938),G=e(86628),I=e(51034),K=function(j,u){var ie={};for(var P in j)Object.prototype.hasOwnProperty.call(j,P)&&u.indexOf(P)<0&&(ie[P]=j[P]);if(j!=null&&typeof Object.getOwnPropertySymbols=="function")for(var $=0,P=Object.getOwnPropertySymbols(j);$<P.length;$++)u.indexOf(P[$])<0&&Object.prototype.propertyIsEnumerable.call(j,P[$])&&(ie[P[$]]=j[P[$]]);return ie},B="SECRET_COMBOBOX_MODE_DO_NOT_USE",Q=function(u,ie){var P,$=u.prefixCls,_e=u.bordered,Pe=_e===void 0?!0:_e,be=u.className,Oe=u.getPopupContainer,xe=u.dropdownClassName,Ie=u.popupClassName,Ee=u.listHeight,ge=Ee===void 0?256:Ee,de=u.placement,ve=u.listItemHeight,ye=ve===void 0?24:ve,le=u.size,ne=u.disabled,ae=u.notFoundContent,Ne=u.status,M=u.showArrow,q=K(u,["prefixCls","bordered","className","getPopupContainer","dropdownClassName","popupClassName","listHeight","placement","listItemHeight","size","disabled","notFoundContent","status","showArrow"]),a=m.useContext(p.E_),Ae=a.getPopupContainer,Ce=a.getPrefixCls,Me=a.renderEmpty,J=a.direction,Se=a.virtual,De=a.dropdownMatchSelectWidth,b=m.useContext(te.Z),l=Ce("select",$),f=Ce(),c=(0,I.ri)(l,J),o=c.compactSize,n=c.compactItemClassnames,t=m.useMemo(function(){var X=q.mode;if(X!=="combobox")return X===B?"combobox":X},[q.mode]),s=t==="multiple"||t==="tags",x=M!==void 0?M:q.loading||!(s||t==="combobox"),g=(0,m.useContext)(U.aM),h=g.status,F=g.hasFeedback,k=g.isFormItemInput,O=g.feedbackIcon,w=(0,se.F)(h,Ne),_;ae!==void 0?_=ae:t==="combobox"?_=null:_=(Me||T.Z)("Select");var v=(0,G.Z)((0,d.Z)((0,d.Z)({},q),{multiple:s,hasFeedback:F,feedbackIcon:O,showArrow:x,prefixCls:l})),L=v.suffixIcon,R=v.itemIcon,i=v.removeIcon,y=v.clearIcon,Z=(0,E.Z)(q,["suffixIcon","itemIcon"]),H=A()(Ie||xe,(0,C.Z)({},"".concat(l,"-dropdown-").concat(J),J==="rtl")),z=o||le||b,ce=m.useContext(W.Z),ue=ne!=null?ne:ce,pe=A()((P={},(0,C.Z)(P,"".concat(l,"-lg"),z==="large"),(0,C.Z)(P,"".concat(l,"-sm"),z==="small"),(0,C.Z)(P,"".concat(l,"-rtl"),J==="rtl"),(0,C.Z)(P,"".concat(l,"-borderless"),!Pe),(0,C.Z)(P,"".concat(l,"-in-form-item"),k),P),(0,se.Z)(l,w,F),n,be),re=function(){return de!==void 0?de:J==="rtl"?"bottomRight":"bottomLeft"};return m.createElement(r.ZP,(0,d.Z)({ref:ie,virtual:Se,dropdownMatchSelectWidth:De},Z,{transitionName:(0,oe.mL)(f,(0,oe.q0)(de),q.transitionName),listHeight:ge,listItemHeight:ye,mode:t,prefixCls:l,placement:re(),direction:J,inputIcon:L,menuItemSelectedIcon:R,removeIcon:i,clearIcon:y,notFoundContent:_,className:pe,getPopupContainer:Oe||Ae,dropdownClassName:H,showArrow:F||M,disabled:ue}))},V=m.forwardRef(Q);V.SECRET_COMBOBOX_MODE_DO_NOT_USE=B,V.Option=r.Wx,V.OptGroup=r.Xo,S.Z=V},58236:function(ee,S){"use strict";var e={MAC_ENTER:3,BACKSPACE:8,TAB:9,NUM_CENTER:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,PRINT_SCREEN:44,INSERT:45,DELETE:46,ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,QUESTION_MARK:63,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,META:91,WIN_KEY_RIGHT:92,CONTEXT_MENU:93,NUM_ZERO:96,NUM_ONE:97,NUM_TWO:98,NUM_THREE:99,NUM_FOUR:100,NUM_FIVE:101,NUM_SIX:102,NUM_SEVEN:103,NUM_EIGHT:104,NUM_NINE:105,NUM_MULTIPLY:106,NUM_PLUS:107,NUM_MINUS:109,NUM_PERIOD:110,NUM_DIVISION:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SEMICOLON:186,DASH:189,EQUALS:187,COMMA:188,PERIOD:190,SLASH:191,APOSTROPHE:192,SINGLE_QUOTE:222,OPEN_SQUARE_BRACKET:219,BACKSLASH:220,CLOSE_SQUARE_BRACKET:221,WIN_KEY:224,MAC_FF_META:224,WIN_IME:229,isTextModifyingKeyEvent:function(d){var N=d.keyCode;if(d.altKey&&!d.ctrlKey||d.metaKey||N>=e.F1&&N<=e.F12)return!1;switch(N){case e.ALT:case e.CAPS_LOCK:case e.CONTEXT_MENU:case e.CTRL:case e.DOWN:case e.END:case e.ESC:case e.HOME:case e.INSERT:case e.LEFT:case e.MAC_FF_META:case e.META:case e.NUMLOCK:case e.NUM_CENTER:case e.PAGE_DOWN:case e.PAGE_UP:case e.PAUSE:case e.PRINT_SCREEN:case e.RIGHT:case e.SHIFT:case e.UP:case e.WIN_KEY:case e.WIN_KEY_RIGHT:return!1;default:return!0}},isCharacterKey:function(d){if(d>=e.ZERO&&d<=e.NINE||d>=e.NUM_ZERO&&d<=e.NUM_MULTIPLY||d>=e.A&&d<=e.Z||window.navigator.userAgent.indexOf("WebKit")!==-1&&d===0)return!0;switch(d){case e.SPACE:case e.QUESTION_MARK:case e.NUM_PLUS:case e.NUM_MINUS:case e.NUM_PERIOD:case e.NUM_DIVISION:case e.SEMICOLON:case e.DASH:case e.EQUALS:case e.COMMA:case e.PERIOD:case e.SLASH:case e.APOSTROPHE:case e.SINGLE_QUOTE:case e.OPEN_SQUARE_BRACKET:case e.BACKSLASH:case e.CLOSE_SQUARE_BRACKET:return!0;default:return!1}}};S.Z=e},79001:function(ee,S,e){"use strict";e.d(S,{Z:function(){return D}});var C=e(56453),d=`accept acceptCharset accessKey action allowFullScreen allowTransparency
    alt async autoComplete autoFocus autoPlay capture cellPadding cellSpacing challenge
    charSet checked classID className colSpan cols content contentEditable contextMenu
    controls coords crossOrigin data dateTime default defer dir disabled download draggable
    encType form formAction formEncType formMethod formNoValidate formTarget frameBorder
    headers height hidden high href hrefLang htmlFor httpEquiv icon id inputMode integrity
    is keyParams keyType kind label lang list loop low manifest marginHeight marginWidth max maxLength media
    mediaGroup method min minLength multiple muted name noValidate nonce open
    optimum pattern placeholder poster preload radioGroup readOnly rel required
    reversed role rowSpan rows sandbox scope scoped scrolling seamless selected
    shape size sizes span spellCheck src srcDoc srcLang srcSet start step style
    summary tabIndex target title type useMap value width wmode wrap`,N=`onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown
    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick
    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown
    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel
    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough
    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata
    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad onError`,A="".concat(d," ").concat(N).split(/[\s\n]+/),r="aria-",E="data-";function m(p,T){return p.indexOf(T)===0}function D(p){var T=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,W;T===!1?W={aria:!0,data:!0,attr:!0}:T===!0?W={aria:!0}:W=(0,C.Z)({},T);var te={};return Object.keys(p).forEach(function(U){(W.aria&&(U==="role"||m(U,r))||W.data&&m(U,E)||W.attr&&A.includes(U))&&(te[U]=p[U])}),te}},71129:function(){}}]);