(self.webpackChunk=self.webpackChunk||[]).push([[9818,5586],{82166:function(V,b,e){"use strict";e.d(b,{Z:function(){return D}});var u=e(79105),a=e(63313),d={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"}}]},name:"eye",theme:"outlined"},g=d,t=e(17980),f=function(C,s){return a.createElement(t.Z,(0,u.Z)((0,u.Z)({},C),{},{ref:s,icon:g}))};f.displayName="EyeOutlined";var D=a.forwardRef(f)},15258:function(V,b,e){"use strict";e.d(b,{Z:function(){return D}});var u=e(79105),a=e(63313),d={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"}}]},name:"search",theme:"outlined"},g=d,t=e(17980),f=function(C,s){return a.createElement(t.Z,(0,u.Z)((0,u.Z)({},C),{},{ref:s,icon:g}))};f.displayName="SearchOutlined";var D=a.forwardRef(f)},11911:function(V,b,e){"use strict";e.r(b),e.d(b,{default:function(){return X}});var u=e(46686),a=e.n(u),d=e(30279),g=e.n(d),t=e(63313),f=e(7691),D=e(2991),E=e(30315),C=e(44280),s=e(98505),v=e(94645),N=e(30555),y=e(51970),L={"left-tree-container":"left-tree-container___zHanw","left-tree-scroller":"left-tree-scroller___PInUN","log-container":"log-container___ba9Tr"},ae=e(53883),K=e(90138),M=e(78722),h=e(11527);function w(se,ue){var me=[];if(se){var re=[];return ue.forEach(function(Y){if(Y.title.toLocaleLowerCase().includes(se))re.push(Y);else{var pe=[];(Y.children||[]).forEach(function(ce){ce.title.toLocaleLowerCase().includes(se)&&pe.push(ce)}),pe.length>0&&(re.push(g()(g()({},Y),{},{children:pe})),me.push(Y.key))}}),{tree:re,expandedKeys:me}}return{tree:ue,expandedKeys:me}}var ve=function(){var ue=(0,M.bx)(),me=ue.headerStyle,re=ue.isPhone,Y=ue.theme,pe=(0,t.useState)("\u8BF7\u9009\u62E9\u65E5\u5FD7\u6587\u4EF6"),ce=a()(pe,2),Se=ce[0],G=ce[1],Oe=(0,t.useState)("\u8BF7\u9009\u62E9\u65E5\u5FD7\u6587\u4EF6"),Pe=a()(Oe,2),J=Pe[0],xe=Pe[1],r=(0,t.useState)(),x=a()(r,2),O=x[0],m=x[1],T=(0,t.useState)([]),oe=a()(T,2),q=oe[0],de=oe[1],Q=(0,t.useState)([]),A=a()(Q,2),j=A[0],n=A[1],i=(0,t.useState)(!1),l=a()(i,2),c=l[0],p=l[1],P=(0,t.useState)(),o=a()(P,2),Z=o[0],S=o[1],F=(0,t.useRef)(),B=(0,t.useState)([]),$=a()(B,2),le=$[0],he=$[1],ge=function(){p(!0),y.W.get("".concat(s.Z.apiPrefix,"logs")).then(function(_){de(_.data),n(_.data)}).finally(function(){return p(!1)})},Ee=function(_){y.W.get("".concat(s.Z.apiPrefix,"logs/").concat(_.title,"?path=").concat(_.parent||"")).then(function(U){xe(U.data)})},z=function(_,U){U.key===O||!_||(xe("\u52A0\u8F7D\u4E2D..."),m(_),G(U.key),Ee(U))},W=(0,t.useCallback)(function(k,_){z(k[0],_.node)},[]),ee=(0,t.useCallback)(function(k){var _=k.target.value,U=w(_.toLocaleLowerCase(),q),te=U.tree,ie=U.expandedKeys;n(te),he(ie)},[q,n]);return(0,t.useEffect)(function(){ge(),F&&F.current&&S(F.current.clientHeight)},[]),(0,h.jsx)(v.ZP,{className:"ql-container-wrapper log-wrapper",title:Se,loading:c,extra:re&&[(0,h.jsx)(f.Z,{className:"log-select",value:O,dropdownStyle:{maxHeight:400,overflow:"auto"},treeData:q,placeholder:"\u8BF7\u9009\u62E9\u65E5\u5FD7",fieldNames:{value:"key",label:"title"},showSearch:!0,onSelect:z})],header:{style:me},children:(0,h.jsxs)("div",{className:"".concat(L["log-container"]," log-container"),children:[!re&&(0,h.jsxs)(K.Z,{split:"vertical",size:200,maxSize:-100,children:[(0,h.jsx)("div",{className:L["left-tree-container"],children:q.length>0?(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(D.Z.Search,{className:L["left-tree-search"],onChange:ee,placeholder:"\u8BF7\u8F93\u5165\u65E5\u5FD7\u540D",allowClear:!0}),(0,h.jsx)("div",{className:L["left-tree-scroller"],ref:F,children:(0,h.jsx)(E.Z,{className:L["left-tree"],treeData:j,showIcon:!0,height:Z,selectedKeys:[O],showLine:{showLeafIcon:!0},onSelect:W})})]}):(0,h.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100%"},children:(0,h.jsx)(C.Z,{description:"\u6682\u65E0\u65E5\u5FD7",image:C.Z.PRESENTED_IMAGE_SIMPLE})})}),(0,h.jsx)(N.ZP,{language:"shell",theme:Y,value:J,options:{readOnly:!0,fontSize:12,lineNumbersMinChars:3,fontFamily:"Source Code Pro",folding:!1,glyphMargin:!1,wordWrap:"on"}})]}),re&&(0,h.jsx)(ae.fk,{value:J,options:{lineNumbers:!0,lineWrapping:!0,styleActiveLine:!0,matchBrackets:!0,readOnly:!0},onBeforeChange:function(_,U,te){xe(te)},onChange:function(_,U,te){}})]})})},X=ve},98505:function(V,b){"use strict";b.Z={siteName:"\u9752\u9F99\u63A7\u5236\u9762\u677F",apiPrefix:"/api/",authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Portugu\xEAs",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:"\u4E2D\u6587",flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:"\u5B9A\u65F6\u4EFB\u52A1",value:"crons"},{name:"\u73AF\u5883\u53D8\u91CF",value:"envs"},{name:"\u8BA2\u9605\u7BA1\u7406",value:"subscriptions"},{name:"\u914D\u7F6E\u6587\u4EF6",value:"configs"},{name:"\u811A\u672C\u7BA1\u7406",value:"scripts"},{name:"\u4EFB\u52A1\u65E5\u5FD7",value:"logs"},{name:"\u4F9D\u8D56\u7BA1\u7406",value:"dependencies"},{name:"\u7CFB\u7EDF\u4FE1\u606F",value:"system"}],scopesMap:{crons:"\u5B9A\u65F6\u4EFB\u52A1",envs:"\u73AF\u5883\u53D8\u91CF",subscriptions:"\u8BA2\u9605\u7BA1\u7406",configs:"\u914D\u7F6E\u6587\u4EF6",scripts:"\u811A\u672C\u7BA1\u7406",logs:"\u4EFB\u52A1\u65E5\u5FD7",dependencies:"\u4F9D\u8D56\u7BA1\u7406",system:"\u7CFB\u7EDF\u4FE1\u606F"},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:"Server\u9171"},{value:"pushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:"Telegram\u673A\u5668\u4EBA"},{value:"dingtalkBot",label:"\u9489\u9489\u673A\u5668\u4EBA"},{value:"weWorkBot",label:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA"},{value:"weWorkApp",label:"\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528"},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"chat",label:"\u7FA4\u8F89chat"},{value:"email",label:"\u90AE\u7BB1"},{value:"webhook",label:"\u81EA\u5B9A\u4E49\u901A\u77E5"},{value:"closed",label:"\u5DF2\u5173\u95ED"}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:"gotify\u7684url\u5730\u5740,\u4F8B\u5982 https://push.example.de:8080",required:!0},{label:"gotifyToken",tip:"gotify\u7684\u6D88\u606F\u5E94\u7528token\u7801",required:!0},{label:"gotifyPriority",tip:"\u63A8\u9001\u6D88\u606F\u7684\u4F18\u5148\u7EA7"}],chat:[{label:"chatUrl",tip:"chat\u7684url\u5730\u5740",required:!0},{label:"chatToken",tip:"chat\u7684token\u7801",required:!0}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:"\u63A8\u9001\u5230\u4E2A\u4EBAQQ: http://127.0.0.1/send_private_msg\uFF0C\u7FA4\uFF1Ahttp://127.0.0.1/send_group_msg",required:!0},{label:"goCqHttpBotToken",tip:"\u8BBF\u95EE\u5BC6\u94A5",required:!0},{label:"goCqHttpBotQq",tip:"\u5982\u679CGOBOT_URL\u8BBE\u7F6E /send_private_msg \u5219\u9700\u8981\u586B\u5165 user_id=\u4E2A\u4EBAQQ \u76F8\u53CD\u5982\u679C\u662F /send_group_msg \u5219\u9700\u8981\u586B\u5165 group_id=QQ\u7FA4",required:!0}],serverChan:[{label:"serverChanKey",tip:"Server\u9171SENDKEY",required:!0}],pushDeer:[{label:"pushDeerKey",tip:"PushDeer\u7684Key\uFF0Chttps://github.com/easychen/pushdeer",required:!0}],bark:[{label:"barkPush",tip:"Bark\u7684\u4FE1\u606FIP/\u8BBE\u5907\u7801\uFF0C\u4F8B\u5982\uFF1Ahttps://api.day.app/XXXXXXXX",required:!0},{label:"barkIcon",tip:"BARK\u63A8\u9001\u56FE\u6807,\u81EA\u5B9A\u4E49\u63A8\u9001\u56FE\u6807 (\u9700iOS15\u6216\u4EE5\u4E0A\u624D\u80FD\u663E\u793A)"},{label:"barkSound",tip:"BARK\u63A8\u9001\u94C3\u58F0,\u94C3\u58F0\u5217\u8868\u53BBAPP\u67E5\u770B\u590D\u5236\u586B\u5199"},{label:"barkGroup",tip:"BARK\u63A8\u9001\u6D88\u606F\u7684\u5206\u7EC4, \u9ED8\u8BA4\u4E3Aqinglong"}],telegramBot:[{label:"telegramBotToken",tip:"telegram\u673A\u5668\u4EBA\u7684token\uFF0C\u4F8B\u5982\uFF1A1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw",required:!0},{label:"telegramBotUserId",tip:"telegram\u7528\u6237\u7684id\uFF0C\u4F8B\u5982\uFF1A129xxx206",required:!0},{label:"telegramBotProxyHost",tip:"\u4EE3\u7406IP"},{label:"telegramBotProxyPort",tip:"\u4EE3\u7406\u7AEF\u53E3"},{label:"telegramBotProxyAuth",tip:"telegram\u4EE3\u7406\u914D\u7F6E\u8BA4\u8BC1\u53C2\u6570, \u7528\u6237\u540D\u4E0E\u5BC6\u7801\u7528\u82F1\u6587\u5192\u53F7\u8FDE\u63A5 user:password"},{label:"telegramBotApiHost",tip:"telegram api\u81EA\u5EFA\u7684\u53CD\u5411\u4EE3\u7406\u5730\u5740\uFF0C\u9ED8\u8BA4tg\u5B98\u65B9api"}],dingtalkBot:[{label:"dingtalkBotToken",tip:"\u9489\u9489\u673A\u5668\u4EBAwebhook token\uFF0C\u4F8B\u5982\uFF1A5a544165465465645d0f31dca676e7bd07415asdasd",required:!0},{label:"dingtalkBotSecret",tip:"\u5BC6\u94A5\uFF0C\u673A\u5668\u4EBA\u5B89\u5168\u8BBE\u7F6E\u9875\u9762\uFF0C\u52A0\u7B7E\u4E00\u680F\u4E0B\u9762\u663E\u793A\u7684SEC\u5F00\u5934\u7684\u5B57\u7B26\u4E32"}],weWorkBot:[{label:"weWorkBotKey",tip:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7684 webhook(\u8BE6\u89C1\u6587\u6863 https://work.weixin.qq.com/api/doc/90000/90136/91770)\uFF0C\u4F8B\u5982\uFF1A693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa",required:!0}],weWorkApp:[{label:"weWorkAppKey",tip:"corpid,corpsecret,touser(\u6CE8:\u591A\u4E2A\u6210\u5458ID\u4F7F\u7528|\u9694\u5F00),agentid,\u6D88\u606F\u7C7B\u578B(\u9009\u586B,\u4E0D\u586B\u9ED8\u8BA4\u6587\u672C\u6D88\u606F\u7C7B\u578B) \u6CE8\u610F\u7528,\u53F7\u9694\u5F00(\u82F1\u6587\u8F93\u5165\u6CD5\u7684\u9017\u53F7)\uFF0C\u4F8B\u5982\uFF1Awwcfrs,B-76WERQ,qinglong,1000001,2COat",required:!0}],iGot:[{label:"iGotPushKey",tip:"iGot\u7684\u4FE1\u606F\u63A8\u9001key\uFF0C\u4F8B\u5982\uFF1Ahttps://push.hellyw.com/XXXXXXXX",required:!0}],pushPlus:[{label:"pushPlusToken",tip:"\u5FAE\u4FE1\u626B\u7801\u767B\u5F55\u540E\u4E00\u5BF9\u4E00\u63A8\u9001\u6216\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762\u7684token(\u60A8\u7684Token)\uFF0C\u4E0D\u63D0\u4F9BPUSH_PLUS_USER\u5219\u9ED8\u8BA4\u4E3A\u4E00\u5BF9\u4E00\u63A8\u9001\uFF0C\u53C2\u8003 https://www.pushplus.plus/",required:!0},{label:"pushPlusUser",tip:"\u4E00\u5BF9\u591A\u63A8\u9001\u7684\u201C\u7FA4\u7EC4\u7F16\u7801\u201D\uFF08\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762->\u60A8\u7684\u7FA4\u7EC4(\u5982\u65E0\u5219\u65B0\u5EFA)->\u7FA4\u7EC4\u7F16\u7801\uFF0C\u5982\u679C\u60A8\u662F\u521B\u5EFA\u7FA4\u7EC4\u4EBA\u3002\u4E5F\u9700\u70B9\u51FB\u201C\u67E5\u770B\u4E8C\u7EF4\u7801\u201D\u626B\u63CF\u7ED1\u5B9A\uFF0C\u5426\u5219\u4E0D\u80FD\u63A5\u53D7\u7FA4\u7EC4\u6D88\u606F\u63A8\u9001\uFF09"}],email:[{label:"emailService",tip:"\u90AE\u7BB1\u670D\u52A1\u540D\u79F0\uFF0C\u6BD4\u5982126\u3001163\u3001Gmail\u3001QQ\u7B49\uFF0C\u652F\u6301\u5217\u8868https://nodemailer.com/smtp/well-known/",required:!0},{label:"emailUser",tip:"\u90AE\u7BB1\u5730\u5740",required:!0},{label:"emailPass",tip:"\u90AE\u7BB1SMTP\u6388\u6743\u7801",required:!0}],webhook:[{label:"webhookMethod",tip:"\u8BF7\u6C42\u65B9\u6CD5",required:!0,items:[{value:"GET"},{value:"POST"},{value:"PUT"}]},{label:"webhookContentType",tip:"\u8BF7\u6C42\u5934Content-Type",required:!0,items:[{value:"application/json"},{value:"multipart/form-data"},{value:"application/x-www-form-urlencoded"}]},{label:"webhookUrl",tip:"\u8BF7\u6C42\u94FE\u63A5\u4EE5http\u6216\u8005https\u5F00\u5934\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",required:!0,placeholder:`https://xxx.cn/api?content=$title
`},{label:"webhookHeaders",tip:"\u8BF7\u6C42\u5934\u683C\u5F0FCustom-Header1: Header1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272",placeholder:`Custom-Header1: Header1
Custom-Header2: Header2`},{label:"webhookBody",tip:"\u8BF7\u6C42\u4F53\u683C\u5F0Fkey1: value1\uFF0C\u591A\u4E2A\u6362\u884C\u5206\u5272\u3002url\u6216\u8005body\u4E2D\u5FC5\u987B\u5305\u542B$title\uFF0C$content\u53EF\u9009\uFF0C\u5BF9\u5E94api\u5185\u5BB9\u7684\u4F4D\u7F6E",placeholder:`key1: $title
key2: $content`}]},documentTitleMap:{"/login":"\u767B\u5F55","/initialization":"\u521D\u59CB\u5316","/cron":"\u5B9A\u65F6\u4EFB\u52A1","/env":"\u73AF\u5883\u53D8\u91CF","/subscription":"\u8BA2\u9605\u7BA1\u7406","/config":"\u914D\u7F6E\u6587\u4EF6","/script":"\u811A\u672C\u7BA1\u7406","/diff":"\u5BF9\u6BD4\u5DE5\u5177","/log":"\u4EFB\u52A1\u65E5\u5FD7","/setting":"\u7CFB\u7EDF\u8BBE\u7F6E","/error":"\u9519\u8BEF\u65E5\u5FD7"},dependenceTypes:["nodejs","python3","linux"]}},51970:function(V,b,e){"use strict";e.d(b,{W:function(){return ae}});var u=e(35290),a=e.n(u),d=e(411),g=e.n(d),t=e(30279),f=e.n(t),D=e(50659),E=e(80743),C=e(98505),s=e(78722);E.ZP.config({duration:1.5});var v=Date.now(),N=function(M){if(M.response){var h=M.data?M.data.message||M.message||M.data:M.response.statusText,w=M.response.status;[502,504].includes(w)?s.m8.push("/error"):w===401?s.m8.location.pathname!=="/login"&&(E.ZP.error("\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55"),localStorage.removeItem(C.Z.authKey),s.m8.push("/login")):E.ZP.error(h)}else console.log(M.message);throw M},y=(0,D.l7)({timeout:6e4,params:{t:v},errorHandler:N}),L=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];y.interceptors.request.use(function(K,M){var h=localStorage.getItem(C.Z.authKey);if(h&&!L.includes(K)){var w={Authorization:"Bearer ".concat(h)};return{url:K,options:f()(f()({},M),{},{headers:w})}}return{url:K,options:M}}),y.interceptors.response.use(function(){var K=g()(a()().mark(function M(h){var w;return a()().wrap(function(X){for(;;)switch(X.prev=X.next){case 0:return X.next=2,h.clone();case 2:return w=X.sent,X.abrupt("return",h);case 4:case"end":return X.stop()}},M)}));return function(M){return K.apply(this,arguments)}}());var ae=y},3337:function(V,b,e){"use strict";var u=e(35931),a=e(63313),d=e.n(a),g=e(33552);b.Z=function(){var t=a.useState(!1),f=(0,u.Z)(t,2),D=f[0],E=f[1];return a.useEffect(function(){E((0,g.fk)())},[]),D}},67318:function(V,b,e){"use strict";e.d(b,{c4:function(){return d}});var u=e(47220),a=e(96600),d=["xxl","xl","lg","md","sm","xs"],g={xs:"(max-width: 575px)",sm:"(min-width: 576px)",md:"(min-width: 768px)",lg:"(min-width: 992px)",xl:"(min-width: 1200px)",xxl:"(min-width: 1600px)"},t=new Map,f=-1,D={},E={matchHandlers:{},dispatch:function(s){return D=s,t.forEach(function(v){return v(D)}),t.size>=1},subscribe:function(s){return t.size||this.register(),f+=1,t.set(f,s),s(D),f},unsubscribe:function(s){t.delete(s),t.size||this.unregister()},unregister:function(){var s=this;Object.keys(g).forEach(function(v){var N=g[v],y=s.matchHandlers[N];y==null||y.mql.removeListener(y==null?void 0:y.listener)}),t.clear()},register:function(){var s=this;Object.keys(g).forEach(function(v){var N=g[v],y=function(K){var M=K.matches;s.dispatch((0,a.Z)((0,a.Z)({},D),(0,u.Z)({},v,M)))},L=window.matchMedia(N);L.addListener(y),s.matchHandlers[N]={mql:L,listener:y},y(L)})}};b.ZP=E},33552:function(V,b,e){"use strict";e.d(b,{fk:function(){return g},jD:function(){return a}});var u=e(45235),a=function(){return(0,u.Z)()&&window.document.documentElement},d,g=function(){if(!a())return!1;if(d!==void 0)return d;var f=document.createElement("div");return f.style.display="flex",f.style.flexDirection="column",f.style.rowGap="1px",f.appendChild(document.createElement("div")),f.appendChild(document.createElement("div")),document.body.appendChild(f),d=f.scrollHeight===1,document.body.removeChild(f),d}},15578:function(V,b,e){"use strict";var u=e(96600),a=e(22899),d=e(63313),g=e.n(d),t=function(E,C){var s={};for(var v in E)Object.prototype.hasOwnProperty.call(E,v)&&C.indexOf(v)<0&&(s[v]=E[v]);if(E!=null&&typeof Object.getOwnPropertySymbols=="function")for(var N=0,v=Object.getOwnPropertySymbols(E);N<v.length;N++)C.indexOf(v[N])<0&&Object.prototype.propertyIsEnumerable.call(E,v[N])&&(s[v[N]]=E[v[N]]);return s},f={border:0,background:"transparent",padding:0,lineHeight:"inherit",display:"inline-block"},D=d.forwardRef(function(E,C){var s=function(h){var w=h.keyCode;w===a.Z.ENTER&&h.preventDefault()},v=function(h){var w=h.keyCode,ve=E.onClick;w===a.Z.ENTER&&ve&&ve()},N=E.style,y=E.noStyle,L=E.disabled,ae=t(E,["style","noStyle","disabled"]),K={};return y||(K=(0,u.Z)({},f)),L&&(K.pointerEvents="none"),K=(0,u.Z)((0,u.Z)({},K),N),d.createElement("div",(0,u.Z)({role:"button",tabIndex:0,ref:C},ae,{onKeyDown:s,onKeyUp:v,style:K}))});b.Z=D},2991:function(V,b,e){"use strict";e.d(b,{Z:function(){return xe}});var u=e(96600),a=e(47220),d=e(84875),g=e.n(d),t=e(63313),f=e(71010),D=e(19092),E=function(x){var O,m=(0,t.useContext)(f.E_),T=m.getPrefixCls,oe=m.direction,q=x.prefixCls,de=x.className,Q=de===void 0?"":de,A=T("input-group",q),j=g()(A,(O={},(0,a.Z)(O,"".concat(A,"-lg"),x.size==="large"),(0,a.Z)(O,"".concat(A,"-sm"),x.size==="small"),(0,a.Z)(O,"".concat(A,"-compact"),x.compact),(0,a.Z)(O,"".concat(A,"-rtl"),oe==="rtl"),O),Q),n=(0,t.useContext)(D.aM),i=(0,t.useMemo)(function(){return(0,u.Z)((0,u.Z)({},n),{isFormItemInput:!1})},[n]);return t.createElement("span",{className:j,style:x.style,onMouseEnter:x.onMouseEnter,onMouseLeave:x.onMouseLeave,onFocus:x.onFocus,onBlur:x.onBlur},t.createElement(D.aM.Provider,{value:i},x.children))},C=E,s=e(65918),v=e(35931),N=e(79105),y={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z"}},{tag:"path",attrs:{d:"M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z"}}]},name:"eye-invisible",theme:"outlined"},L=y,ae=e(17980),K=function(x,O){return t.createElement(ae.Z,(0,N.Z)((0,N.Z)({},x),{},{ref:O,icon:L}))};K.displayName="EyeInvisibleOutlined";var M=t.forwardRef(K),h=e(82166),w=e(1334),ve=function(r,x){var O={};for(var m in r)Object.prototype.hasOwnProperty.call(r,m)&&x.indexOf(m)<0&&(O[m]=r[m]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var T=0,m=Object.getOwnPropertySymbols(r);T<m.length;T++)x.indexOf(m[T])<0&&Object.prototype.propertyIsEnumerable.call(r,m[T])&&(O[m[T]]=r[m[T]]);return O},X={click:"onClick",hover:"onMouseOver"},se=t.forwardRef(function(r,x){var O=(0,t.useState)(!1),m=(0,v.Z)(O,2),T=m[0],oe=m[1],q=function(){var j=r.disabled;j||oe(!T)},de=function(j){var n,i=r.action,l=r.iconRender,c=l===void 0?function(){return null}:l,p=X[i]||"",P=c(T),o=(n={},(0,a.Z)(n,p,q),(0,a.Z)(n,"className","".concat(j,"-icon")),(0,a.Z)(n,"key","passwordIcon"),(0,a.Z)(n,"onMouseDown",function(S){S.preventDefault()}),(0,a.Z)(n,"onMouseUp",function(S){S.preventDefault()}),n);return t.cloneElement(t.isValidElement(P)?P:t.createElement("span",null,P),o)},Q=function(j){var n=j.getPrefixCls,i=r.className,l=r.prefixCls,c=r.inputPrefixCls,p=r.size,P=r.visibilityToggle,o=ve(r,["className","prefixCls","inputPrefixCls","size","visibilityToggle"]),Z=n("input",c),S=n("input-password",l),F=P&&de(S),B=g()(S,i,(0,a.Z)({},"".concat(S,"-").concat(p),!!p)),$=(0,u.Z)((0,u.Z)({},(0,w.Z)(o,["suffix","iconRender"])),{type:T?"text":"password",className:B,prefixCls:Z,suffix:F});return p&&($.size=p),t.createElement(s.ZP,(0,u.Z)({ref:x},$))};return t.createElement(f.C,null,Q)});se.defaultProps={action:"click",visibilityToggle:!0,iconRender:function(x){return x?t.createElement(h.Z,null):t.createElement(M,null)}};var ue=se,me=e(15258),re=e(4385),Y=e(74309),pe=e(59418),ce=e(51472),Se=function(r,x){var O={};for(var m in r)Object.prototype.hasOwnProperty.call(r,m)&&x.indexOf(m)<0&&(O[m]=r[m]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var T=0,m=Object.getOwnPropertySymbols(r);T<m.length;T++)x.indexOf(m[T])<0&&Object.prototype.propertyIsEnumerable.call(r,m[T])&&(O[m[T]]=r[m[T]]);return O},G=t.forwardRef(function(r,x){var O,m=r.prefixCls,T=r.inputPrefixCls,oe=r.className,q=r.size,de=r.suffix,Q=r.enterButton,A=Q===void 0?!1:Q,j=r.addonAfter,n=r.loading,i=r.disabled,l=r.onSearch,c=r.onChange,p=r.onCompositionStart,P=r.onCompositionEnd,o=Se(r,["prefixCls","inputPrefixCls","className","size","suffix","enterButton","addonAfter","loading","disabled","onSearch","onChange","onCompositionStart","onCompositionEnd"]),Z=t.useContext(f.E_),S=Z.getPrefixCls,F=Z.direction,B=t.useContext(pe.Z),$=t.useRef(!1),le=q||B,he=t.useRef(null),ge=function(I){I&&I.target&&I.type==="click"&&l&&l(I.target.value,I),c&&c(I)},Ee=function(I){var R;document.activeElement===((R=he.current)===null||R===void 0?void 0:R.input)&&I.preventDefault()},z=function(I){var R,H;l&&l((H=(R=he.current)===null||R===void 0?void 0:R.input)===null||H===void 0?void 0:H.value,I)},W=function(I){$.current||z(I)},ee=S("input-search",m),k=S("input",T),_=typeof A=="boolean"?t.createElement(me.Z,null):null,U="".concat(ee,"-button"),te,ie=A||{},Me=ie.type&&ie.type.__ANT_BUTTON===!0;Me||ie.type==="button"?te=(0,ce.Tm)(ie,(0,u.Z)({onMouseDown:Ee,onClick:function(I){var R,H;(H=(R=ie==null?void 0:ie.props)===null||R===void 0?void 0:R.onClick)===null||H===void 0||H.call(R,I),z(I)},key:"enterButton"},Me?{className:U,size:le}:{})):te=t.createElement(Y.Z,{className:U,type:A?"primary":void 0,size:le,disabled:i,key:"enterButton",onMouseDown:Ee,onClick:z,loading:n,icon:_},A),j&&(te=[te,(0,ce.Tm)(j,{key:"addonAfter"})]);var De=g()(ee,(O={},(0,a.Z)(O,"".concat(ee,"-rtl"),F==="rtl"),(0,a.Z)(O,"".concat(ee,"-").concat(le),!!le),(0,a.Z)(O,"".concat(ee,"-with-button"),!!A),O),oe),Ie=function(I){$.current=!0,p==null||p(I)},be=function(I){$.current=!1,P==null||P(I)};return t.createElement(s.ZP,(0,u.Z)({ref:(0,re.sQ)(he,x),onPressEnter:W},o,{size:le,onCompositionStart:Ie,onCompositionEnd:be,prefixCls:k,addonAfter:te,suffix:de,onChange:ge,className:De,disabled:i}))}),Oe=G,Pe=e(13516),J=s.ZP;J.Group=C,J.Search=Oe,J.TextArea=Pe.Z,J.Password=ue;var xe=J},30315:function(V,b,e){"use strict";e.d(b,{Z:function(){return j}});var u=e(47220),a=e(92022),d=e(96600),g=e(79105),t=e(63313),f=e.n(t),D={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M300 276.5a56 56 0 1056-97 56 56 0 00-56 97zm0 284a56 56 0 1056-97 56 56 0 00-56 97zM640 228a56 56 0 10112 0 56 56 0 00-112 0zm0 284a56 56 0 10112 0 56 56 0 00-112 0zM300 844.5a56 56 0 1056-97 56 56 0 00-56 97zM640 796a56 56 0 10112 0 56 56 0 00-112 0z"}}]},name:"holder",theme:"outlined"},E=D,C=e(17980),s=function(i,l){return t.createElement(C.Z,(0,g.Z)((0,g.Z)({},i),{},{ref:l,icon:E}))};s.displayName="HolderOutlined";var v=t.forwardRef(s),N=e(84875),y=e.n(N),L=e(43378),ae=e(71010),K=e(93600),M=e(3164),h=e(35931),w=e(98495),ve={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2a8.15 8.15 0 00-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zM136 256h188.5l119.6 114.4H748V444H238c-13 0-24.8 7.9-29.7 20L136 643.2V256zm635.3 512H159l103.3-256h612.4L771.3 768z"}}]},name:"folder-open",theme:"outlined"},X=ve,se=function(i,l){return t.createElement(C.Z,(0,g.Z)((0,g.Z)({},i),{},{ref:l,icon:X}))};se.displayName="FolderOpenOutlined";var ue=t.forwardRef(se),me={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M880 298.4H521L403.7 186.2a8.15 8.15 0 00-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z"}}]},name:"folder",theme:"outlined"},re=me,Y=function(i,l){return t.createElement(C.Z,(0,g.Z)((0,g.Z)({},i),{},{ref:l,icon:re}))};Y.displayName="FolderOutlined";var pe=t.forwardRef(Y),ce=e(61525),Se=e(89190),G;(function(n){n[n.None=0]="None",n[n.Start=1]="Start",n[n.End=2]="End"})(G||(G={}));function Oe(n,i){function l(c){var p=c.key,P=c.children;i(p,c)!==!1&&Oe(P||[],i)}n.forEach(l)}function Pe(n){var i=n.treeData,l=n.expandedKeys,c=n.startKey,p=n.endKey,P=[],o=G.None;if(c&&c===p)return[c];if(!c||!p)return[];function Z(S){return S===c||S===p}return Oe(i,function(S){if(o===G.End)return!1;if(Z(S)){if(P.push(S),o===G.None)o=G.Start;else if(o===G.Start)return o=G.End,!1}else o===G.Start&&P.push(S);return l.indexOf(S)!==-1}),P}function J(n,i){var l=(0,M.Z)(i),c=[];return Oe(n,function(p,P){var o=l.indexOf(p);return o!==-1&&(c.push(P),l.splice(o,1)),!!l.length}),c}var xe=function(n,i){var l={};for(var c in n)Object.prototype.hasOwnProperty.call(n,c)&&i.indexOf(c)<0&&(l[c]=n[c]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var p=0,c=Object.getOwnPropertySymbols(n);p<c.length;p++)i.indexOf(c[p])<0&&Object.prototype.propertyIsEnumerable.call(n,c[p])&&(l[c[p]]=n[c[p]]);return l};function r(n){var i=n.isLeaf,l=n.expanded;return i?t.createElement(w.Z,null):l?t.createElement(ue,null):t.createElement(pe,null)}function x(n){var i=n.treeData,l=n.children;return i||(0,Se.zn)(l)}var O=function(i,l){var c=i.defaultExpandAll,p=i.defaultExpandParent,P=i.defaultExpandedKeys,o=xe(i,["defaultExpandAll","defaultExpandParent","defaultExpandedKeys"]),Z=t.useRef(),S=t.useRef(),F=t.createRef();t.useImperativeHandle(l,function(){return F.current});var B=function(){var R=(0,Se.I8)(x(o)),H=R.keyEntities,ne;return c?ne=Object.keys(H):p?ne=(0,ce.r7)(o.expandedKeys||P||[],H):ne=o.expandedKeys||P,ne},$=t.useState(o.selectedKeys||o.defaultSelectedKeys||[]),le=(0,h.Z)($,2),he=le[0],ge=le[1],Ee=t.useState(B()),z=(0,h.Z)(Ee,2),W=z[0],ee=z[1];t.useEffect(function(){"selectedKeys"in o&&ge(o.selectedKeys)},[o.selectedKeys]),t.useEffect(function(){"expandedKeys"in o&&ee(o.expandedKeys)},[o.expandedKeys]);var k=function(R,H){var ne;return"expandedKeys"in o||ee(R),(ne=o.onExpand)===null||ne===void 0?void 0:ne.call(o,R,H)},_=function(R,H){var ne,Ke=o.multiple,Ze=H.node,ye=H.nativeEvent,Ae=Ze.key,_e=Ae===void 0?"":Ae,Ne=x(o),Te=(0,d.Z)((0,d.Z)({},H),{selected:!0}),Re=(ye==null?void 0:ye.ctrlKey)||(ye==null?void 0:ye.metaKey),Le=ye==null?void 0:ye.shiftKey,fe;Ke&&Re?(fe=R,Z.current=_e,S.current=fe,Te.selectedNodes=J(Ne,fe)):Ke&&Le?(fe=Array.from(new Set([].concat((0,M.Z)(S.current||[]),(0,M.Z)(Pe({treeData:Ne,expandedKeys:W,startKey:_e,endKey:Z.current}))))),Te.selectedNodes=J(Ne,fe)):(fe=[_e],Z.current=_e,S.current=fe,Te.selectedNodes=J(Ne,fe)),(ne=o.onSelect)===null||ne===void 0||ne.call(o,fe,Te),"selectedKeys"in o||ge(fe)},U=t.useContext(ae.E_),te=U.getPrefixCls,ie=U.direction,Me=o.prefixCls,De=o.className,Ie=xe(o,["prefixCls","className"]),be=te("tree",Me),Ce=y()("".concat(be,"-directory"),(0,u.Z)({},"".concat(be,"-directory-rtl"),ie==="rtl"),De);return t.createElement(A,(0,d.Z)({icon:r,ref:F,blockNode:!0},Ie,{prefixCls:be,className:Ce,expandedKeys:W,selectedKeys:he,onSelect:_,onExpand:k}))},m=t.forwardRef(O);m.defaultProps={showIcon:!0,expandAction:"click"};var T=m,oe=4;function q(n){var i,l=n.dropPosition,c=n.dropLevelOffset,p=n.prefixCls,P=n.indent,o=n.direction,Z=o===void 0?"ltr":o,S=Z==="ltr"?"left":"right",F=Z==="ltr"?"right":"left",B=(i={},(0,u.Z)(i,S,-c*P+oe),(0,u.Z)(i,F,0),i);switch(l){case-1:B.top=-3;break;case 1:B.bottom=-3;break;default:B.bottom=-3,B[S]=P+oe;break}return f().createElement("div",{style:B,className:"".concat(p,"-drop-indicator")})}var de=e(80446),Q=t.forwardRef(function(n,i){var l,c=t.useContext(ae.E_),p=c.getPrefixCls,P=c.direction,o=c.virtual,Z=n.prefixCls,S=n.className,F=n.showIcon,B=n.showLine,$=n.switcherIcon,le=n.blockNode,he=n.children,ge=n.checkable,Ee=n.selectable,z=n.draggable,W=p("tree",Z),ee=(0,d.Z)((0,d.Z)({},n),{showLine:Boolean(B),dropIndicatorRender:q}),k=t.useMemo(function(){if(!z)return!1;var _={};switch((0,a.Z)(z)){case"function":_.nodeDraggable=z;break;case"object":_=(0,d.Z)({},z);break;default:}return _.icon!==!1&&(_.icon=_.icon||t.createElement(v,null)),_},[z]);return t.createElement(L.Z,(0,d.Z)({itemHeight:20,ref:i,virtual:o},ee,{prefixCls:W,className:y()((l={},(0,u.Z)(l,"".concat(W,"-icon-hide"),!F),(0,u.Z)(l,"".concat(W,"-block-node"),le),(0,u.Z)(l,"".concat(W,"-unselectable"),!Ee),(0,u.Z)(l,"".concat(W,"-rtl"),P==="rtl"),l),S),direction:P,checkable:ge&&t.createElement("span",{className:"".concat(W,"-checkbox-inner")}),selectable:Ee,switcherIcon:function(U){return(0,de.Z)(W,$,B,U)},draggable:k}),he)});Q.TreeNode=L.O,Q.DirectoryTree=T,Q.defaultProps={checkable:!1,selectable:!0,showIcon:!1,motion:(0,d.Z)((0,d.Z)({},K.ZP),{motionAppear:!1}),blockNode:!1};var A=Q,j=A},22899:function(V,b){"use strict";var e={MAC_ENTER:3,BACKSPACE:8,TAB:9,NUM_CENTER:12,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE:19,CAPS_LOCK:20,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,PRINT_SCREEN:44,INSERT:45,DELETE:46,ZERO:48,ONE:49,TWO:50,THREE:51,FOUR:52,FIVE:53,SIX:54,SEVEN:55,EIGHT:56,NINE:57,QUESTION_MARK:63,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,META:91,WIN_KEY_RIGHT:92,CONTEXT_MENU:93,NUM_ZERO:96,NUM_ONE:97,NUM_TWO:98,NUM_THREE:99,NUM_FOUR:100,NUM_FIVE:101,NUM_SIX:102,NUM_SEVEN:103,NUM_EIGHT:104,NUM_NINE:105,NUM_MULTIPLY:106,NUM_PLUS:107,NUM_MINUS:109,NUM_PERIOD:110,NUM_DIVISION:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SEMICOLON:186,DASH:189,EQUALS:187,COMMA:188,PERIOD:190,SLASH:191,APOSTROPHE:192,SINGLE_QUOTE:222,OPEN_SQUARE_BRACKET:219,BACKSLASH:220,CLOSE_SQUARE_BRACKET:221,WIN_KEY:224,MAC_FF_META:224,WIN_IME:229,isTextModifyingKeyEvent:function(a){var d=a.keyCode;if(a.altKey&&!a.ctrlKey||a.metaKey||d>=e.F1&&d<=e.F12)return!1;switch(d){case e.ALT:case e.CAPS_LOCK:case e.CONTEXT_MENU:case e.CTRL:case e.DOWN:case e.END:case e.ESC:case e.HOME:case e.INSERT:case e.LEFT:case e.MAC_FF_META:case e.META:case e.NUMLOCK:case e.NUM_CENTER:case e.PAGE_DOWN:case e.PAGE_UP:case e.PAUSE:case e.PRINT_SCREEN:case e.RIGHT:case e.SHIFT:case e.UP:case e.WIN_KEY:case e.WIN_KEY_RIGHT:return!1;default:return!0}},isCharacterKey:function(a){if(a>=e.ZERO&&a<=e.NINE||a>=e.NUM_ZERO&&a<=e.NUM_MULTIPLY||a>=e.A&&a<=e.Z||window.navigator.userAgent.indexOf("WebKit")!==-1&&a===0)return!0;switch(a){case e.SPACE:case e.QUESTION_MARK:case e.NUM_PLUS:case e.NUM_MINUS:case e.NUM_PERIOD:case e.NUM_DIVISION:case e.SEMICOLON:case e.DASH:case e.EQUALS:case e.COMMA:case e.PERIOD:case e.SLASH:case e.APOSTROPHE:case e.SINGLE_QUOTE:case e.OPEN_SQUARE_BRACKET:case e.BACKSLASH:case e.CLOSE_SQUARE_BRACKET:return!0;default:return!1}}};b.Z=e},44549:function(V,b,e){"use strict";e.d(b,{Z:function(){return E}});var u=e(79105),a=`accept acceptCharset accessKey action allowFullScreen allowTransparency
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
    summary tabIndex target title type useMap value width wmode wrap`,d=`onCopy onCut onPaste onCompositionEnd onCompositionStart onCompositionUpdate onKeyDown
    onKeyPress onKeyUp onFocus onBlur onChange onInput onSubmit onClick onContextMenu onDoubleClick
    onDrag onDragEnd onDragEnter onDragExit onDragLeave onDragOver onDragStart onDrop onMouseDown
    onMouseEnter onMouseLeave onMouseMove onMouseOut onMouseOver onMouseUp onSelect onTouchCancel
    onTouchEnd onTouchMove onTouchStart onScroll onWheel onAbort onCanPlay onCanPlayThrough
    onDurationChange onEmptied onEncrypted onEnded onError onLoadedData onLoadedMetadata
    onLoadStart onPause onPlay onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend onTimeUpdate onVolumeChange onWaiting onLoad onError`,g="".concat(a," ").concat(d).split(/[\s\n]+/),t="aria-",f="data-";function D(C,s){return C.indexOf(s)===0}function E(C){var s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,v;s===!1?v={aria:!0,data:!0,attr:!0}:s===!0?v={aria:!0}:v=(0,u.Z)({},s);var N={};return Object.keys(C).forEach(function(y){(v.aria&&(y==="role"||D(y,t))||v.data&&D(y,f)||v.attr&&g.includes(y))&&(N[y]=C[y])}),N}},71129:function(){}}]);