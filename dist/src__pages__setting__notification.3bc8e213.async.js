(self.webpackChunk=self.webpackChunk||[]).push([[7213],{94526:function(R,E,e){"use strict";e.r(E);var s=e(57213),a=e.n(s),u=e(54306),h=e.n(u),m=e(63313),_=e.n(m),l=e(57179),f=e(91692),v=e(32049),d=e(38626),P=e(21728),S=e(96786),c=e(45277),p=e(11527),U=l.Z.Option,b=function(M){var i=M.data,T=(0,m.useState)(!1),O=h()(T,2),C=O[0],t=O[1],A=(0,m.useState)("closed"),n=h()(A,2),D=n[0],w=n[1],z=(0,m.useState)([]),k=h()(z,2),$=k[0],V=k[1],Y=f.Z.useForm(),H=h()(Y,1),Z=H[0],x=function(g){var y=g.type;y=="closed"&&(g.type=""),S.W.put("".concat(c.Z.apiPrefix,"user/notification"),{data:a()({},g)}).then(function(N){var J=N.code,j=N.data;J===200&&v.ZP.success(g.type?"\u901A\u77E5\u53D1\u9001\u6210\u529F":"\u901A\u77E5\u5173\u95ED\u6210\u529F")}).catch(function(N){console.log(N)})},W=function(g){w(g);var y=c.Z.notificationModeMap[g];V(y||[])};return(0,m.useEffect)(function(){i&&i.type&&(W(i.type),Z.setFieldsValue(a()({},i)))},[i]),(0,p.jsx)("div",{children:(0,p.jsxs)(f.Z,{onFinish:x,form:Z,layout:"vertical",children:[(0,p.jsx)(f.Z.Item,{label:"\u901A\u77E5\u65B9\u5F0F",name:"type",rules:[{required:!0}],style:{maxWidth:400},initialValue:D,children:(0,p.jsx)(l.Z,{onChange:W,children:c.Z.notificationModes.map(function(o){return(0,p.jsx)(U,{value:o.value,children:o.label},o.value)})})}),$.map(function(o){return(0,p.jsx)(f.Z.Item,{label:o.label,name:o.label,extra:o.tip,rules:[{required:o.required}],style:{maxWidth:400},children:o.items?(0,p.jsx)(l.Z,{placeholder:o.placeholder||"\u8BF7\u9009\u62E9".concat(o.label),children:o.items.map(function(g){return(0,p.jsx)(U,{value:g.value,children:g.label||g.value},g.value)})}):(0,p.jsx)(d.Z.TextArea,{autoSize:!0,placeholder:o.placeholder||"\u8BF7\u8F93\u5165".concat(o.label)})},o.label)}),(0,p.jsx)(P.Z,{type:"primary",htmlType:"submit",children:"\u4FDD\u5B58"})]})})};E.default=b},45277:function(R,E){"use strict";E.Z={siteName:"\u9752\u9F99\u63A7\u5236\u9762\u677F",apiPrefix:"/api/",authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Portugu\xEAs",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:"\u4E2D\u6587",flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:"\u5B9A\u65F6\u4EFB\u52A1",value:"crons"},{name:"\u73AF\u5883\u53D8\u91CF",value:"envs"},{name:"\u8BA2\u9605\u7BA1\u7406",value:"subscriptions"},{name:"\u914D\u7F6E\u6587\u4EF6",value:"configs"},{name:"\u811A\u672C\u7BA1\u7406",value:"scripts"},{name:"\u65E5\u5FD7\u7BA1\u7406",value:"logs"},{name:"\u4F9D\u8D56\u7BA1\u7406",value:"dependencies"},{name:"\u7CFB\u7EDF\u4FE1\u606F",value:"system"}],scopesMap:{crons:"\u5B9A\u65F6\u4EFB\u52A1",envs:"\u73AF\u5883\u53D8\u91CF",subscriptions:"\u8BA2\u9605\u7BA1\u7406",configs:"\u914D\u7F6E\u6587\u4EF6",scripts:"\u811A\u672C\u7BA1\u7406",logs:"\u65E5\u5FD7\u7BA1\u7406",dependencies:"\u4F9D\u8D56\u7BA1\u7406",system:"\u7CFB\u7EDF\u4FE1\u606F"},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:"Server\u9171"},{value:"pushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:"Telegram\u673A\u5668\u4EBA"},{value:"dingtalkBot",label:"\u9489\u9489\u673A\u5668\u4EBA"},{value:"weWorkBot",label:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA"},{value:"weWorkApp",label:"\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528"},{value:"aibotk",label:"\u667A\u80FD\u5FAE\u79D8\u4E66"},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"chat",label:"\u7FA4\u8F89chat"},{value:"email",label:"\u90AE\u7BB1"},{value:"lark",label:"\u98DE\u4E66\u673A\u5668\u4EBA"},{value:"webhook",label:"\u81EA\u5B9A\u4E49\u901A\u77E5"},{value:"closed",label:"\u5DF2\u5173\u95ED"}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:"gotify\u7684url\u5730\u5740,\u4F8B\u5982 https://push.example.de:8080",required:!0},{label:"gotifyToken",tip:"gotify\u7684\u6D88\u606F\u5E94\u7528token\u7801",required:!0},{label:"gotifyPriority",tip:"\u63A8\u9001\u6D88\u606F\u7684\u4F18\u5148\u7EA7"}],chat:[{label:"chatUrl",tip:"chat\u7684url\u5730\u5740",required:!0},{label:"chatToken",tip:"chat\u7684token\u7801",required:!0}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:"\u63A8\u9001\u5230\u4E2A\u4EBAQQ: http://127.0.0.1/send_private_msg\uFF0C\u7FA4\uFF1Ahttp://127.0.0.1/send_group_msg",required:!0},{label:"goCqHttpBotToken",tip:"\u8BBF\u95EE\u5BC6\u94A5",required:!0},{label:"goCqHttpBotQq",tip:"\u5982\u679CGOBOT_URL\u8BBE\u7F6E /send_private_msg \u5219\u9700\u8981\u586B\u5165 user_id=\u4E2A\u4EBAQQ \u76F8\u53CD\u5982\u679C\u662F /send_group_msg \u5219\u9700\u8981\u586B\u5165 group_id=QQ\u7FA4",required:!0}],serverChan:[{label:"serverChanKey",tip:"Server\u9171SENDKEY",required:!0}],pushDeer:[{label:"pushDeerKey",tip:"PushDeer\u7684Key\uFF0Chttps://github.com/easychen/pushdeer",required:!0},{label:"pushDeerUrl",tip:"PushDeer\u7684\u81EA\u67B6API endpoint\uFF0C\u9ED8\u8BA4\u662F https://api2.pushdeer.com/message/push"}],bark:[{label:"barkPush",tip:"Bark\u7684\u4FE1\u606FIP/\u8BBE\u5907\u7801\uFF0C\u4F8B\u5982\uFF1Ahttps://api.day.app/XXXXXXXX",required:!0},{label:"barkIcon",tip:"BARK\u63A8\u9001\u56FE\u6807,\u81EA\u5B9A\u4E49\u63A8\u9001\u56FE\u6807 (\u9700iOS15\u6216\u4EE5\u4E0A\u624D\u80FD\u663E\u793A)"},{label:"barkSound",tip:"BARK\u63A8\u9001\u94C3\u58F0,\u94C3\u58F0\u5217\u8868\u53BBAPP\u67E5\u770B\u590D\u5236\u586B\u5199"},{label:"barkGroup",tip:"BARK\u63A8\u9001\u6D88\u606F\u7684\u5206\u7EC4, \u9ED8\u8BA4\u4E3Aqinglong"}],telegramBot:[{label:"telegramBotToken",tip:"telegram\u673A\u5668\u4EBA\u7684token\uFF0C\u4F8B\u5982\uFF1A1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw",required:!0},{label:"telegramBotUserId",tip:"telegram\u7528\u6237\u7684id\uFF0C\u4F8B\u5982\uFF1A129xxx206",required:!0},{label:"telegramBotProxyHost",tip:"\u4EE3\u7406IP"},{label:"telegramBotProxyPort",tip:"\u4EE3\u7406\u7AEF\u53E3"},{label:"telegramBotProxyAuth",tip:"telegram\u4EE3\u7406\u914D\u7F6E\u8BA4\u8BC1\u53C2\u6570, \u7528\u6237\u540D\u4E0E\u5BC6\u7801\u7528\u82F1\u6587\u5192\u53F7\u8FDE\u63A5 user:password"},{label:"telegramBotApiHost",tip:"telegram api\u81EA\u5EFA\u7684\u53CD\u5411\u4EE3\u7406\u5730\u5740\uFF0C\u9ED8\u8BA4tg\u5B98\u65B9api"}],dingtalkBot:[{label:"dingtalkBotToken",tip:"\u9489\u9489\u673A\u5668\u4EBAwebhook token\uFF0C\u4F8B\u5982\uFF1A5a544165465465645d0f31dca676e7bd07415asdasd",required:!0},{label:"dingtalkBotSecret",tip:"\u5BC6\u94A5\uFF0C\u673A\u5668\u4EBA\u5B89\u5168\u8BBE\u7F6E\u9875\u9762\uFF0C\u52A0\u7B7E\u4E00\u680F\u4E0B\u9762\u663E\u793A\u7684SEC\u5F00\u5934\u7684\u5B57\u7B26\u4E32"}],weWorkBot:[{label:"weWorkBotKey",tip:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7684 webhook(\u8BE6\u89C1\u6587\u6863 https://work.weixin.qq.com/api/doc/90000/90136/91770)\uFF0C\u4F8B\u5982\uFF1A693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa",required:!0}],weWorkApp:[{label:"weWorkAppKey",tip:"corpid,corpsecret,touser(\u6CE8:\u591A\u4E2A\u6210\u5458ID\u4F7F\u7528|\u9694\u5F00),agentid,\u6D88\u606F\u7C7B\u578B(\u9009\u586B,\u4E0D\u586B\u9ED8\u8BA4\u6587\u672C\u6D88\u606F\u7C7B\u578B) \u6CE8\u610F\u7528,\u53F7\u9694\u5F00(\u82F1\u6587\u8F93\u5165\u6CD5\u7684\u9017\u53F7)\uFF0C\u4F8B\u5982\uFF1Awwcfrs,B-76WERQ,qinglong,1000001,2COat",required:!0}],aibotk:[{label:"aibotkKey",tip:"\u5BC6\u94A5key,\u667A\u80FD\u5FAE\u79D8\u4E66\u4E2A\u4EBA\u4E2D\u5FC3\u83B7\u53D6apikey\uFF0C\u7533\u8BF7\u5730\u5740\uFF1Ahttps://wechat.aibotk.com/signup?from=ql",required:!0},{label:"aibotkType",tip:"\u53D1\u9001\u7684\u76EE\u6807\uFF0C\u7FA4\u7EC4\u6216\u8005\u597D\u53CB",required:!0,placeholder:"\u8BF7\u8F93\u5165\u8981\u53D1\u9001\u7684\u76EE\u6807",items:[{value:"room",label:"\u7FA4\u804A"},{value:"contact",label:"\u597D\u53CB"}]},{label:"aibotkName",tip:"\u8981\u53D1\u9001\u7684\u7528\u6237\u6635\u79F0\u6216\u7FA4\u540D\uFF0C\u5982\u679C\u76EE\u6807\u662F\u7FA4\uFF0C\u9700\u8981\u586B\u7FA4\u540D\uFF0C\u5982\u679C\u76EE\u6807\u662F\u597D\u53CB\uFF0C\u9700\u8981\u586B\u597D\u53CB\u6635\u79F0",required:!0}],iGot:[{label:"iGotPushKey",tip:"iGot\u7684\u4FE1\u606F\u63A8\u9001key\uFF0C\u4F8B\u5982\uFF1Ahttps://push.hellyw.com/XXXXXXXX",required:!0}],pushPlus:[{label:"pushPlusToken",tip:"\u5FAE\u4FE1\u626B\u7801\u767B\u5F55\u540E\u4E00\u5BF9\u4E00\u63A8\u9001\u6216\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762\u7684token(\u60A8\u7684Token)\uFF0C\u4E0D\u63D0\u4F9BPUSH_PLUS_USER\u5219\u9ED8\u8BA4\u4E3A\u4E00\u5BF9\u4E00\u63A8\u9001\uFF0C\u53C2\u8003 https://www.pushplus.plus/",required:!0},{label:"pushPlusUser",tip:"\u4E00\u5BF9\u591A\u63A8\u9001\u7684\u201C\u7FA4\u7EC4\u7F16\u7801\u201D\uFF08\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762->\u60A8\u7684\u7FA4\u7EC4(\u5982\u65E0\u5219\u65B0\u5EFA)->\u7FA4\u7EC4\u7F16\u7801\uFF0C\u5982\u679C\u60A8\u662F\u521B\u5EFA\u7FA4\u7EC4\u4EBA\u3002\u4E5F\u9700\u70B9\u51FB\u201C\u67E5\u770B\u4E8C\u7EF4\u7801\u201D\u626B\u63CF\u7ED1\u5B9A\uFF0C\u5426\u5219\u4E0D\u80FD\u63A5\u53D7\u7FA4\u7EC4\u6D88\u606F\u63A8\u9001\uFF09"}],lark:[{label:"larkKey",tip:"\u98DE\u4E66\u7FA4\u7EC4\u673A\u5668\u4EBA\uFF1Ahttps://www.feishu.cn/hc/zh-CN/articles/360024984973",required:!0}],email:[{label:"emailService",tip:"\u90AE\u7BB1\u670D\u52A1\u540D\u79F0\uFF0C\u6BD4\u5982126\u3001163\u3001Gmail\u3001QQ\u7B49\uFF0C\u652F\u6301\u5217\u8868https://nodemailer.com/smtp/well-known/",required:!0},{label:"emailUser",tip:"\u90AE\u7BB1\u5730\u5740",required:!0},{label:"emailPass",tip:"\u90AE\u7BB1SMTP\u6388\u6743\u7801",required:!0}],webhook:[{label:"webhookMethod",tip:"\u8BF7\u6C42\u65B9\u6CD5",required:!0,items:[{value:"GET"},{value:"POST"},{value:"PUT"}]},{label:"webhookContentType",tip:"\u8BF7\u6C42\u5934Content-Type",required:!0,items:[{value:"application/json"},{value:"multipart/form-data"},{value:"application/x-www-form-urlencoded"}]},{label:"webhookUrl",tip:"\u8BF7\u6C42\u94FE\u63A5\u4EE5http\u6216\u8005https\u5F00\u5934\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",required:!0,placeholder:`https://xxx.cn/api?content=$title
`},{label:"webhookHeaders",tip:"\u8BF7\u6C42\u5934\u683C\u5F0FCustom-Header1: Header1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272",placeholder:`Custom-Header1: Header1
Custom-Header2: Header2`},{label:"webhookBody",tip:"\u8BF7\u6C42\u4F53\u683C\u5F0Fkey1: value1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",placeholder:`key1: $title
key2: $content`}]},documentTitleMap:{"/login":"\u767B\u5F55","/initialization":"\u521D\u59CB\u5316","/crontab":"\u5B9A\u65F6\u4EFB\u52A1","/env":"\u73AF\u5883\u53D8\u91CF","/subscription":"\u8BA2\u9605\u7BA1\u7406","/config":"\u914D\u7F6E\u6587\u4EF6","/script":"\u811A\u672C\u7BA1\u7406","/diff":"\u5BF9\u6BD4\u5DE5\u5177","/log":"\u65E5\u5FD7\u7BA1\u7406","/setting":"\u7CFB\u7EDF\u8BBE\u7F6E","/error":"\u9519\u8BEF\u65E5\u5FD7","/dependence":"\u4F9D\u8D56\u7BA1\u7406"},dependenceTypes:["nodejs","python3","linux"]}},96786:function(R,E,e){"use strict";e.d(E,{W:function(){return U}});var s=e(25359),a=e.n(s),u=e(49811),h=e.n(u),m=e(57213),_=e.n(m),l=e(50659),f=e(32049),v=e(45277),d=e(95354);f.ZP.config({duration:1.5});var P=Date.now(),S=function(r){if(r.response){var M=r.data?r.data.message||r.message||r.data:r.response.statusText,i=r.response.status;[502,504].includes(i)?d.m8.push("/error"):i===401?d.m8.location.pathname!=="/login"&&(f.ZP.error("\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55"),localStorage.removeItem(v.Z.authKey),d.m8.push("/login")):f.ZP.error(M)}else console.log(r.message);throw r},c=(0,l.l7)({timeout:6e4,params:{t:P},errorHandler:S}),p=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];c.interceptors.request.use(function(b,r){var M=localStorage.getItem(v.Z.authKey);if(M&&!p.includes(b)){var i={Authorization:"Bearer ".concat(M)};return{url:b,options:_()(_()({},r),{},{headers:i})}}return{url:b,options:r}}),c.interceptors.response.use(function(){var b=h()(a()().mark(function r(M){var i,T,O;return a()().wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(i=M.status,![502,504].includes(i)){t.next=5;break}d.m8.push("/error"),t.next=14;break;case 5:if(i!==401){t.next=9;break}d.m8.location.pathname!=="/login"&&(localStorage.removeItem(v.Z.authKey),d.m8.push("/login")),t.next=14;break;case 9:return t.next=11,M.clone().json();case 11:return T=t.sent,T.code!==200&&(O=T.message||T.data,O&&f.ZP.error(O)),t.abrupt("return",T);case 14:return t.abrupt("return",M);case 15:case"end":return t.stop()}},r)}));return function(r){return b.apply(this,arguments)}}());var U=c},7430:function(R,E,e){"use strict";e.d(E,{fk:function(){return h},jD:function(){return a}});var s=e(90784),a=function(){return(0,s.Z)()&&window.document.documentElement},u,h=function(){if(!a())return!1;if(u!==void 0)return u;var _=document.createElement("div");return _.style.display="flex",_.style.flexDirection="column",_.style.rowGap="1px",_.appendChild(document.createElement("div")),_.appendChild(document.createElement("div")),document.body.appendChild(_),u=_.scrollHeight===1,document.body.removeChild(_),u}},57179:function(R,E,e){"use strict";var s=e(24572),a=e(51163),u=e(84875),h=e.n(u),m=e(7032),_=e(33759),l=e(63313),f=e.n(l),v=e(56220),d=e(31588),P=e(40987),S=e(75654),c=e(82689),p=e(35764),U=e(18952),b=e(29826),r=e(80386),M=function(C,t){var A={};for(var n in C)Object.prototype.hasOwnProperty.call(C,n)&&t.indexOf(n)<0&&(A[n]=C[n]);if(C!=null&&typeof Object.getOwnPropertySymbols=="function")for(var D=0,n=Object.getOwnPropertySymbols(C);D<n.length;D++)t.indexOf(n[D])<0&&Object.prototype.propertyIsEnumerable.call(C,n[D])&&(A[n[D]]=C[n[D]]);return A},i="SECRET_COMBOBOX_MODE_DO_NOT_USE",T=function(t,A){var n,D=t.prefixCls,w=t.bordered,z=w===void 0?!0:w,k=t.className,$=t.getPopupContainer,V=t.dropdownClassName,Y=t.popupClassName,H=t.listHeight,Z=H===void 0?256:H,x=t.placement,W=t.listItemHeight,o=W===void 0?24:W,g=t.size,y=t.disabled,N=t.notFoundContent,J=t.status,j=t.showArrow,B=M(t,["prefixCls","bordered","className","getPopupContainer","dropdownClassName","popupClassName","listHeight","placement","listItemHeight","size","disabled","notFoundContent","status","showArrow"]),L=l.useContext(v.E_),re=L.getPopupContainer,te=L.getPrefixCls,le=L.renderEmpty,K=L.direction,ie=L.virtual,se=L.dropdownMatchSelectWidth,ue=l.useContext(S.Z),I=te("select",D),_e=te(),ae=(0,r.ri)(I,K),de=ae.compactSize,ce=ae.compactItemClassnames,F=l.useMemo(function(){var Q=B.mode;if(Q!=="combobox")return Q===i?"combobox":Q},[B.mode]),ne=F==="multiple"||F==="tags",me=j!==void 0?j:B.loading||!(ne||F==="combobox"),G=(0,l.useContext)(c.aM),pe=G.status,ee=G.hasFeedback,Ee=G.isFormItemInput,ge=G.feedbackIcon,he=(0,U.F)(pe,J),q;N!==void 0?q=N:F==="combobox"?q=null:q=(le||d.Z)("Select");var X=(0,b.Z)((0,a.Z)((0,a.Z)({},B),{multiple:ne,hasFeedback:ee,feedbackIcon:ge,showArrow:me,prefixCls:I})),fe=X.suffixIcon,ve=X.itemIcon,Pe=X.removeIcon,Me=X.clearIcon,Oe=(0,_.Z)(B,["suffixIcon","itemIcon"]),be=h()(Y||V,(0,s.Z)({},"".concat(I,"-dropdown-").concat(K),K==="rtl")),oe=de||g||ue,Ce=l.useContext(P.Z),De=y!=null?y:Ce,Ie=h()((n={},(0,s.Z)(n,"".concat(I,"-lg"),oe==="large"),(0,s.Z)(n,"".concat(I,"-sm"),oe==="small"),(0,s.Z)(n,"".concat(I,"-rtl"),K==="rtl"),(0,s.Z)(n,"".concat(I,"-borderless"),!z),(0,s.Z)(n,"".concat(I,"-in-form-item"),Ee),n),(0,U.Z)(I,he,ee),ce,k),Te=function(){return x!==void 0?x:K==="rtl"?"bottomRight":"bottomLeft"};return l.createElement(m.ZP,(0,a.Z)({ref:A,virtual:ie,dropdownMatchSelectWidth:se},Oe,{transitionName:(0,p.mL)(_e,(0,p.q0)(x),B.transitionName),listHeight:Z,listItemHeight:o,mode:F,prefixCls:I,placement:Te(),direction:K,inputIcon:fe,menuItemSelectedIcon:ve,removeIcon:Pe,clearIcon:Me,notFoundContent:q,className:Ie,getPopupContainer:$||re,dropdownClassName:be,showArrow:ee||j,disabled:De}))},O=l.forwardRef(T);O.SECRET_COMBOBOX_MODE_DO_NOT_USE=i,O.Option=m.Wx,O.OptGroup=m.Xo,E.Z=O},58236:function(R,E){"use strict";var e={MAC_ENTER:3,BACKSPACE:8,TAB:9,NUM_CENTER:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,PRINT_SCREEN:44,INSERT:45,DELETE:46,ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,QUESTION_MARK:63,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,META:91,WIN_KEY_RIGHT:92,CONTEXT_MENU:93,NUM_ZERO:96,NUM_ONE:97,NUM_TWO:98,NUM_THREE:99,NUM_FOUR:100,NUM_FIVE:101,NUM_SIX:102,NUM_SEVEN:103,NUM_EIGHT:104,NUM_NINE:105,NUM_MULTIPLY:106,NUM_PLUS:107,NUM_MINUS:109,NUM_PERIOD:110,NUM_DIVISION:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SEMICOLON:186,DASH:189,EQUALS:187,COMMA:188,PERIOD:190,SLASH:191,APOSTROPHE:192,SINGLE_QUOTE:222,OPEN_SQUARE_BRACKET:219,BACKSLASH:220,CLOSE_SQUARE_BRACKET:221,WIN_KEY:224,MAC_FF_META:224,WIN_IME:229,isTextModifyingKeyEvent:function(a){var u=a.keyCode;if(a.altKey&&!a.ctrlKey||a.metaKey||u>=e.F1&&u<=e.F12)return!1;switch(u){case e.ALT:case e.CAPS_LOCK:case e.CONTEXT_MENU:case e.CTRL:case e.DOWN:case e.END:case e.ESC:case e.HOME:case e.INSERT:case e.LEFT:case e.MAC_FF_META:case e.META:case e.NUMLOCK:case e.NUM_CENTER:case e.PAGE_DOWN:case e.PAGE_UP:case e.PAUSE:case e.PRINT_SCREEN:case e.RIGHT:case e.SHIFT:case e.UP:case e.WIN_KEY:case e.WIN_KEY_RIGHT:return!1;default:return!0}},isCharacterKey:function(a){if(a>=e.ZERO&&a<=e.NINE||a>=e.NUM_ZERO&&a<=e.NUM_MULTIPLY||a>=e.A&&a<=e.Z||window.navigator.userAgent.indexOf("WebKit")!==-1&&a===0)return!0;switch(a){case e.SPACE:case e.QUESTION_MARK:case e.NUM_PLUS:case e.NUM_MINUS:case e.NUM_PERIOD:case e.NUM_DIVISION:case e.SEMICOLON:case e.DASH:case e.EQUALS:case e.COMMA:case e.PERIOD:case e.SLASH:case e.APOSTROPHE:case e.SINGLE_QUOTE:case e.OPEN_SQUARE_BRACKET:case e.BACKSLASH:case e.CLOSE_SQUARE_BRACKET:return!0;default:return!1}}};E.Z=e},79001:function(R,E,e){"use strict";e.d(E,{Z:function(){return f}});var s=e(75782),a=`accept acceptCharset accessKey action allowFullScreen allowTransparency
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
    summary tabIndex target title type useMap value width wmode wrap`,u=`onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown
    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick
    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown
    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel
    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough
    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata
    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad onError`,h="".concat(a," ").concat(u).split(/[\s\n]+/),m="aria-",_="data-";function l(v,d){return v.indexOf(d)===0}function f(v){var d=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,P;d===!1?P={aria:!0,data:!0,attr:!0}:d===!0?P={aria:!0}:P=(0,s.Z)({},d);var S={};return Object.keys(v).forEach(function(c){(P.aria&&(c==="role"||l(c,m))||P.data&&l(c,_)||P.attr&&h.includes(c))&&(S[c]=v[c])}),S}},71129:function(){}}]);