import { statsToGraph } from "./stats_to_graph";

it("converts simple modules", () => {
  const input = {
    modules: [
      {
        name: "foo",
        reasons: [{ moduleName: "zap" }]
      }
    ]
  };

  expect(statsToGraph(input)).toEqual([
    {
      target: "foo",
      source: "zap"
    }
  ]);
});

it("handles webpack magic", () => {
  const input = {
    modules: [
      {
        name: "(webpack)/buildin/foo",
        reasons: [{ moduleName: "zap" }]
      }
    ]
  };

  expect(statsToGraph(input)).toEqual([
    {
      target: "node_modules/webpack/buildin/foo",
      source: "zap"
    }
  ]);
});

it("converts simple many modules", () => {
  const input = {
    modules: [
      {
        name: "foo",
        reasons: [{ moduleName: "zap" }]
      },
      {
        name: "tap",
        reasons: [{ moduleName: "foo" }]
      }
    ]
  };

  expect(statsToGraph(input)).toEqual([
    {
      target: "foo",
      source: "zap"
    },
    { target: "tap", source: "foo" }
  ]);
});

it("handles complex", () => {
  const input = {
    modules: [
      {
        id: 66,
        identifier:
          "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js 59d10e2e32a464f5315c2541026bb970",
        name: "./src/index.js + 4 modules",
        index: 1,
        index2: 87,
        size: 12484,
        cacheable: true,
        built: true,
        optional: false,
        prefetched: false,
        chunks: [0],
        issuer: null,
        issuerId: null,
        issuerName: null,
        issuerPath: null,
        failed: false,
        errors: 0,
        warnings: 0,
        assets: [],
        reasons: [
          {
            moduleId: 34,
            moduleIdentifier:
              "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            module: "multi ./src/index.js",
            moduleName: "multi ./src/index.js",
            type: "single entry",
            userRequest:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            loc: "main[0]"
          }
        ],
        usedExports: true,
        providedExports: [],
        optimizationBailout: [
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/createClass.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/inherits.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@babel/runtime/regenerator/index.js (<- Module is not an ECMAScript module)",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/@sentry/browser/dist/index.js (<- Module is not an ECMAScript module)",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react-dom/index.js (<- Module is not an ECMAScript module)",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react-router-dom/es/BrowserRouter.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react-router-dom/es/Link.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react-router-dom/es/Route.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react-router-dom/es/Switch.js",
          "ModuleConcatenation bailout: Cannot concat with ./node_modules/react/index.js (<- Module is not an ECMAScript module)"
        ],
        depth: 1,
        modules: [
          {
            id: null,
            identifier:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            name: "./src/index.js",
            index: 1,
            index2: 87,
            size: 419,
            cacheable: true,
            built: true,
            optional: false,
            prefetched: false,
            chunks: [],
            issuer:
              "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            issuerId: 34,
            issuerName: "multi ./src/index.js",
            issuerPath: [
              {
                id: 34,
                identifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "multi ./src/index.js"
              }
            ],
            failed: false,
            errors: 0,
            warnings: 0,
            assets: [],
            reasons: [
              {
                moduleId: 34,
                moduleIdentifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                module: "multi ./src/index.js",
                moduleName: "multi ./src/index.js",
                type: "single entry",
                userRequest:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                loc: "main[0]"
              }
            ],
            usedExports: true,
            providedExports: [],
            optimizationBailout: [
              "ModuleConcatenation bailout: Module is referenced from these modules with unsupported syntax: multi ./src/index.js (referenced with single entry)"
            ],
            depth: 1,
            source:
              'import React from"react";import ReactDOM from"react-dom";import App from"./App";import*as serviceWorker from"./serviceWorker";import"./index.css";var rootEl=document.getElementById("root");ReactDOM.render(React.createElement(App,null),rootEl);if(module.hot){module.hot.accept("./App",function(){var NextApp=require("./App").default;ReactDOM.render(React.createElement(NextApp,null),rootEl);});}serviceWorker.register();'
          },
          {
            id: null,
            identifier:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
            name: "./src/App.tsx",
            index: 10,
            index2: 79,
            size: 2657,
            cacheable: true,
            built: true,
            optional: false,
            prefetched: false,
            chunks: [],
            issuer:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            issuerId: null,
            issuerName: "./src/index.js",
            issuerPath: [
              {
                id: 34,
                identifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "multi ./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "./src/index.js"
              }
            ],
            failed: false,
            errors: 0,
            warnings: 0,
            assets: [],
            reasons: [
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                module: "./src/index.js",
                moduleName: "./src/index.js",
                type: "harmony side effect evaluation",
                userRequest: "./App",
                loc: "1:57-80"
              },
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                module: "./src/index.js",
                moduleName: "./src/index.js",
                type: "harmony import specifier",
                userRequest: "./App",
                loc: "1:225-228"
              }
            ],
            usedExports: ["default"],
            providedExports: ["default"],
            optimizationBailout: [],
            depth: 2,
            source:
              'import _classCallCheck from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/classCallCheck";import _createClass from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/createClass";import _possibleConstructorReturn from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn";import _getPrototypeOf from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/getPrototypeOf";import _inherits from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/inherits";import{BrowserRouter as Router,Route,Switch}from"react-router-dom";import React,{Component,Suspense,lazy}from"react";import Header from"./Header";import ErrorBoundry from"./ErrorBoundry";var Bundle=lazy(function(){return import("./bundle/Bundle");});var Home=lazy(function(){return import("./home/Home");});var Resolve=lazy(function(){return import("./resolve/Resolve");});var App=/*#__PURE__*/function(_Component){_inherits(App,_Component);function App(props){var _this;_classCallCheck(this,App);_this=_possibleConstructorReturn(this,_getPrototypeOf(App).call(this,props));_this.state={};return _this;}_createClass(App,[{key:"render",value:function render(){if(process.env.NODE_ENV==="production"){if(!new URLSearchParams(window.location.search).has("randal")){return"no access";}}return React.createElement(Router,null,React.createElement(ErrorBoundry,null,React.createElement("div",{className:"App"},React.createElement(Header,null),React.createElement("div",{className:"Page"},React.createElement(Suspense,{fallback:React.createElement("div",null,"Loading...")},React.createElement(Switch,null,React.createElement(Route,{path:"/bundle",component:function component(_ref){var location=_ref.location;var params=new URLSearchParams(location.search);return React.createElement(Bundle,{trimmedNetwork:location.state.trimmedNetwork,rollups:location.state.rollups,duplicateNodeModules:location.state.duplicateNodeModules,selected:params.get("selected"),hierarchy:location.state.hierachy});}}),React.createElement(Route,{path:"/",component:function component(h){return React.createElement(Home,{history:h.history,graphNodes:h.location.state&&h.location.state.graphNodes,processedSourceMap:h.location.state&&h.location.state.processedSourceMap,sourceMapFileTransform:h.location.state&&h.location.state.sourceMapFileTransform,graphFileTransform:h.location.state&&h.location.state.graphFileTransform});}})))))));}}]);return App;}(Component);export default App;'
          },
          {
            id: null,
            identifier:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/serviceWorker.ts",
            name: "./src/serviceWorker.ts",
            index: 82,
            index2: 84,
            size: 5558,
            cacheable: true,
            built: true,
            optional: false,
            prefetched: false,
            chunks: [],
            issuer:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
            issuerId: null,
            issuerName: "./src/index.js",
            issuerPath: [
              {
                id: 34,
                identifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "multi ./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "./src/index.js"
              }
            ],
            failed: false,
            errors: 0,
            warnings: 0,
            assets: [],
            reasons: [
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                module: "./src/index.js",
                moduleName: "./src/index.js",
                type: "harmony side effect evaluation",
                userRequest: "./serviceWorker",
                loc: "1:80-126"
              },
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                module: "./src/index.js",
                moduleName: "./src/index.js",
                type: "harmony import specifier",
                userRequest: "./serviceWorker",
                loc: "1:394-416"
              }
            ],
            usedExports: ["register"],
            providedExports: ["register", "showRefreshUI", "unregister"],
            optimizationBailout: [],
            depth: 2,
            source:
              'import _regeneratorRuntime from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/regenerator";import _asyncToGenerator from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/asyncToGenerator";var isLocalhost=Boolean(window.location.hostname==="localhost"||// [::1] is the IPv6 localhost address.\nwindow.location.hostname==="[::1]"||// 127.0.0.1/8 is considered localhost for IPv4.\nwindow.location.hostname.match(/^127(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));export function register(config){if(process.env.NODE_ENV==="production"&&"serviceWorker"in navigator){// The URL constructor is available in all browsers that support SW.\nvar publicUrl=new URL(process.env.PUBLIC_URL,window.location.href);if(publicUrl.origin!==window.location.origin){// Our service worker won\'t work if PUBLIC_URL is on a different origin\n// from what our page is served on. This might happen if a CDN is used to\n// serve assets; see https://github.com/facebook/create-react-app/issues/2374\nreturn;}window.addEventListener("load",/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee(){var swUrl;return _regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:swUrl="".concat(process.env.PUBLIC_URL,"/service-worker.js");if(!isLocalhost){_context.next=8;break;}// This is running on localhost. Let\'s check if a service worker still exists or not.\ncheckValidServiceWorker(swUrl,config);_context.next=5;return navigator.serviceWorker.ready;case 5:console.info("service worker ready [dev mode]");_context.next=9;break;case 8:// Is not localhost. Just register service worker\nregisterValidSW(swUrl,config);case 9:case"end":return _context.stop();}}},_callee,this);})));}}export function showRefreshUI(registration){// TODO: Display a toast or refresh UI.\nvar button=document.createElement("button");button.style.position="absolute";button.style.bottom="24px";button.style.left="24px";button.textContent="This site has updated. Please click to see changes.";button.addEventListener("click",function(){if(!registration.waiting){console.info("Missing registration waiting");// Just to ensure registration.waiting is available before\n// calling postMessage()\nreturn;}button.disabled=true;registration.waiting.postMessage("skipWaiting");});document.body.appendChild(button);}function onNewServiceWorker(registration,callback){if(registration.waiting){// SW is waiting to activate. Can occur if multiple clients open and\n// one of the clients is refreshed.\nreturn callback();}function listenInstalledStateChange(){if(registration.installing!=null){registration.installing.addEventListener("statechange",function(event){if(event.target!=null&&event.target.state==="installed"){// A new service worker is available, inform the user\ncallback();}});}}if(registration.installing){return listenInstalledStateChange();}// We are currently controlled so a new SW may be found...\n// Add a listener in case a new SW is found,\nregistration.addEventListener("updatefound",listenInstalledStateChange);}function registerValidSW(swUrl,config){navigator.serviceWorker.register(swUrl).then(function(registration){registration.onupdatefound=function(){var installingWorker=registration.installing;if(installingWorker==null){return;}installingWorker.onstatechange=function(){if(navigator.serviceWorker.controller!=null){var preventDevToolsReloadLoop=false;navigator.serviceWorker.addEventListener("controllerchange",function(event){// Ensure refresh is only called once.\n// This works around a bug in "force update on reload".\nif(preventDevToolsReloadLoop)return;preventDevToolsReloadLoop=true;window.location.reload(true);});onNewServiceWorker(registration,function(){showRefreshUI(registration);});}if(installingWorker.state==="installed"){if(navigator.serviceWorker.controller){// At this point, the updated precached content has been fetched,\n// but the previous service worker will still serve the older\n// content until all client tabs are closed.\nconsole.log("New content is available and will be used when all "+"tabs for this page are closed. See http://bit.ly/CRA-PWA.");// Execute callback\nif(config&&config.onUpdate){config.onUpdate(registration);}}else{// At this point, everything has been precached.\n// It\'s the perfect time to display a\n// "Content is cached for offline use." message.\nconsole.log("Content is cached for offline use.");// Execute callback\nif(config&&config.onSuccess){config.onSuccess(registration);}}}};};}).catch(function(error){console.error("Error during service worker registration:",error);});}function checkValidServiceWorker(swUrl,config){// Check if the service worker can be found. If it can\'t reload the page.\nfetch(swUrl).then(function(response){// Ensure service worker exists, and that we really are getting a JS file.\nvar contentType=response.headers.get("content-type");if(response.status===404||contentType!=null&&contentType.indexOf("javascript")===-1){// No service worker found. Probably a different app. Reload the page.\nnavigator.serviceWorker.ready.then(function(registration){registration.unregister().then(function(){window.location.reload();});});}else{// Service worker found. Proceed as normal.\nregisterValidSW(swUrl,config);}}).catch(function(){console.log("No internet connection found. App is running in offline mode.");});}export function unregister(){if("serviceWorker"in navigator){navigator.serviceWorker.ready.then(function(registration){registration.unregister();});}}'
          },
          {
            id: null,
            identifier:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/Header.js",
            name: "./src/Header.js",
            index: 19,
            index2: 32,
            size: 2174,
            cacheable: true,
            built: true,
            optional: false,
            prefetched: false,
            chunks: [],
            issuer:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
            issuerId: null,
            issuerName: "./src/App.tsx",
            issuerPath: [
              {
                id: 34,
                identifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "multi ./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                name: "./src/App.tsx"
              }
            ],
            failed: false,
            errors: 0,
            warnings: 0,
            assets: [],
            reasons: [
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                module: "./src/App.tsx",
                moduleName: "./src/App.tsx",
                type: "harmony side effect evaluation",
                userRequest: "./Header",
                loc: "1:821-850"
              },
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                module: "./src/App.tsx",
                moduleName: "./src/App.tsx",
                type: "harmony import specifier",
                userRequest: "./Header",
                loc: "1:1627-1633"
              }
            ],
            usedExports: ["default"],
            providedExports: ["default"],
            optimizationBailout: [],
            depth: 3,
            source:
              'import _classCallCheck from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/classCallCheck";import _createClass from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/createClass";import _possibleConstructorReturn from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn";import _getPrototypeOf from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/getPrototypeOf";import _inherits from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/inherits";import React,{Component}from"react";import{Link}from"react-router-dom";// noopener noreferrer\n// <p>\n// <Link to="/import">Import</Link>\n// </p>\nvar Header=/*#__PURE__*/function(_Component){_inherits(Header,_Component);function Header(){_classCallCheck(this,Header);return _possibleConstructorReturn(this,_getPrototypeOf(Header).apply(this,arguments));}_createClass(Header,[{key:"render",value:function render(){return React.createElement("header",{className:"App-header flex baseline padding"},React.createElement("img",{className:"logo",src:"/icon.png",width:"60",height:"60",alt:"Bundle Buddy logo"}),React.createElement("h1",null,"Bundle Buddy"),React.createElement("div",{className:"flex nav space-between padding"},React.createElement(Link,{to:"/"},React.createElement("svg",{viewBox:"0 0 24 24",width:"2em",height:"1em"},React.createElement("title",null,"house"),React.createElement("g",{fill:"#111111"},React.createElement("path",{d:"M22.625,8.219l-10-8a1,1,0,0,0-1.25,0l-10,8A1,1,0,0,0,1,9V22a1,1,0,0,0,1,1H9V15h6v8h7a1,1,0,0,0,1-1V9A1,1,0,0,0,22.625,8.219Z",fill:"#111111"}))),"Home"),React.createElement(Link,{to:"/bundle"},React.createElement("svg",{viewBox:"0 0 24 24",width:"2em",height:"1em"},React.createElement("title",null,"bookmark"),React.createElement("g",{fill:"#111111"},React.createElement("path",{d:"M22,24,12,18,2,24V3A3,3,0,0,1,5,0H19a3,3,0,0,1,3,3Z",fill:"#111111"}))),"Saved Bundles")));}}]);return Header;}(Component);export default Header;'
          },
          {
            id: null,
            identifier:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/ErrorBoundry.tsx",
            name: "./src/ErrorBoundry.tsx",
            index: 36,
            index2: 67,
            size: 1601,
            cacheable: true,
            built: true,
            optional: false,
            prefetched: false,
            chunks: [],
            issuer:
              "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
            issuerId: null,
            issuerName: "./src/App.tsx",
            issuerPath: [
              {
                id: 34,
                identifier:
                  "multi /Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "multi ./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/eslint-loader/index.js??ref--5-0!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/index.js",
                name: "./src/index.js"
              },
              {
                id: null,
                identifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                name: "./src/App.tsx"
              }
            ],
            failed: false,
            errors: 0,
            warnings: 0,
            assets: [],
            reasons: [
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                module: "./src/App.tsx",
                moduleName: "./src/App.tsx",
                type: "harmony side effect evaluation",
                userRequest: "./ErrorBoundry",
                loc: "1:850-891"
              },
              {
                moduleId: null,
                moduleIdentifier:
                  "/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/react-scripts/node_modules/babel-loader/lib/index.js??ref--6-oneOf-1!/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/src/App.tsx",
                module: "./src/App.tsx",
                moduleName: "./src/App.tsx",
                type: "harmony import specifier",
                userRequest: "./ErrorBoundry",
                loc: "1:1545-1557"
              }
            ],
            usedExports: ["default"],
            providedExports: ["default"],
            optimizationBailout: [],
            depth: 3,
            source:
              'import _classCallCheck from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/classCallCheck";import _createClass from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/createClass";import _possibleConstructorReturn from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn";import _getPrototypeOf from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/getPrototypeOf";import _inherits from"/Users/samccone/Desktop/repos/bundle-buddy/explorer/app/node_modules/@babel/runtime/helpers/esm/inherits";import{Component}from"react";import*as Sentry from\'@sentry/browser\';var ErrorBoundry=/*#__PURE__*/function(_Component){_inherits(ErrorBoundry,_Component);function ErrorBoundry(props){var _this;_classCallCheck(this,ErrorBoundry);_this=_possibleConstructorReturn(this,_getPrototypeOf(ErrorBoundry).call(this,props));Sentry.init({dsn:"https://9e475abe454047779775876c0d1af187@sentry.io/1365297"});_this.state={error:null};return _this;}_createClass(ErrorBoundry,[{key:"componentDidCatch",value:function componentDidCatch(error,errorInfo){if(process.env.NODE_ENV===\'production\'){Sentry.withScope(function(scope){Object.keys(errorInfo).forEach(function(key){scope.setExtra(key,errorInfo[key]);});Sentry.captureException(error);});}else{console.error(error,errorInfo);}}},{key:"render",value:function render(){return this.props.children;}}]);return ErrorBoundry;}(Component);export default ErrorBoundry;'
          }
        ],
        filteredModules: 0
      }
    ]
  };

  expect(statsToGraph(input)).toEqual([
    { target: "./src/index.js", source: "multi ./src/index.js" },
    { target: "./src/App.tsx", source: "./src/index.js" },
    { target: "./src/serviceWorker.ts", source: "./src/index.js" },
    { target: "./src/Header.js", source: "./src/App.tsx" },
    { target: "./src/ErrorBoundry.tsx", source: "./src/App.tsx" }
  ]);
});
