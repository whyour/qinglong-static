"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[8008],{78008:function(e,t,n){n.r(t);var a=n(54306),i=n.n(a),o=n(88265),r=n(63313),s=n(89065),l=n(9835),c=n(84163),u=n(24378),p=n(57229),g=n(15207),h=n(21758),d=n(99120),P=n.n(d),b=n(11527),m=s.Z.Countdown;t.default=function(e){var t=e.systemInfo,n=(0,r.useState)(!1),a=i()(n,2),s=a[0],d=a[1],v=(0,r.useState)(""),f=i()(v,2),Z=f[0],k=f[1],y=(0,r.useRef)(),x=function(e){c.Z.confirm({width:500,title:o.ZP.get("更新"),content:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{children:o.ZP.get("已经是最新版了！")}),(0,b.jsxs)("div",{style:{fontSize:12,fontWeight:400,marginTop:5},children:[o.ZP.get("青龙")," ",e.lastVersion," ",o.ZP.get("是目前检测到的最新可用版本了。")]})]}),okText:o.ZP.get("重新下载"),onOk:function(){q(),p.W.put("".concat(g.Z.apiPrefix,"system/update")).then((function(e){})).catch((function(e){console.log(e)}))}})},w=function(e){var n=e.lastVersion,a=e.lastLog;c.Z.confirm({width:500,title:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{children:o.ZP.get("更新可用")}),(0,b.jsxs)("div",{style:{fontSize:12,fontWeight:400,marginTop:5},children:[o.ZP.get("新版本")," ",n," ",o.ZP.get("可用，你使用的版本为")," ",t.version,"。"]})]}),content:(0,b.jsx)("pre",{children:(0,b.jsx)(P(),{children:a})}),okText:o.ZP.get("下载更新"),cancelText:o.ZP.get("以后再说"),onOk:function(){q(),p.W.put("".concat(g.Z.apiPrefix,"system/update")).then((function(e){})).catch((function(e){console.log(e)}))}})},q=function(){k(""),y.current=c.Z.info({width:600,maskClosable:!1,closable:!1,keyboard:!1,okButtonProps:{disabled:!0},title:o.ZP.get("下载更新中..."),centered:!0,content:(0,b.jsx)("pre",{children:(0,b.jsx)(P(),{children:Z})})})};(0,r.useEffect)((function(){if(Z){var e=Z.includes("失败，请检查");y.current.update({maskClosable:e,closable:e,okButtonProps:{disabled:!e},content:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("pre",{children:(0,b.jsx)(P(),{children:Z})}),(0,b.jsx)("div",{id:"log-identifier",style:{paddingBottom:5}})]})})}}),[Z]);var B=(0,r.useCallback)((function(e){var t=e.message;t.includes("失败，请检查")&&l.ZP.error(o.ZP.get("更新失败，请检查网络及日志或稍后再试")),setTimeout((function(){document.querySelector("#log-identifier").scrollIntoView({behavior:"smooth"})}),600),t.includes("更新包下载成功")&&setTimeout((function(){c.Z.confirm({width:600,maskClosable:!1,title:o.ZP.get("确认重启"),centered:!0,content:o.ZP.get("系统安装包下载成功，确认重启"),okText:o.ZP.get("重启"),onOk:function(){p.W.put("".concat(g.Z.apiPrefix,"system/reload"),{type:"system"}).then((function(e){l.ZP.success({content:(0,b.jsxs)("span",{children:[o.ZP.get("系统将在"),(0,b.jsx)(m,{className:"inline-countdown",format:"ss",value:Date.now()+3e4}),o.ZP.get("秒后自动刷新")]}),duration:30}),setTimeout((function(){window.location.reload()}),3e4)})).catch((function(e){console.log(e)}))},onCancel:function(){y.current.update({maskClosable:!0,closable:!0,okButtonProps:{disabled:!1}})}})}),1e3),k((function(e){return"".concat(e).concat(t)}))}),[]);return(0,r.useEffect)((function(){var e=h.Z.getInstance();return e.subscribe("updateSystemVersion",B),function(){e.unsubscribe("updateSystemVersion",B)}}),[]),(0,b.jsx)(b.Fragment,{children:(0,b.jsx)(u.Z,{type:"primary",onClick:function(){s||(d(!0),l.ZP.loading(o.ZP.get("检查更新中..."),0),p.W.put("".concat(g.Z.apiPrefix,"system/update-check")).then((function(e){var t=e.code,n=e.data;l.ZP.destroy(),200===t&&(n.hasNewVersion?w(n):x(n))})).catch((function(e){l.ZP.destroy(),console.log(e)})).finally((function(){d(!1)})))},children:o.ZP.get("检查更新")})})}},15207:function(e,t,n){var a=n(88265),i=window.__ENV__QlBaseUrl||"/";t.Z={siteName:a.ZP.get("青龙"),apiPrefix:"".concat(i,"api/"),authKey:"token",layouts:[{name:"primary",include:[/.*/],exclude:[/(\/(en|zh))*\/login/]}],i18n:{languages:[{key:"pt-br",title:"Português",flag:"/portugal.svg"},{key:"en",title:"English",flag:"/america.svg"},{key:"zh",title:a.ZP.get("中文"),flag:"/china.svg"}],defaultLanguage:"en"},scopes:[{name:a.ZP.get("定时任务"),value:"crons"},{name:a.ZP.get("环境变量"),value:"envs"},{name:a.ZP.get("订阅管理"),value:"subscriptions"},{name:a.ZP.get("配置文件"),value:"configs"},{name:a.ZP.get("脚本管理"),value:"scripts"},{name:a.ZP.get("日志管理"),value:"logs"},{name:a.ZP.get("依赖管理"),value:"dependencies"},{name:a.ZP.get("系统信息"),value:"system"}],scopesMap:{crons:a.ZP.get("定时任务"),envs:a.ZP.get("环境变量"),subscriptions:a.ZP.get("订阅管理"),configs:a.ZP.get("配置文件"),scripts:a.ZP.get("脚本管理"),logs:a.ZP.get("日志管理"),dependencies:a.ZP.get("依赖管理"),system:a.ZP.get("系统信息")},notificationModes:[{value:"gotify",label:"Gotify"},{value:"goCqHttpBot",label:"GoCqHttpBot"},{value:"serverChan",label:a.ZP.get("Server酱")},{value:"pushDeer",label:"PushDeer"},{value:"bark",label:"Bark"},{value:"telegramBot",label:a.ZP.get("Telegram机器人")},{value:"dingtalkBot",label:a.ZP.get("钉钉机器人")},{value:"weWorkBot",label:a.ZP.get("企业微信机器人")},{value:"weWorkApp",label:a.ZP.get("企业微信应用")},{value:"aibotk",label:a.ZP.get("智能微秘书")},{value:"iGot",label:"IGot"},{value:"pushPlus",label:"PushPlus"},{value:"chat",label:a.ZP.get("群晖chat")},{value:"email",label:a.ZP.get("邮箱")},{value:"lark",label:a.ZP.get("飞书机器人")},{value:"pushMe",label:"PushMe"},{value:"chronocat",label:"Chronocat"},{value:"webhook",label:a.ZP.get("自定义通知")},{value:"closed",label:a.ZP.get("已关闭")}],notificationModeMap:{gotify:[{label:"gotifyUrl",tip:a.ZP.get("gotify的url地址，例如 https://push.example.de:8080"),required:!0},{label:"gotifyToken",tip:a.ZP.get("gotify的消息应用token码"),required:!0},{label:"gotifyPriority",tip:a.ZP.get("推送消息的优先级")}],chat:[{label:"chatUrl",tip:a.ZP.get("chat的url地址"),required:!0},{label:"chatToken",tip:a.ZP.get("chat的token码"),required:!0}],goCqHttpBot:[{label:"goCqHttpBotUrl",tip:a.ZP.get("推送到个人QQ: http://127.0.0.1/send_private_msg，群：http://127.0.0.1/send_group_msg"),required:!0},{label:"goCqHttpBotToken",tip:a.ZP.get("访问密钥"),required:!0},{label:"goCqHttpBotQq",tip:a.ZP.get("如果GOBOT_URL设置 /send_private_msg 则需要填入 user_id=个人QQ 相反如果是 /send_group_msg 则需要填入 group_id=QQ群"),required:!0}],serverChan:[{label:"serverChanKey",tip:a.ZP.get("Server酱SENDKEY"),required:!0}],pushDeer:[{label:"pushDeerKey",tip:a.ZP.get("PushDeer的Key，https://github.com/easychen/pushdeer"),required:!0},{label:"pushDeerUrl",tip:a.ZP.get("PushDeer的自架API endpoint，默认是 https://api2.pushdeer.com/message/push")}],bark:[{label:"barkPush",tip:a.ZP.get("Bark的信息IP/设备码，例如：https://api.day.app/XXXXXXXX"),required:!0},{label:"barkIcon",tip:a.ZP.get("BARK推送图标，自定义推送图标 (需iOS15或以上才能显示)")},{label:"barkSound",tip:a.ZP.get("BARK推送铃声，铃声列表去APP查看复制填写")},{label:"barkGroup",tip:a.ZP.get("BARK推送消息的分组，默认为qinglong")},{label:"barkLevel",tip:a.ZP.get("BARK推送消息的时效性，默认为active")},{label:"barkUrl",tip:a.ZP.get("BARK推送消息的跳转URL")}],telegramBot:[{label:"telegramBotToken",tip:a.ZP.get("telegram机器人的token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw"),required:!0},{label:"telegramBotUserId",tip:a.ZP.get("telegram用户的id，例如：129xxx206"),required:!0},{label:"telegramBotProxyHost",tip:a.ZP.get("代理IP")},{label:"telegramBotProxyPort",tip:a.ZP.get("代理端口")},{label:"telegramBotProxyAuth",tip:a.ZP.get("telegram代理配置认证参数，用户名与密码用英文冒号连接 user:password")},{label:"telegramBotApiHost",tip:a.ZP.get("telegram api自建的反向代理地址，默认tg官方api")}],dingtalkBot:[{label:"dingtalkBotToken",tip:a.ZP.get("钉钉机器人webhook token，例如：5a544165465465645d0f31dca676e7bd07415asdasd"),required:!0},{label:"dingtalkBotSecret",tip:a.ZP.get("密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串")}],weWorkBot:[{label:"weWorkBotKey",tip:a.ZP.get("企业微信机器人的webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa"),required:!0},{label:"weWorkOrigin",tip:a.ZP.get("企业微信代理地址")}],weWorkApp:[{label:"weWorkAppKey",tip:a.ZP.get("corpid、corpsecret、touser(注:多个成员ID使用|隔开)、agentid、消息类型(选填，不填默认文本消息类型) 注意用,号隔开(英文输入法的逗号)，例如：wwcfrs,B-76WERQ,qinglong,1000001,2COat"),required:!0},{label:"weWorkOrigin",tip:a.ZP.get("企业微信代理地址")}],aibotk:[{label:"aibotkKey",tip:a.ZP.get("密钥key，智能微秘书个人中心获取apikey，申请地址：https://wechat.aibotk.com/signup?from=ql"),required:!0},{label:"aibotkType",tip:a.ZP.get("发送的目标，群组或者好友"),required:!0,placeholder:a.ZP.get("请输入要发送的目标"),items:[{value:"room",label:a.ZP.get("群聊")},{value:"contact",label:a.ZP.get("好友")}]},{label:"aibotkName",tip:a.ZP.get("要发送的用户昵称或群名，如果目标是群，需要填群名，如果目标是好友，需要填好友昵称"),required:!0}],iGot:[{label:"iGotPushKey",tip:a.ZP.get("iGot的信息推送key，例如：https://push.hellyw.com/XXXXXXXX"),required:!0}],pushPlus:[{label:"pushPlusToken",tip:a.ZP.get("微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送，参考 https://www.pushplus.plus/"),required:!0},{label:"pushPlusUser",tip:a.ZP.get("一对多推送的“群组编码”（一对多推送下面->您的群组(如无则创建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）")}],lark:[{label:"larkKey",tip:a.ZP.get("飞书群组机器人：https://www.feishu.cn/hc/zh-CN/articles/360024984973"),required:!0}],email:[{label:"emailService",tip:a.ZP.get("邮箱服务名称，比如126、163、Gmail、QQ等，支持列表https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json"),required:!0},{label:"emailUser",tip:a.ZP.get("邮箱地址"),required:!0},{label:"emailPass",tip:a.ZP.get("邮箱SMTP授权码"),required:!0}],pushMe:[{label:"pushMeKey",tip:a.ZP.get("PushMe的Key，https://push.i-i.me/"),required:!0}],chronocat:[{label:"chronocatURL",tip:a.ZP.get("Chronocat Red 服务的连接地址 https://chronocat.vercel.app/install/docker/official/"),required:!0},{label:"chronocatQQ",tip:a.ZP.get("个人:user_id=个人QQ 群则填入group_id=QQ群 多个用英文;隔开同时支持个人和群 如：user_id=xxx;group_id=xxxx;group_id=xxxxx"),required:!0},{label:"chronocatToken",tip:a.ZP.get("docker安装在持久化config目录下的chronocat.yml文件可找到"),required:!0}],webhook:[{label:"webhookMethod",tip:a.ZP.get("请求方法"),required:!0,items:[{value:"GET"},{value:"POST"},{value:"PUT"}]},{label:"webhookContentType",tip:a.ZP.get("请求头Content-Type"),required:!0,items:[{value:"text/plain"},{value:"application/json"},{value:"multipart/form-data"},{value:"application/x-www-form-urlencoded"}]},{label:"webhookUrl",tip:a.ZP.get("请求链接以http或者https开头。url或者body中必须包含$title，$content可选，对应api内容的位置"),required:!0,placeholder:"https://xxx.cn/api?content=$title\n"},{label:"webhookHeaders",tip:a.ZP.get("请求头格式Custom-Header1: Header1，多个换行分割"),placeholder:"Custom-Header1: Header1\nCustom-Header2: Header2"},{label:"webhookBody",tip:a.ZP.get("请求体格式key1: value1，多个换行分割。url或者body中必须包含$title，$content可选，对应api内容的位置"),placeholder:"key1: $title\nkey2: $content"}]},documentTitleMap:{"/login":a.ZP.get("登录"),"/initialization":a.ZP.get("初始化"),"/crontab":a.ZP.get("定时任务"),"/env":a.ZP.get("环境变量"),"/subscription":a.ZP.get("订阅管理"),"/config":a.ZP.get("配置文件"),"/script":a.ZP.get("脚本管理"),"/diff":a.ZP.get("对比工具"),"/log":a.ZP.get("日志管理"),"/setting":a.ZP.get("系统设置"),"/error":a.ZP.get("错误日志"),"/dependence":a.ZP.get("依赖管理")},dependenceTypes:["nodejs","python3","linux"]}},57229:function(e,t,n){n.d(t,{W:function(){return P}});var a=n(25359),i=n.n(a),o=n(49811),r=n.n(o),s=n(88265),l=n(9835),c=n(15207),u=n(14851),p=n(73669);l.ZP.config({duration:2});var g=Date.now(),h=p.Z.create({timeout:6e4,params:{t:g}}),d=["/api/user/login","/open/auth/token","/api/user/two-factor/login","/api/system","/api/user/init","/api/user/notification/init"];h.interceptors.request.use((function(e){var t=localStorage.getItem(c.Z.authKey);return t&&!d.includes(e.url)?(e.headers.Authorization="Bearer ".concat(t),e):e})),h.interceptors.response.use(function(){var e=r()(i()().mark((function e(t){var n,a,o;return i()().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=t.status,![502,504].includes(n)){e.next=5;break}u.history.push("/error"),e.next=18;break;case 5:if(401!==n){e.next=9;break}"/login"!==u.history.location.pathname&&(localStorage.removeItem(c.Z.authKey),u.history.push("/login")),e.next=18;break;case 9:return e.prev=9,200!==(a=t.data).code&&(o=a.message||a.data)&&l.ZP.error({content:o,style:{maxWidth:500,margin:"0 auto"}}),e.abrupt("return",a);case 15:e.prev=15,e.t0=e.catch(9);case 17:case 18:return e.abrupt("return",t);case 19:case"end":return e.stop()}}),e,null,[[9,15]])})));return function(t){return e.apply(this,arguments)}}(),(function(e){if(e.response){var t=e.response.data?e.response.data.message||e.message||e.response.data:e.response.statusText,n=e.response.status;[502,504].includes(n)?u.history.push("/error"):401===n?"/login"!==u.history.location.pathname&&(l.ZP.error(s.ZP.get("登录已过期，请重新登录")),localStorage.removeItem(c.Z.authKey),u.history.push("/login")):l.ZP.error({content:t,style:{maxWidth:500,margin:"0 auto"}})}else console.log(e.message);return Promise.reject(e)}));var P=h},21758:function(e,t,n){var a=n(93525),i=n.n(a),o=n(12342),r=n.n(o),s=n(25359),l=n.n(s),c=n(49811),u=n.n(c),p=n(21140),g=n.n(p),h=n(63466),d=n.n(h),P=n(52510),b=n.n(P),m=n(78078),v=n.n(m),f=["type"],Z=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};g()(this,e),b()(this,"url",void 0),b()(this,"socket",null),b()(this,"subscriptions",new Map),b()(this,"options",void 0),b()(this,"reconnectAttempts",0),b()(this,"heartbeatTimeout",null),b()(this,"state","closed"),this.url=t,this.options={maxReconnectAttempts:n.maxReconnectAttempts||5,reconnectInterval:n.reconnectInterval||3e3,heartbeatInterval:n.heartbeatInterval||3e4},this.init()}var t,n;return d()(e,[{key:"init",value:(n=u()(l()().mark((function e(){var t=this;return l()().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.prev=0,this.state="connecting",this.emit("connecting");case 3:if(!(this.reconnectAttempts<this.options.maxReconnectAttempts)){e.next=16;break}return this.socket=new(v())(this.url),this.setupEventListeners(),this.startHeartbeat(),e.next=9,this.waitForClose();case 9:return this.stopHeartbeat(),this.socket=null,this.reconnectAttempts++,e.next=14,new Promise((function(e){return setTimeout(e,t.options.reconnectInterval)}));case 14:e.next=3;break;case 16:e.next=21;break;case 18:e.prev=18,e.t0=e.catch(0),this.handleError(e.t0);case 21:case"end":return e.stop()}}),e,this,[[0,18]])}))),function(){return n.apply(this,arguments)})},{key:"setupEventListeners",value:function(){var e=this;this.socket&&(this.socket.onopen=function(){e.state="open",e.emit("open")},this.socket.onmessage=function(t){var n=JSON.parse(t.data);e.dispatchMessage(n)},this.socket.onclose=function(){e.state="closed",e.emit("close")})}},{key:"waitForClose",value:(t=u()(l()().mark((function e(){var t;return l()().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if((null===(t=this.socket)||void 0===t?void 0:t.readyState)===v().CLOSED){e.next=5;break}return e.next=3,new Promise((function(e){return setTimeout(e,100)}));case 3:e.next=0;break;case 5:case"end":return e.stop()}}),e,this)}))),function(){return t.apply(this,arguments)})},{key:"subscribe",value:function(e,t){var n=this.subscriptions.get(e)||new Set;if(!n.has(t)){n.add(t),this.subscriptions.set(e,n);var a={action:"subscribe",topic:e};this.send(a)}}},{key:"unsubscribe",value:function(e,t){var n=this.subscriptions.get(e)||new Set;if(n.has(t)){n.delete(t);var a={action:"unsubscribe",topic:e};this.send(a)}}},{key:"send",value:function(e){var t;(null===(t=this.socket)||void 0===t?void 0:t.readyState)===v().OPEN&&this.socket.send(JSON.stringify(e))}},{key:"dispatchMessage",value:function(e){var t=e.type,n=r()(e,f),a=this.subscriptions.get(t)||new Set;i()(a).forEach((function(e){return e(n)}))}},{key:"startHeartbeat",value:function(){var e=this;this.heartbeatTimeout=setInterval((function(){var t;(null===(t=e.socket)||void 0===t?void 0:t.readyState)===v().OPEN&&e.socket.send(JSON.stringify({type:"heartbeat"}))}),this.options.heartbeatInterval)}},{key:"stopHeartbeat",value:function(){this.heartbeatTimeout&&clearInterval(this.heartbeatTimeout)}},{key:"close",value:function(){this.socket&&(this.state="closed",this.stopHeartbeat(),this.socket.close(),this.emit("close"))}},{key:"handleError",value:function(e){console.error("WebSocket错误:",e),this.emit("error",e)}},{key:"on",value:function(e,t){}},{key:"emit",value:function(e,t){}}],[{key:"getInstance",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1?arguments[1]:void 0;return e.instance||(e.instance=new e(t,n)),e.instance}}]),e}();b()(Z,"instance",null),t.Z=Z}}]);