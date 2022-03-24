(self.webpackChunk=self.webpackChunk||[]).push([[8851],{95357:function(X,m,e){"use strict";e.d(m,{Z:function(){return D}});var E=e(28991),i=e(12924),l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"}}]},name:"eye",theme:"outlined"},b=l,x=e(27029),_=function(v,C){return i.createElement(x.Z,(0,E.Z)((0,E.Z)({},v),{},{ref:C,icon:b}))};_.displayName="EyeOutlined";var D=i.forwardRef(_)},22231:function(X,m,e){"use strict";e.d(m,{m:function(){return E.m}});var E=e(9684),i=e(72255)},20475:function(X,m,e){"use strict";e.r(m);var E=e(71194),i=e(48889),l=e(47673),b=e(32787),x=e(34792),_=e(55026),D=e(8870),R=e(3182),v=e(9715),C=e(92080),W=e(57337),K=e(94043),z=e.n(K),B=e(12924),d=e.n(B),s=e(35348),P=e(49102),h=N=>{var f=N.file,ee=N.handleCancel,Q=N.visible,ie=C.Z.useForm(),se=(0,W.Z)(ie,1),te=se[0],ne=(0,B.useState)(!1),ae=(0,W.Z)(ne,2),me=ae[0],H=ae[1],re=function(){var ue=(0,R.Z)(z().mark(function Z(le){var t;return z().wrap(function(a){for(;;)switch(a.prev=a.next){case 0:H(!0),t=(0,D.Z)((0,D.Z)({},f),le),s.W.post("".concat(P.Z.apiPrefix,"scripts"),{data:t}).then(n=>{var o=n.code,I=n.data;o===200?(_.ZP.success("\u4FDD\u5B58\u6587\u4EF6\u6210\u529F"),ee(I)):_.ZP.error(I),H(!1)});case 3:case"end":return a.stop()}},Z)}));return function(le){return ue.apply(this,arguments)}}();return(0,B.useEffect)(()=>{te.resetFields(),H(!1)},[f,Q]),d().createElement(i.Z,{title:"\u8FD0\u884C\u8BBE\u7F6E",visible:Q,forceRender:!0,onCancel:()=>ee()},d().createElement(C.Z,{form:te,layout:"vertical",name:"setting_modal",initialValues:f},d().createElement(C.Z.Item,{name:"filename",label:"\u5F85\u5F00\u53D1",rules:[{required:!0,message:"\u5F85\u5F00\u53D1"}]},d().createElement(b.Z,{placeholder:"\u5F85\u5F00\u53D1"}))))};m.default=h},49102:function(X,m){"use strict";m.Z={siteName:"\u9752\u9F99\u63A7\u5236\u9762\u677F",apiPrefix:"/api/",authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Portugu\xEAs",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:"\u4E2D\u6587",flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:"\u5B9A\u65F6\u4EFB\u52A1",value:"crons"},{name:"\u73AF\u5883\u53D8\u91CF",value:"envs"},{name:"\u914D\u7F6E\u6587\u4EF6",value:"configs"},{name:"\u811A\u672C\u7BA1\u7406",value:"scripts"},{name:"\u4EFB\u52A1\u65E5\u5FD7",value:"logs"},{name:"\u4F9D\u8D56\u7BA1\u7406",value:"dependencies"},{name:"\u7CFB\u7EDF\u4FE1\u606F",value:"system"}],scopesMap:{crons:"\u5B9A\u65F6\u4EFB\u52A1",envs:"\u73AF\u5883\u53D8\u91CF",configs:"\u914D\u7F6E\u6587\u4EF6",scripts:"\u811A\u672C\u7BA1\u7406",logs:"\u4EFB\u52A1\u65E5\u5FD7",dependencies:"\u4F9D\u8D56\u7BA1\u7406",system:"\u7CFB\u7EDF\u4FE1\u606F"},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:"Server\u9171"},{value:"PushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:"Telegram\u673A\u5668\u4EBA"},{value:"dingtalkBot",label:"\u9489\u9489\u673A\u5668\u4EBA"},{value:"weWorkBot",label:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA"},{value:"weWorkApp",label:"\u4F01\u4E1A\u5FAE\u4FE1\u5E94\u7528"},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"email",label:"\u90AE\u7BB1"},{value:"closed",label:"\u5DF2\u5173\u95ED"}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:"gotify\u7684url\u5730\u5740,\u4F8B\u5982 https://push.example.de:8080",required:!0},{label:"gotifyToken",tip:"gotify\u7684\u6D88\u606F\u5E94\u7528token\u7801",required:!0},{label:"gotifyPriority",tip:"\u63A8\u9001\u6D88\u606F\u7684\u4F18\u5148\u7EA7"}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:"\u63A8\u9001\u5230\u4E2A\u4EBAQQ: http://127.0.0.1/send_private_msg\uFF0C\u7FA4\uFF1Ahttp://127.0.0.1/send_group_msg",required:!0},{label:"goCqHttpBotToken",tip:"\u8BBF\u95EE\u5BC6\u94A5",required:!0},{label:"goCqHttpBotQq",tip:"\u5982\u679CGOBOT_URL\u8BBE\u7F6E /send_private_msg \u5219\u9700\u8981\u586B\u5165 user_id=\u4E2A\u4EBAQQ \u76F8\u53CD\u5982\u679C\u662F /send_group_msg \u5219\u9700\u8981\u586B\u5165 group_id=QQ\u7FA4",required:!0}],serverChan:[{label:"serverChanKey",tip:"Server\u9171SENDKEY",required:!0}],PushDeer:[{label:"PushDeerKey",tip:"PushDeer\u7684Key",required:!0}],bark:[{label:"barkPush",tip:"Bark\u7684\u4FE1\u606FIP/\u8BBE\u5907\u7801\uFF0C\u4F8B\u5982\uFF1Ahttps://api.day.app/XXXXXXXX",required:!0},{label:"barkIcon",tip:"BARK\u63A8\u9001\u56FE\u6807,\u81EA\u5B9A\u4E49\u63A8\u9001\u56FE\u6807 (\u9700iOS15\u6216\u4EE5\u4E0A\u624D\u80FD\u663E\u793A)"},{label:"barkSound",tip:"BARK\u63A8\u9001\u94C3\u58F0,\u94C3\u58F0\u5217\u8868\u53BBAPP\u67E5\u770B\u590D\u5236\u586B\u5199"},{label:"barkGroup",tip:"BARK\u63A8\u9001\u6D88\u606F\u7684\u5206\u7EC4, \u9ED8\u8BA4\u4E3Aqinglong"}],telegramBot:[{label:"telegramBotToken",tip:"telegram\u673A\u5668\u4EBA\u7684token\uFF0C\u4F8B\u5982\uFF1A1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw",required:!0},{label:"telegramBotUserId",tip:"telegram\u7528\u6237\u7684id\uFF0C\u4F8B\u5982\uFF1A129xxx206",required:!0},{label:"telegramBotProxyHost",tip:"\u4EE3\u7406IP"},{label:"telegramBotProxyPort",tip:"\u4EE3\u7406\u7AEF\u53E3"},{label:"telegramBotProxyAuth",tip:"telegram\u4EE3\u7406\u914D\u7F6E\u8BA4\u8BC1\u53C2\u6570, \u7528\u6237\u540D\u4E0E\u5BC6\u7801\u7528\u82F1\u6587\u5192\u53F7\u8FDE\u63A5 user:password"},{label:"telegramBotApiHost",tip:"telegram api\u81EA\u5EFA\u7684\u53CD\u5411\u4EE3\u7406\u5730\u5740\uFF0C\u9ED8\u8BA4tg\u5B98\u65B9api"}],dingtalkBot:[{label:"dingtalkBotToken",tip:"\u9489\u9489\u673A\u5668\u4EBAwebhook token\uFF0C\u4F8B\u5982\uFF1A5a544165465465645d0f31dca676e7bd07415asdasd",required:!0},{label:"dingtalkBotSecret",tip:"\u5BC6\u94A5\uFF0C\u673A\u5668\u4EBA\u5B89\u5168\u8BBE\u7F6E\u9875\u9762\uFF0C\u52A0\u7B7E\u4E00\u680F\u4E0B\u9762\u663E\u793A\u7684SEC\u5F00\u5934\u7684\u5B57\u7B26\u4E32"}],weWorkBot:[{label:"weWorkBotKey",tip:"\u4F01\u4E1A\u5FAE\u4FE1\u673A\u5668\u4EBA\u7684 webhook(\u8BE6\u89C1\u6587\u6863 https://work.weixin.qq.com/api/doc/90000/90136/91770)\uFF0C\u4F8B\u5982\uFF1A693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa",required:!0}],weWorkApp:[{label:"weWorkAppKey",tip:"corpid,corpsecret,touser(\u6CE8:\u591A\u4E2A\u6210\u5458ID\u4F7F\u7528|\u9694\u5F00),agentid,\u6D88\u606F\u7C7B\u578B(\u9009\u586B,\u4E0D\u586B\u9ED8\u8BA4\u6587\u672C\u6D88\u606F\u7C7B\u578B) \u6CE8\u610F\u7528,\u53F7\u9694\u5F00(\u82F1\u6587\u8F93\u5165\u6CD5\u7684\u9017\u53F7)\uFF0C\u4F8B\u5982\uFF1Awwcfrs,B-76WERQ,qinglong,1000001,2COat",required:!0}],iGot:[{label:"iGotPushKey",tip:"iGot\u7684\u4FE1\u606F\u63A8\u9001key\uFF0C\u4F8B\u5982\uFF1Ahttps://push.hellyw.com/XXXXXXXX",required:!0}],pushPlus:[{label:"pushPlusToken",tip:"\u5FAE\u4FE1\u626B\u7801\u767B\u5F55\u540E\u4E00\u5BF9\u4E00\u63A8\u9001\u6216\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762\u7684token(\u60A8\u7684Token)\uFF0C\u4E0D\u63D0\u4F9BPUSH_PLUS_USER\u5219\u9ED8\u8BA4\u4E3A\u4E00\u5BF9\u4E00\u63A8\u9001",required:!0},{label:"pushPlusUser",tip:"\u4E00\u5BF9\u591A\u63A8\u9001\u7684\u201C\u7FA4\u7EC4\u7F16\u7801\u201D\uFF08\u4E00\u5BF9\u591A\u63A8\u9001\u4E0B\u9762->\u60A8\u7684\u7FA4\u7EC4(\u5982\u65E0\u5219\u65B0\u5EFA)->\u7FA4\u7EC4\u7F16\u7801\uFF0C\u5982\u679C\u60A8\u662F\u521B\u5EFA\u7FA4\u7EC4\u4EBA\u3002\u4E5F\u9700\u70B9\u51FB\u201C\u67E5\u770B\u4E8C\u7EF4\u7801\u201D\u626B\u63CF\u7ED1\u5B9A\uFF0C\u5426\u5219\u4E0D\u80FD\u63A5\u53D7\u7FA4\u7EC4\u6D88\u606F\u63A8\u9001\uFF09"}],email:[{label:"emailService",tip:"\u90AE\u7BB1\u670D\u52A1\u540D\u79F0\uFF0C\u6BD4\u5982126\u3001163\u3001Gmail\u3001QQ\u7B49\uFF0C\u652F\u6301\u5217\u8868https://nodemailer.com/smtp/well-known/",required:!0},{label:"emailUser",tip:"\u90AE\u7BB1\u5730\u5740",required:!0},{label:"emailPass",tip:"\u90AE\u7BB1SMTP\u6388\u6743\u7801",required:!0}]},documentTitleMap:{"/login":"\u767B\u5F55","/initialization":"\u521D\u59CB\u5316","/cron":"\u5B9A\u65F6\u4EFB\u52A1","/env":"\u73AF\u5883\u53D8\u91CF","/config":"\u914D\u7F6E\u6587\u4EF6","/script":"\u811A\u672C\u7BA1\u7406","/diff":"\u5BF9\u6BD4\u5DE5\u5177","/log":"\u4EFB\u52A1\u65E5\u5FD7","/setting":"\u7CFB\u7EDF\u8BBE\u7F6E","/error":"\u9519\u8BEF\u65E5\u5FD7"},dependenceTypes:["nodejs","python3","linux"]}},35348:function(X,m,e){"use strict";e.d(m,{W:function(){return B}});var E=e(3182),i=e(8870),l=e(34792),b=e(55026),x=e(94043),_=e.n(x),D=e(11238),R=e(49102),v=e(22231);b.ZP.config({duration:1.5});var C=Date.now(),W=function(s){if(s.response){var P=s.data?s.data.message||s.data:s.response.statusText,h=s.response.status;[502,504].includes(h)?v.m.push("/error"):h===401?v.m.location.pathname!=="/login"&&(b.ZP.error("\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55"),localStorage.removeItem(R.Z.authKey),v.m.push("/login")):b.ZP.error(P)}else console.log(s.message);throw s},K=(0,D.l7)({timeout:6e4,params:{t:C},errorHandler:W}),z=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];K.interceptors.request.use((d,s)=>{var P=localStorage.getItem(R.Z.authKey);if(P&&!z.includes(d)){var h={Authorization:"Bearer ".concat(P)};return{url:d,options:(0,i.Z)((0,i.Z)({},s),{},{headers:h})}}return{url:d,options:s}}),K.interceptors.response.use(function(){var d=(0,E.Z)(_().mark(function s(P){var h;return _().wrap(function(f){for(;;)switch(f.prev=f.next){case 0:return f.next=2,P.clone();case 2:return h=f.sent,f.abrupt("return",P);case 4:case"end":return f.stop()}},s)}));return function(s){return d.apply(this,arguments)}}());var B=K},32787:function(X,m,e){"use strict";e.d(m,{Z:function(){return le}});var E=e(89802),i=e(96156),l=e(12924),b=e(94184),x=e.n(b),_=e(65632),D=function(r){var a,n=(0,l.useContext)(_.E_),o=n.getPrefixCls,I=n.direction,q=r.prefixCls,w=r.className,k=w===void 0?"":w,u=o("input-group",q),y=x()(u,(a={},(0,i.Z)(a,"".concat(u,"-lg"),r.size==="large"),(0,i.Z)(a,"".concat(u,"-sm"),r.size==="small"),(0,i.Z)(a,"".concat(u,"-compact"),r.compact),(0,i.Z)(a,"".concat(u,"-rtl"),I==="rtl"),a),k);return l.createElement("span",{className:y,style:r.style,onMouseEnter:r.onMouseEnter,onMouseLeave:r.onMouseLeave,onFocus:r.onFocus,onBlur:r.onBlur},r.children)},R=D,v=e(22122),C=e(42550),W=e(76570),K=e(71577),z=e(97647),B=e(96159),d=function(t,r){var a={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&r.indexOf(n)<0&&(a[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(t);o<n.length;o++)r.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(t,n[o])&&(a[n[o]]=t[n[o]]);return a},s=l.forwardRef(function(t,r){var a,n=t.prefixCls,o=t.inputPrefixCls,I=t.className,q=t.size,w=t.suffix,k=t.enterButton,u=k===void 0?!1:k,y=t.addonAfter,g=t.loading,j=t.disabled,O=t.onSearch,G=t.onChange,A=d(t,["prefixCls","inputPrefixCls","className","size","suffix","enterButton","addonAfter","loading","disabled","onSearch","onChange"]),T=l.useContext(_.E_),F=T.getPrefixCls,$=T.direction,M=l.useContext(z.Z),L=q||M,V=l.useRef(null),oe=function(c){c&&c.target&&c.type==="click"&&O&&O(c.target.value,c),G&&G(c)},_e=function(c){var p;document.activeElement===((p=V.current)===null||p===void 0?void 0:p.input)&&c.preventDefault()},de=function(c){var p,U;O&&O((U=(p=V.current)===null||p===void 0?void 0:p.input)===null||U===void 0?void 0:U.value,c)},Y=F("input-search",n),ge=F("input",o),pe=typeof u=="boolean"?l.createElement(W.Z,null):null,ve="".concat(Y,"-button"),J,S=u||{},fe=S.type&&S.type.__ANT_BUTTON===!0;fe||S.type==="button"?J=(0,B.Tm)(S,(0,v.Z)({onMouseDown:_e,onClick:function(c){var p,U;(U=(p=S==null?void 0:S.props)===null||p===void 0?void 0:p.onClick)===null||U===void 0||U.call(p,c),de(c)},key:"enterButton"},fe?{className:ve,size:L}:{})):J=l.createElement(K.Z,{className:ve,type:u?"primary":void 0,size:L,disabled:j,key:"enterButton",onMouseDown:_e,onClick:de,loading:g,icon:pe},u),y&&(J=[J,(0,B.Tm)(y,{key:"addonAfter"})]);var Ee=x()(Y,(a={},(0,i.Z)(a,"".concat(Y,"-rtl"),$==="rtl"),(0,i.Z)(a,"".concat(Y,"-").concat(L),!!L),(0,i.Z)(a,"".concat(Y,"-with-button"),!!u),a),I);return l.createElement(E.ZP,(0,v.Z)({ref:(0,C.sQ)(V,r),onPressEnter:de},A,{size:L,prefixCls:ge,addonAfter:J,suffix:w,onChange:oe,className:Ee,disabled:j}))});s.displayName="Search";var P=s,h=e(94418),N=e(28481),f=e(98423),ee=e(95357),Q=e(28991),ie={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z"}},{tag:"path",attrs:{d:"M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z"}}]},name:"eye-invisible",theme:"outlined"},se=ie,te=e(27029),ne=function(r,a){return l.createElement(te.Z,(0,Q.Z)((0,Q.Z)({},r),{},{ref:a,icon:se}))};ne.displayName="EyeInvisibleOutlined";var ae=l.forwardRef(ne),me=function(t,r){var a={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&r.indexOf(n)<0&&(a[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(t);o<n.length;o++)r.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(t,n[o])&&(a[n[o]]=t[n[o]]);return a},H={click:"onClick",hover:"onMouseOver"},re=l.forwardRef(function(t,r){var a=(0,l.useState)(!1),n=(0,N.Z)(a,2),o=n[0],I=n[1],q=function(){var y=t.disabled;y||I(!o)},w=function(y){var g,j=t.action,O=t.iconRender,G=O===void 0?function(){return null}:O,A=H[j]||"",T=G(o),F=(g={},(0,i.Z)(g,A,q),(0,i.Z)(g,"className","".concat(y,"-icon")),(0,i.Z)(g,"key","passwordIcon"),(0,i.Z)(g,"onMouseDown",function(M){M.preventDefault()}),(0,i.Z)(g,"onMouseUp",function(M){M.preventDefault()}),g);return l.cloneElement(l.isValidElement(T)?T:l.createElement("span",null,T),F)},k=function(y){var g=y.getPrefixCls,j=t.className,O=t.prefixCls,G=t.inputPrefixCls,A=t.size,T=t.visibilityToggle,F=me(t,["className","prefixCls","inputPrefixCls","size","visibilityToggle"]),$=g("input",G),M=g("input-password",O),L=T&&w(M),V=x()(M,j,(0,i.Z)({},"".concat(M,"-").concat(A),!!A)),oe=(0,v.Z)((0,v.Z)({},(0,f.Z)(F,["suffix","iconRender"])),{type:o?"text":"password",className:V,prefixCls:$,suffix:L});return A&&(oe.size=A),l.createElement(E.ZP,(0,v.Z)({ref:r},oe))};return l.createElement(_.C,null,k)});re.defaultProps={action:"click",visibilityToggle:!0,iconRender:function(r){return r?l.createElement(ee.Z,null):l.createElement(ae,null)}},re.displayName="Password";var ue=re,Z=E.ZP;Z.Group=R,Z.Search=P,Z.TextArea=h.Z,Z.Password=ue;var le=Z},24654:function(){}}]);