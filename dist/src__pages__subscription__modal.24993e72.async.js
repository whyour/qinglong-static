(self.webpackChunk=self.webpackChunk||[]).push([[73],{15207:function(e,t,a){"use strict";var r=a(88265),o=window.__ENV__QlBaseUrl||"/";t.Z={siteName:r.ZP.get("青龙"),apiPrefix:"".concat(o,"api/"),authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Português",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:r.ZP.get("中文"),flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:r.ZP.get("定时任务"),value:"crons"},{name:r.ZP.get("环境变量"),value:"envs"},{name:r.ZP.get("订阅管理"),value:"subscriptions"},{name:r.ZP.get("配置文件"),value:"configs"},{name:r.ZP.get("脚本管理"),value:"scripts"},{name:r.ZP.get("日志管理"),value:"logs"},{name:r.ZP.get("依赖管理"),value:"dependencies"},{name:r.ZP.get("系统信息"),value:"system"}],scopesMap:{crons:r.ZP.get("定时任务"),envs:r.ZP.get("环境变量"),subscriptions:r.ZP.get("订阅管理"),configs:r.ZP.get("配置文件"),scripts:r.ZP.get("脚本管理"),logs:r.ZP.get("日志管理"),dependencies:r.ZP.get("依赖管理"),system:r.ZP.get("系统信息")},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:r.ZP.get("Server酱")},{value:"pushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:r.ZP.get("Telegram机器人")},{value:"dingtalkBot",label:r.ZP.get("钉钉机器人")},{value:"weWorkBot",label:r.ZP.get("企业微信机器人")},{value:"weWorkApp",label:r.ZP.get("企业微信应用")},{value:"aibotk",label:r.ZP.get("智能微秘书")},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"chat",label:r.ZP.get("群晖chat")},{value:"email",label:r.ZP.get("邮箱")},{value:"lark",label:r.ZP.get("飞书机器人")},{value:"pushMe",label:"PushMe"},{value:"chronocat",label:"Chronocat"},{value:"webhook",label:r.ZP.get("自定义通知")},{value:"closed",label:r.ZP.get("已关闭")}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:r.ZP.get("gotify的url地址，例如 https://push.example.de:8080"),required:!0},{label:"gotifyToken",tip:r.ZP.get("gotify的消息应用token码"),required:!0},{label:"gotifyPriority",tip:r.ZP.get("推送消息的优先级")}],chat:[{label:"chatUrl",tip:r.ZP.get("chat的url地址"),required:!0},{label:"chatToken",tip:r.ZP.get("chat的token码"),required:!0}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:r.ZP.get("推送到个人QQ: http://127.0.0.1/send_private_msg，群：http://127.0.0.1/send_group_msg"),required:!0},{label:"goCqHttpBotToken",tip:r.ZP.get("访问密钥"),required:!0},{label:"goCqHttpBotQq",tip:r.ZP.get("如果GOBOT_URL设置 /send_private_msg 则需要填入 user_id=个人QQ 相反如果是 /send_group_msg 则需要填入 group_id=QQ群"),required:!0}],serverChan:[{label:"serverChanKey",tip:r.ZP.get("Server酱SENDKEY"),required:!0}],pushDeer:[{label:"pushDeerKey",tip:r.ZP.get("PushDeer的Key，https://github.com/easychen/pushdeer"),required:!0},{label:"pushDeerUrl",tip:r.ZP.get("PushDeer的自架API endpoint，默认是 https://api2.pushdeer.com/message/push")}],bark:[{label:"barkPush",tip:r.ZP.get("Bark的信息IP/设备码，例如：https://api.day.app/XXXXXXXX"),required:!0},{label:"barkIcon",tip:r.ZP.get("BARK推送图标，自定义推送图标 (需iOS15或以上才能显示)")},{label:"barkSound",tip:r.ZP.get("BARK推送铃声，铃声列表去APP查看复制填写")},{label:"barkGroup",tip:r.ZP.get("BARK推送消息的分组，默认为qinglong")},{label:"barkLevel",tip:r.ZP.get("BARK推送消息的时效性，默认为active")},{label:"barkUrl",tip:r.ZP.get("BARK推送消息的跳转URL")}],telegramBot:[{label:"telegramBotToken",tip:r.ZP.get("telegram机器人的token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw"),required:!0},{label:"telegramBotUserId",tip:r.ZP.get("telegram用户的id，例如：129xxx206"),required:!0},{label:"telegramBotProxyHost",tip:r.ZP.get("代理IP")},{label:"telegramBotProxyPort",tip:r.ZP.get("代理端口")},{label:"telegramBotProxyAuth",tip:r.ZP.get("telegram代理配置认证参数，用户名与密码用英文冒号连接 user:password")},{label:"telegramBotApiHost",tip:r.ZP.get("telegram api自建的反向代理地址，默认tg官方api")}],dingtalkBot:[{label:"dingtalkBotToken",tip:r.ZP.get("钉钉机器人webhook token，例如：5a544165465465645d0f31dca676e7bd07415asdasd"),required:!0},{label:"dingtalkBotSecret",tip:r.ZP.get("密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串")}],weWorkBot:[{label:"weWorkBotKey",tip:r.ZP.get("企业微信机器人的webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa"),required:!0},{label:"weWorkOrigin",tip:r.ZP.get("企业微信代理地址")}],weWorkApp:[{label:"weWorkAppKey",tip:r.ZP.get("corpid、corpsecret、touser(注:多个成员ID使用|隔开)、agentid、消息类型(选填，不填默认文本消息类型) 注意用,号隔开(英文输入法的逗号)，例如：wwcfrs,B-76WERQ,qinglong,1000001,2COat"),required:!0},{label:"weWorkOrigin",tip:r.ZP.get("企业微信代理地址")}],aibotk:[{label:"aibotkKey",tip:r.ZP.get("密钥key，智能微秘书个人中心获取apikey，申请地址：https://wechat.aibotk.com/signup?from=ql"),required:!0},{label:"aibotkType",tip:r.ZP.get("发送的目标，群组或者好友"),required:!0,placeholder:r.ZP.get("请输入要发送的目标"),items:[{value:"room",label:r.ZP.get("群聊")},{value:"contact",label:r.ZP.get("好友")}]},{label:"aibotkName",tip:r.ZP.get("要发送的用户昵称或群名，如果目标是群，需要填群名，如果目标是好友，需要填好友昵称"),required:!0}],iGot:[{label:"iGotPushKey",tip:r.ZP.get("iGot的信息推送key，例如：https://push.hellyw.com/XXXXXXXX"),required:!0}],pushPlus:[{label:"pushPlusToken",tip:r.ZP.get("微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送，参考 https://www.pushplus.plus/"),required:!0},{label:"pushPlusUser",tip:r.ZP.get("一对多推送的“群组编码”（一对多推送下面->您的群组(如无则创建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）")}],lark:[{label:"larkKey",tip:r.ZP.get("飞书群组机器人：https://www.feishu.cn/hc/zh-CN/articles/360024984973"),required:!0}],email:[{label:"emailService",tip:r.ZP.get("邮箱服务名称，比如126、163、Gmail、QQ等，支持列表https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json"),required:!0},{label:"emailUser",tip:r.ZP.get("邮箱地址"),required:!0},{label:"emailPass",tip:r.ZP.get("邮箱SMTP授权码"),required:!0}],pushMe:[{label:"pushMeKey",tip:r.ZP.get("PushMe的Key，https://push.i-i.me/"),required:!0}],chronocat:[{label:"chronocatURL",tip:r.ZP.get("Chronocat Red 服务的连接地址 https://chronocat.vercel.app/install/docker/official/"),required:!0},{label:"chronocatQQ",tip:r.ZP.get("个人:user_id=个人QQ 群则填入group_id=QQ群 多个用英文;隔开同时支持个人和群 如：user_id=xxx;group_id=xxxx;group_id=xxxxx"),required:!0},{label:"chronocatToken",tip:r.ZP.get("docker安装在持久化config目录下的chronocat.yml文件可找到"),required:!0}],webhook:[{label:"webhookMethod",tip:r.ZP.get("请求方法"),required:!0,items:[{value:"GET"},{value:"POST"},{value:"PUT"}]},{label:"webhookContentType",tip:r.ZP.get("请求头Content-Type"),required:!0,items:[{value:"text/plain"},{value:"application/json"},{value:"multipart/form-data"},{value:"application/x-www-form-urlencoded"}]},{label:"webhookUrl",tip:r.ZP.get("请求链接以http或者https开头。url或者body中必须包含$title，$content可选，对应api内容的位置"),required:!0,placeholder:"https://xxx.cn/api?content=$title\n"},{label:"webhookHeaders",tip:r.ZP.get("请求头格式Custom-Header1: Header1，多个换行分割"),placeholder:"Custom-Header1: Header1\nCustom-Header2: Header2"},{label:"webhookBody",tip:r.ZP.get("请求体格式key1: value1，多个换行分割。url或者body中必须包含$title，$content可选，对应api内容的位置"),placeholder:"key1: $title\nkey2: $content"}]},documentTitleMap:{"/login":r.ZP.get("登录"),"/initialization":r.ZP.get("初始化"),"/crontab":r.ZP.get("定时任务"),"/env":r.ZP.get("环境变量"),"/subscription":r.ZP.get("订阅管理"),"/config":r.ZP.get("配置文件"),"/script":r.ZP.get("脚本管理"),"/diff":r.ZP.get("对比工具"),"/log":r.ZP.get("日志管理"),"/setting":r.ZP.get("系统设置"),"/error":r.ZP.get("错误日志"),"/dependence":r.ZP.get("依赖管理")},dependenceTypes:["nodejs","python3","linux"]}},57229:function(e,t,a){"use strict";a.d(t,{W:function(){return m}});var r=a(25359),o=a.n(r),l=a(49811),n=a.n(l),i=a(88265),s=a(9835),u=a(15207),c=a(14851),p=a(73669);s.ZP.config({duration:2});var d=Date.now(),g=p.Z.create({timeout:6e4,params:{t:d}}),b=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];g.interceptors.request.use((function(e){var t=localStorage.getItem(u.Z.authKey);return t&&!b.includes(e.url)?(e.headers.Authorization="Bearer ".concat(t),e):e})),g.interceptors.response.use(function(){var e=n()(o()().mark((function e(t){var a,r,l;return o()().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a=t.status,![502,504].includes(a)){e.next=5;break}c.history.push("/error"),e.next=18;break;case 5:if(401!==a){e.next=9;break}"/login"!==c.history.location.pathname&&(localStorage.removeItem(u.Z.authKey),c.history.push("/login")),e.next=18;break;case 9:return e.prev=9,200!==(r=t.data).code&&(l=r.message||r.data)&&s.ZP.error({content:l,style:{maxWidth:500,margin:"0 auto"}}),e.abrupt("return",r);case 15:e.prev=15,e.t0=e.catch(9);case 17:case 18:return e.abrupt("return",t);case 19:case"end":return e.stop()}}),e,null,[[9,15]])})));return function(t){return e.apply(this,arguments)}}(),(function(e){if(e.response){var t=e.response.data?e.response.data.message||e.message||e.response.data:e.response.statusText,a=e.response.status;[502,504].includes(a)?c.history.push("/error"):401===a?"/login"!==c.history.location.pathname&&(s.ZP.error(i.ZP.get("登录已过期，请重新登录")),localStorage.removeItem(u.Z.authKey),c.history.push("/login")):s.ZP.error({content:t,style:{maxWidth:500,margin:"0 auto"}})}else console.log(e.message);return Promise.reject(e)}));var m=g},60822:function(e,t,a){"use strict";function r(e){return Object.keys(e).reduce((function(t,a){return!a.startsWith("data-")&&!a.startsWith("aria-")&&"role"!==a||a.startsWith("data-__")||(t[a]=e[a]),t}),{})}a.d(t,{Z:function(){return r}})},84468:function(e,t,a){"use strict";a.d(t,{ZP:function(){return I}});var r=a(88028),o=a(22481),l=a(41171),n=a(84875),i=a.n(n),s=a(16376),u=a(63313),c=a(82259),p=a(65189),d=a(60822),g=u.createContext(null),b=g.Provider,m=g,h=u.createContext(null),f=h.Provider,P=a(69370),v=a(93355),Z=a(7893),y=a(76737),k=function(e,t){var a={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(a[r[o]]=e[r[o]])}return a},x=function(e,t){var a,l=u.useContext(m),n=u.useContext(h),s=u.useContext(c.E_),p=s.getPrefixCls,d=s.direction,g=u.useRef(),b=(0,v.sQ)(t,g),f=(0,u.useContext)(y.aM).isFormItemInput,x=e.prefixCls,C=e.className,w=e.children,O=e.style,q=e.disabled,E=k(e,["prefixCls","className","children","style","disabled"]),B=p("radio",x),_="button"===((null==l?void 0:l.optionType)||n)?"".concat(B,"-button"):B,I=(0,r.Z)({},E),S=u.useContext(Z.Z);I.disabled=q||S,l&&(I.name=l.name,I.onChange=function(t){var a,r;null===(a=e.onChange)||void 0===a||a.call(e,t),null===(r=null==l?void 0:l.onChange)||void 0===r||r.call(l,t)},I.checked=e.value===l.value,I.disabled=I.disabled||l.disabled);var M=i()("".concat(_,"-wrapper"),(a={},(0,o.Z)(a,"".concat(_,"-wrapper-checked"),I.checked),(0,o.Z)(a,"".concat(_,"-wrapper-disabled"),I.disabled),(0,o.Z)(a,"".concat(_,"-wrapper-rtl"),"rtl"===d),(0,o.Z)(a,"".concat(_,"-wrapper-in-form-item"),f),a),C);return u.createElement("label",{className:M,style:O,onMouseEnter:e.onMouseEnter,onMouseLeave:e.onMouseLeave},u.createElement(P.Z,(0,r.Z)({},I,{type:"radio",prefixCls:_,ref:b})),void 0!==w?u.createElement("span",null,w):null)};var C=u.forwardRef(x),w=u.forwardRef((function(e,t){var a,n=u.useContext(c.E_),g=n.getPrefixCls,m=n.direction,h=u.useContext(p.Z),f=(0,s.Z)(e.defaultValue,{value:e.value}),P=(0,l.Z)(f,2),v=P[0],Z=P[1],y=e.prefixCls,k=e.className,x=void 0===k?"":k,w=e.options,O=e.buttonStyle,q=void 0===O?"outline":O,E=e.disabled,B=e.children,_=e.size,I=e.style,S=e.id,M=e.onMouseEnter,N=e.onMouseLeave,T=e.onFocus,H=e.onBlur,R=g("radio",y),A="".concat(R,"-group"),K=B;w&&w.length>0&&(K=w.map((function(e){return"string"==typeof e||"number"==typeof e?u.createElement(C,{key:e.toString(),prefixCls:R,disabled:E,value:e,checked:v===e},e):u.createElement(C,{key:"radio-group-value-options-".concat(e.value),prefixCls:R,disabled:e.disabled||E,value:e.value,checked:v===e.value,style:e.style},e.label)})));var U=_||h,X=i()(A,"".concat(A,"-").concat(q),(a={},(0,o.Z)(a,"".concat(A,"-").concat(U),U),(0,o.Z)(a,"".concat(A,"-rtl"),"rtl"===m),a),x);return u.createElement("div",(0,r.Z)({},(0,d.Z)(e),{className:X,style:I,onMouseEnter:M,onMouseLeave:N,onFocus:T,onBlur:H,id:S,ref:t}),u.createElement(b,{value:{onChange:function(t){var a=v,r=t.target.value;"value"in e||Z(r);var o=e.onChange;o&&r!==a&&o(t)},value:v,disabled:e.disabled,name:e.name,optionType:e.optionType}},K))})),O=u.memo(w),q=function(e,t){var a={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(a[r[o]]=e[r[o]])}return a},E=function(e,t){var a=u.useContext(c.E_).getPrefixCls,o=e.prefixCls,l=q(e,["prefixCls"]),n=a("radio",o);return u.createElement(f,{value:"button"},u.createElement(C,(0,r.Z)({prefixCls:n},l,{type:"radio",ref:t})))},B=u.forwardRef(E),_=C;_.Button=B,_.Group=O,_.__ANT_RADIO=!0;var I=_},28756:function(e,t,a){"use strict";var r=a(22481),o=a(88028),l=a(84875),n=a.n(l),i=a(40804),s=a(54331),u=a(63313),c=a(82259),p=a(23474),d=a(7893),g=a(65189),b=a(76737),m=a(16082),h=a(1020),f=a(91967),P=a(60934),v=function(e,t){var a={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(a[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(a[r[o]]=e[r[o]])}return a},Z="SECRET_COMBOBOX_MODE_DO_NOT_USE",y=function(e,t){var a,l,y=e.prefixCls,k=e.bordered,x=void 0===k||k,C=e.className,w=e.getPopupContainer,O=e.dropdownClassName,q=e.popupClassName,E=e.listHeight,B=void 0===E?256:E,_=e.placement,I=e.listItemHeight,S=void 0===I?24:I,M=e.size,N=e.disabled,T=e.notFoundContent,H=e.status,R=e.showArrow,A=v(e,["prefixCls","bordered","className","getPopupContainer","dropdownClassName","popupClassName","listHeight","placement","listItemHeight","size","disabled","notFoundContent","status","showArrow"]),K=u.useContext(c.E_),U=K.getPopupContainer,X=K.getPrefixCls,j=K.renderEmpty,Q=K.direction,W=K.virtual,D=K.dropdownMatchSelectWidth,G=u.useContext(g.Z),F=X("select",y),L=X(),z=(0,P.ri)(F,Q),$=z.compactSize,V=z.compactItemClassnames,Y=u.useMemo((function(){var e=A.mode;if("combobox"!==e)return e===Z?"combobox":e}),[A.mode]),J="multiple"===Y||"tags"===Y,ee=void 0!==R?R:A.loading||!(J||"combobox"===Y),te=(0,u.useContext)(b.aM),ae=te.status,re=te.hasFeedback,oe=te.isFormItemInput,le=te.feedbackIcon,ne=(0,h.F)(ae,H);l=void 0!==T?T:"combobox"===Y?null:(j||p.Z)("Select");var ie=(0,f.Z)((0,o.Z)((0,o.Z)({},A),{multiple:J,hasFeedback:re,feedbackIcon:le,showArrow:ee,prefixCls:F})),se=ie.suffixIcon,ue=ie.itemIcon,ce=ie.removeIcon,pe=ie.clearIcon,de=(0,s.Z)(A,["suffixIcon","itemIcon"]),ge=n()(q||O,(0,r.Z)({},"".concat(F,"-dropdown-").concat(Q),"rtl"===Q)),be=$||M||G,me=u.useContext(d.Z),he=null!=N?N:me,fe=n()((a={},(0,r.Z)(a,"".concat(F,"-lg"),"large"===be),(0,r.Z)(a,"".concat(F,"-sm"),"small"===be),(0,r.Z)(a,"".concat(F,"-rtl"),"rtl"===Q),(0,r.Z)(a,"".concat(F,"-borderless"),!x),(0,r.Z)(a,"".concat(F,"-in-form-item"),oe),a),(0,h.Z)(F,ne,re),V,C);return u.createElement(i.ZP,(0,o.Z)({ref:t,virtual:W,dropdownMatchSelectWidth:D},de,{transitionName:(0,m.mL)(L,(0,m.q0)(_),A.transitionName),listHeight:B,listItemHeight:S,mode:Y,prefixCls:F,placement:void 0!==_?_:"rtl"===Q?"bottomRight":"bottomLeft",direction:Q,inputIcon:se,menuItemSelectedIcon:ue,removeIcon:ce,clearIcon:pe,notFoundContent:l,className:fe,getPopupContainer:w||U,dropdownClassName:ge,showArrow:re||R,disabled:he}))},k=u.forwardRef(y);k.SECRET_COMBOBOX_MODE_DO_NOT_USE=Z,k.Option=i.Wx,k.OptGroup=i.Xo,t.Z=k},69370:function(e,t,a){"use strict";var r=a(88028),o=a(2595),l=a(22481),n=a(41171),i=a(4155),s=a(84875),u=a.n(s),c=a(16376),p=a(63313),d=["prefixCls","className","style","checked","disabled","defaultChecked","type","onChange"],g=(0,p.forwardRef)((function(e,t){var a,s=e.prefixCls,g=void 0===s?"rc-checkbox":s,b=e.className,m=e.style,h=e.checked,f=e.disabled,P=e.defaultChecked,v=void 0!==P&&P,Z=e.type,y=void 0===Z?"checkbox":Z,k=e.onChange,x=(0,i.Z)(e,d),C=(0,p.useRef)(null),w=(0,c.Z)(v,{value:h}),O=(0,n.Z)(w,2),q=O[0],E=O[1];(0,p.useImperativeHandle)(t,(function(){return{focus:function(){var e;null===(e=C.current)||void 0===e||e.focus()},blur:function(){var e;null===(e=C.current)||void 0===e||e.blur()},input:C.current}}));var B=u()(g,b,(a={},(0,l.Z)(a,"".concat(g,"-checked"),q),(0,l.Z)(a,"".concat(g,"-disabled"),f),a));return p.createElement("span",{className:B,style:m},p.createElement("input",(0,r.Z)({},x,{className:"".concat(g,"-input"),ref:C,onChange:function(t){f||("checked"in e||E(t.target.checked),null==k||k({target:(0,o.Z)((0,o.Z)({},e),{},{type:y,checked:t.target.checked}),stopPropagation:function(){t.stopPropagation()},preventDefault:function(){t.preventDefault()},nativeEvent:t.nativeEvent}))},disabled:f,checked:!!q,type:y})),p.createElement("span",{className:"".concat(g,"-inner")}))}));t.Z=g},38433:function(){}}]);