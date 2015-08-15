"use strict";angular.module("irisChatApp",["ngCookies","ngResource","ngSanitize","btford.socket-io","ui.router","ui.bootstrap"]).config(["$stateProvider","$urlRouterProvider","$locationProvider","$httpProvider",function(a,b,c,d){b.otherwise("/"),c.html5Mode(!0),d.interceptors.push("authInterceptor")}]).factory("authInterceptor",["$rootScope","$q","$cookieStore","$location",function(a,b,c,d){return{request:function(a){return a.headers=a.headers||{},c.get("token")&&(a.headers.Authorization="Bearer "+c.get("token")),a},responseError:function(a){return 401===a.status?(d.path("/login"),c.remove("token"),b.reject(a)):b.reject(a)}}}]).run(["$rootScope","$location","Auth","$state",function(a,b,c,d){a.$on("$stateChangeStart",function(a,b){c.isLoggedInAsync(function(c){b.authenticate&&!c&&(a.preventDefault(),d.go("login"))})})}]),angular.module("irisChatApp").controller("AboutCtrl",["$scope",function(a){}]),angular.module("irisChatApp").config(["$stateProvider",function(a){a.state("about",{url:"/about",templateUrl:"app/about/about.html",controller:"AboutCtrl"})}]),angular.module("irisChatApp").config(["$stateProvider",function(a){a.state("login",{url:"/login",templateUrl:"app/account/login/login.html",controller:"LoginCtrl"}).state("signup",{url:"/signup",templateUrl:"app/account/signup/signup.html",controller:"SignupCtrl"}).state("settings",{url:"/settings",templateUrl:"app/account/settings/settings.html",controller:"SettingsCtrl",authenticate:!0})}]),angular.module("irisChatApp").controller("LoginCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.login=function(d){a.submitted=!0,d.$valid&&b.login({email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){a.errors.other=b.message})},a.loginOauth=function(a){d.location.href="/auth/"+a},a.loginNusOpenId=function(){d.location.href="/auth/nus-openid"}}]),angular.module("irisChatApp").controller("SettingsCtrl",["$scope","User","Auth",function(a,b,c){a.errors={},a.changePassword=function(b){a.submitted=!0,b.$valid&&c.changePassword(a.user.oldPassword,a.user.newPassword).then(function(){a.message="Password successfully changed."})["catch"](function(){b.password.$setValidity("mongoose",!1),a.errors.other="Incorrect password",a.message=""})}}]),angular.module("irisChatApp").controller("SignupCtrl",["$scope","Auth","$location","$window",function(a,b,c,d){a.user={},a.errors={},a.register=function(d){a.submitted=!0,d.$valid&&b.createUser({name:a.user.name,email:a.user.email,password:a.user.password}).then(function(){c.path("/")})["catch"](function(b){b=b.data,a.errors={},angular.forEach(b.errors,function(b,c){d[c].$setValidity("mongoose",!1),a.errors[c]=b.message})})},a.loginOauth=function(a){d.location.href="/auth/"+a},a.loginNusOpenId=function(){d.location.href="/auth/nus-openid"}}]),angular.module("irisChatApp").controller("AdminCtrl",["$scope","$http","Auth","User",function(a,b,c,d){a.users=d.query(),a["delete"]=function(b){d.remove({id:b._id}),angular.forEach(a.users,function(c,d){c===b&&a.users.splice(d,1)})}}]),angular.module("irisChatApp").config(["$stateProvider",function(a){a.state("admin",{url:"/admin",templateUrl:"app/admin/admin.html",controller:"AdminCtrl"})}]),angular.module("irisChatApp").controller("HistoryCtrl",["$scope","$http","User",function(a,b,c){var d=c.get({},function(){b.get("api/rooms/"+d._id+"/history").then(function(b){a.rooms=b.data,console.log(a.rooms)})})}]),angular.module("irisChatApp").config(["$stateProvider",function(a){a.state("history",{url:"/history",templateUrl:"app/history/history.html",controller:"HistoryCtrl",authenticate:!0}).state("session",{url:"/history/{roomId}",templateUrl:"app/history/session.html",controller:"SessionCtrl",authenticate:!0,resolve:{session:["$stateParams","$http",function(a,b){return b.get("api/rooms/"+a.roomId).then(function(a){return a.data})}]}})}]),angular.module("irisChatApp").controller("SessionCtrl",["$scope","session","User",function(a,b,c){var d=c.get({},function(){a.userId=d._id});a.session=b}]),angular.module("irisChatApp").controller("MainCtrl",["$scope","$http","socket","User","$state",function(a,b,c,d,e){function f(){""!==a.input&&(b.post("/api/messages",{text:a.input,sender:i._id}).then(function(a){var d=a.data;c.sendMessage(d),b.post("/api/rooms/send",{roomId:h._id,msgId:d._id})}),a.input="")}function g(){c.leaveRoom(),e.reload()}var h;a.messages=[],a.inactive=!0;var i=d.get({},function(){a.userId=i._id,b.post("api/rooms",{userId:i._id}).then(function(b){h=b.data,c.joinRoom(h._id),c.syncSession(a.messages,a.inactive),a.send=f,a.newSession=g;var d=new Date,e=d.getHours(),i=d.getMinutes();1>e/10&&(e="0"+e),1>i/10&&(i="0"+i),a.messages.push({sender:"System",text:"You are connected! =)",timestamp:e+":"+i}),2===h.chatters.length&&c.secondUser()})});a.input="",a.$on("logout",function(){c.leaveRoom()})}]),angular.module("irisChatApp").config(["$stateProvider",function(a){a.state("main",{url:"/",templateUrl:"app/main/main.html",controller:"MainCtrl",authenticate:!0})}]),angular.module("irisChatApp").factory("Auth",["$location","$rootScope","$http","User","$cookieStore","$q",function(a,b,c,d,e,f){var g={};return e.get("token")&&(g=d.get()),{login:function(a,b){var h=b||angular.noop,i=f.defer();return c.post("/auth/local",{email:a.email,password:a.password}).success(function(a){return e.put("token",a.token),g=d.get(),i.resolve(a),h()}).error(function(a){return this.logout(),i.reject(a),h(a)}.bind(this)),i.promise},logout:function(){e.remove("token"),g={}},createUser:function(a,b){var c=b||angular.noop;return d.save(a,function(b){return e.put("token",b.token),g=d.get(),c(a)},function(a){return this.logout(),c(a)}.bind(this)).$promise},changePassword:function(a,b,c){var e=c||angular.noop;return d.changePassword({id:g._id},{oldPassword:a,newPassword:b},function(a){return e(a)},function(a){return e(a)}).$promise},getCurrentUser:function(){return g},isLoggedIn:function(){return g.hasOwnProperty("role")},isLoggedInAsync:function(a){g.hasOwnProperty("$promise")?g.$promise.then(function(){a(!0)})["catch"](function(){a(!1)}):a(g.hasOwnProperty("role")?!0:!1)},isAdmin:function(){return"admin"===g.role},getToken:function(){return e.get("token")}}}]),angular.module("irisChatApp").factory("User",["$resource",function(a){return a("/api/users/:id/:controller",{id:"@_id"},{changePassword:{method:"PUT",params:{controller:"password"}},get:{method:"GET",params:{id:"me"}}})}]),angular.module("irisChatApp").filter("senderFilter",function(){return function(a,b){return"System"===a?"System":a===b?"You":"Stranger"}}),angular.module("irisChatApp").factory("Modal",["$rootScope","$modal",function(a,b){function c(c,d){var e=a.$new();return c=c||{},d=d||"modal-default",angular.extend(e,c),b.open({templateUrl:"components/modal/modal.html",windowClass:d,scope:e})}return{confirm:{"delete":function(a){return a=a||angular.noop,function(){var b,d=Array.prototype.slice.call(arguments),e=d.shift();b=c({modal:{dismissable:!0,title:"Confirm Delete",html:"<p>Are you sure you want to delete <strong>"+e+"</strong> ?</p>",buttons:[{classes:"btn-danger",text:"Delete",click:function(a){b.close(a)}},{classes:"btn-default",text:"Cancel",click:function(a){b.dismiss(a)}}]}},"modal-danger"),b.result.then(function(b){a.apply(b,d)})}}}}}]),angular.module("irisChatApp").directive("mongooseError",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(){return d.$setValidity("mongoose",!0)})}}}),angular.module("irisChatApp").controller("NavbarCtrl",["$scope","$location","Auth",function(a,b,c){a.menu=[{title:"Chat",link:"/"},{title:"History",link:"/history"}],a.isCollapsed=!0,a.isLoggedIn=c.isLoggedIn,a.isAdmin=c.isAdmin,a.getCurrentUser=c.getCurrentUser,a.logout=function(){c.logout(),b.path("/login"),a.$emit("logout")},a.isActive=function(a){return a===b.path()}}]),angular.module("irisChatApp").factory("socket",["socketFactory",function(a){var b=io("",{path:"/socket.io-client"}),c=a({ioSocket:b});return{socket:c,leaveRoom:function(){c.emit("leaveRoom")},joinRoom:function(a){c.emit("joinRoom",a)},secondUser:function(){c.emit("secondUser")},syncSession:function(a,b){c.on("sendMessage",function(b){a.push(b)}),c.on("secondUser",function(){var c=new Date,d=c.getHours(),e=c.getMinutes();1>d/10&&(d="0"+d),1>e/10&&(e="0"+e),a.push({sender:"System",text:"Another user has connected. You may start chatting now. Say hi! =)",timestamp:d+":"+e}),b=!1}),c.on("leaveRoom",function(){var b=new Date,c=b.getHours(),d=b.getMinutes();1>c/10&&(c="0"+c),1>d/10&&(d="0"+d),a.push({sender:"System",text:"The other user has disconnected. Start a new chat!",timestamp:c+":"+d})})},sendMessage:function(a){c.emit("sendMessage",a)}}}]),angular.module("irisChatApp").run(["$templateCache",function(a){a.put("app/about/about.html","<div ng-include=\"'components/navbar/navbar.html'\"></div>"),a.put("app/account/login/login.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><section id=intro><div class=container><div class=jumbotron><div id=intro-word><h1>IRISchat</h1><p>Your personal space to pour your hearts</p></div></div></div></section><section id=features><div class=container><div class=row><div id=chat class=col-md-6><img src=https://cdn3.iconfinder.com/data/icons/forall/1062/conversation-256.png> <span><pre>\nPour your hearts\nanonymously and\ndon\'t worry about\nbeing judged!\n          </pre></span></div><div id=history class=col-md-6><img src=https://cdn3.iconfinder.com/data/icons/forall/995/challenge-256.png> <span><pre>\nView your previous\nchats whenever you\nneed!\n          </pre></span></div></div></div></section><section id=get-started><div class=container><div class=row><div class="col-xs-4 col-xs-offset-4"><h1>Now let\'s get started!</h1><p><a class="btn btn-primary" href="" ng-click=loginNusOpenId()><span class="glyphicon glyphicon-log-in" aria-hidden=true></span> Connect with NUS Open ID</a></p></div></div></div></section>'),a.put("app/account/settings/settings.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class="btn btn-lg btn-primary" type=submit>Save changes</button></form></div></div></div>'),a.put("app/account/signup/signup.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class="{ \'has-success\': form.name.$valid && submitted,\n                                            \'has-error\': form.name.$invalid && submitted }"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show="form.name.$error.required && submitted">A name is required</p></div><div class=form-group ng-class="{ \'has-success\': form.email.$valid && submitted,\n                                            \'has-error\': form.email.$invalid && submitted }"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show="form.email.$error.email && submitted">Doesn\'t look like a valid email.</p><p class=help-block ng-show="form.email.$error.required && submitted">What\'s your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class="{ \'has-success\': form.password.$valid && submitted,\n                                            \'has-error\': form.password.$invalid && submitted }"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show="(form.password.$error.minlength || form.password.$error.required) && submitted">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class="btn btn-inverse btn-lg btn-login" type=submit>Sign up</button> <a class="btn btn-default btn-lg btn-register" href=/login>Login</a></div><hr><div><a class="btn btn-primary" href="" ng-click=loginNusOpenId()><span class="glyphicon glyphicon-log-in" aria-hidden=true></span> Connect with NUS Open ID</a> <a class="btn btn-facebook" href="" ng-click="loginOauth(\'facebook\')"><i class="fa fa-facebook"></i> Connect with Facebook</a> <a class="btn btn-google-plus" href="" ng-click="loginOauth(\'google\')"><i class="fa fa-google-plus"></i> Connect with Google+</a></div></form></div></div><hr></div>'),a.put("app/admin/admin.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li class=list-group-item ng-repeat="user in users"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'),a.put("app/history/history.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><section id=history-section><div class=container><div class=list-group><a class=list-group-item href=/history/{{room._id}} ng-repeat="room in rooms">{{room.timestamp}}</a></div></div></section><footer class=footer><div class=container><p>IRISchat &copy</p></div></footer>'),a.put("app/history/session.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><section id=session-section><div class=container><div class=row><div class="col-md-8 col-md-offset-2" id=session-box><div ng-repeat="msg in session.messages track by $index"><div class=row><div class=col-xs-2 id=sender><span class={{msg.sender|senderFilter:userId}}>{{msg.sender|senderFilter:userId}}:</span></div><div class="col-xs-8 col-lg-9 col-md-9" id=text><p>{{msg.text}}</p></div><div class="col-xs-2 col-lg-1 col-md-1" id=time><span>{{msg.timestamp}}</span></div></div></div></div></div></div></section><footer class=footer><div class=container><p>IRISchat &copy</p></div></footer>'),a.put("app/main/main.html",'<div ng-include="\'components/navbar/navbar.html\'"></div><section id=chat-section><div class=container><div class=row><!-- where messages are rendered --><div class="col-md-8 col-md-offset-2" id=chat-box><div ng-repeat="msg in messages track by $index"><div class=row><div class=col-xs-2 id=sender><span class={{msg.sender|senderFilter:userId}}>{{msg.sender|senderFilter:userId}}:</span><!-- if just msg, this wil display the JSON object, with quotations over fields --></div><div class="col-xs-8 col-lg-9 col-md-9" id=text><p>{{msg.text}}</p></div><div class="col-xs-2 col-lg-1 col-md-1" id=time><span>{{msg.timestamp}}</span></div></div></div></div><!-- where input box is --><div class="col-md-8 col-md-offset-2" id=input-box><button id=new type=submit class="btn btn-primary" ng-click=newSession()>NEW</button><form ng-submit=send()><div class=input-group><input class=form-control placeholder="Type your message here..." ng-model=input submit=send() ng-disabled=inactive> <span class=input-group-btn><button class="btn btn-primary" type=submit ng-click=send() ng-disabled=inactive>send</button></span></div></form></div></div></div></section><footer class=footer><div class=container><p>IRISchat &copy</p></div></footer>'),a.put("components/modal/modal.html",'<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'),a.put("components/navbar/navbar.html",'<div class="navbar navbar-default navbar-static-top" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click="isCollapsed = !isCollapsed"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href="/" class=navbar-brand><span id=brand>IRISchat</span></a></div><div collapse=isCollapsed class="navbar-collapse collapse" id=navbar-main><ul class="nav navbar-nav navbar-right"><li ng-show=isLoggedIn()><p class=navbar-text>Hello, {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}} ng-click="isCollapsed = !isCollapsed">{{item.title}}</a></li><li ng-class="{active: isActive(\'/about\')}"><a href=# ng-click="isCollapsed = true">About</a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(\'/login\')}"><a href=/login ng-click="isCollapsed = true">Login</a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(\'/logout\')}"><a href="" ng-click=logout() ng-click="isCollapsed = true">Logout</a></li></ul></div></div></div>')}]);