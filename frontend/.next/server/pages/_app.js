/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/AuthWrapper.js":
/*!***********************************!*\
  !*** ./components/AuthWrapper.js ***!
  \***********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ AuthWrapper)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contexts/AuthContext */ \"./contexts/AuthContext.js\");\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/firebase */ \"./lib/firebase.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_1__, _lib_firebase__WEBPACK_IMPORTED_MODULE_2__]);\n([_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_1__, _lib_firebase__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// components/AuthWrapper.jsx\n\n\n\nfunction AuthWrapper({ children }) {\n    const { user } = (0,_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_1__.useAuth)();\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        if (user) _lib_firebase__WEBPACK_IMPORTED_MODULE_2__.auth.currentUser?.getIdToken().then((t)=>window.authToken = t);\n    }, [\n        user\n    ]);\n    window.authenticatedFetch = async (url, opts = {})=>{\n        const t = await _lib_firebase__WEBPACK_IMPORTED_MODULE_2__.auth.currentUser?.getIdToken();\n        return fetch(url, {\n            ...opts,\n            headers: {\n                ...opts.headers,\n                Authorization: `Bearer ${t}`\n            }\n        });\n    };\n    return children;\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0F1dGhXcmFwcGVyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsNkJBQTZCO0FBQ0s7QUFDa0I7QUFDUjtBQUU3QixTQUFTRyxZQUFZLEVBQUVDLFFBQVEsRUFBRTtJQUM5QyxNQUFNLEVBQUVDLElBQUksRUFBRSxHQUFHSiw4REFBT0E7SUFFeEJELGdEQUFTQSxDQUFDO1FBQ1IsSUFBSUssTUFBTUgsK0NBQUlBLENBQUNJLFdBQVcsRUFBRUMsYUFBYUMsS0FBS0MsQ0FBQUEsSUFBTUMsT0FBT0MsU0FBUyxHQUFHRjtJQUN6RSxHQUFHO1FBQUNKO0tBQUs7SUFFVEssT0FBT0Usa0JBQWtCLEdBQUcsT0FBT0MsS0FBS0MsT0FBTyxDQUFDLENBQUM7UUFDL0MsTUFBTUwsSUFBSSxNQUFNUCwrQ0FBSUEsQ0FBQ0ksV0FBVyxFQUFFQztRQUNsQyxPQUFPUSxNQUFNRixLQUFLO1lBQUUsR0FBR0MsSUFBSTtZQUFFRSxTQUFTO2dCQUFFLEdBQUdGLEtBQUtFLE9BQU87Z0JBQUVDLGVBQWUsQ0FBQyxPQUFPLEVBQUVSLEVBQUUsQ0FBQztZQUFDO1FBQUU7SUFDMUY7SUFFQSxPQUFPTDtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3JpcHMtZnJvbnRlbmQvLi9jb21wb25lbnRzL0F1dGhXcmFwcGVyLmpzP2NhMWMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY29tcG9uZW50cy9BdXRoV3JhcHBlci5qc3hcclxuaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VBdXRoIH0gICBmcm9tICcuLi9jb250ZXh0cy9BdXRoQ29udGV4dCc7XHJcbmltcG9ydCB7IGF1dGggfSAgICAgIGZyb20gJy4uL2xpYi9maXJlYmFzZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdXRoV3JhcHBlcih7IGNoaWxkcmVuIH0pIHtcclxuICBjb25zdCB7IHVzZXIgfSA9IHVzZUF1dGgoKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICh1c2VyKSBhdXRoLmN1cnJlbnRVc2VyPy5nZXRJZFRva2VuKCkudGhlbih0ID0+ICh3aW5kb3cuYXV0aFRva2VuID0gdCkpO1xyXG4gIH0sIFt1c2VyXSk7XHJcblxyXG4gIHdpbmRvdy5hdXRoZW50aWNhdGVkRmV0Y2ggPSBhc3luYyAodXJsLCBvcHRzID0ge30pID0+IHtcclxuICAgIGNvbnN0IHQgPSBhd2FpdCBhdXRoLmN1cnJlbnRVc2VyPy5nZXRJZFRva2VuKCk7XHJcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7IC4uLm9wdHMsIGhlYWRlcnM6IHsgLi4ub3B0cy5oZWFkZXJzLCBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dH1gIH0gfSk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGNoaWxkcmVuO1xyXG59Il0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZUF1dGgiLCJhdXRoIiwiQXV0aFdyYXBwZXIiLCJjaGlsZHJlbiIsInVzZXIiLCJjdXJyZW50VXNlciIsImdldElkVG9rZW4iLCJ0aGVuIiwidCIsIndpbmRvdyIsImF1dGhUb2tlbiIsImF1dGhlbnRpY2F0ZWRGZXRjaCIsInVybCIsIm9wdHMiLCJmZXRjaCIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/AuthWrapper.js\n");

/***/ }),

/***/ "./contexts/AuthContext.js":
/*!*********************************!*\
  !*** ./contexts/AuthContext.js ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/firebase */ \"./lib/firebase.js\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/firestore */ \"firebase/firestore\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_auth__WEBPACK_IMPORTED_MODULE_2__, _lib_firebase__WEBPACK_IMPORTED_MODULE_3__, firebase_firestore__WEBPACK_IMPORTED_MODULE_4__]);\n([firebase_auth__WEBPACK_IMPORTED_MODULE_2__, _lib_firebase__WEBPACK_IMPORTED_MODULE_3__, firebase_firestore__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({});\nconst useAuth = ()=>(0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        const unsubscribe = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_2__.onAuthStateChanged)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.auth, async (user)=>{\n            if (user) {\n                // Get additional user data from Firestore\n                const userDoc = await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.getDoc)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.doc)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.db, \"users\", user.uid));\n                const userData = userDoc.data();\n                setUser({\n                    ...user,\n                    ...userData\n                });\n            } else {\n                setUser(null);\n            }\n            setLoading(false);\n        });\n        return unsubscribe;\n    }, []);\n    const signup = async (email, password, displayName, company)=>{\n        const { user } = await (0,firebase_auth__WEBPACK_IMPORTED_MODULE_2__.createUserWithEmailAndPassword)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.auth, email, password);\n        await (0,firebase_auth__WEBPACK_IMPORTED_MODULE_2__.updateProfile)(user, {\n            displayName\n        });\n        // Create user document in Firestore\n        await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.setDoc)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.doc)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.db, \"users\", user.uid), {\n            email,\n            displayName,\n            company,\n            role: \"broker\",\n            createdAt: new Date().toISOString(),\n            subscription: \"free\",\n            usage: {\n                transcriptions: 0,\n                pwActions: 0\n            }\n        });\n        return user;\n    };\n    const login = async (email, password)=>{\n        return (0,firebase_auth__WEBPACK_IMPORTED_MODULE_2__.signInWithEmailAndPassword)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.auth, email, password);\n    };\n    const logout = async ()=>{\n        await (0,firebase_auth__WEBPACK_IMPORTED_MODULE_2__.signOut)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.auth);\n    };\n    const value = {\n        user,\n        login,\n        signup,\n        logout,\n        loading\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: value,\n        children: !loading && children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\sasha\\\\Desktop\\\\code\\\\insurance_endurance\\\\grips\\\\frontend\\\\contexts\\\\AuthContext.js\",\n        lineNumber: 74,\n        columnNumber: 5\n    }, undefined);\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZXh0cy9BdXRoQ29udGV4dC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXVFO0FBT2hEO0FBQ29CO0FBQ2M7QUFFekQsTUFBTWMsNEJBQWNkLG9EQUFhQSxDQUFDLENBQUM7QUFFNUIsTUFBTWUsVUFBVSxJQUFNZCxpREFBVUEsQ0FBQ2EsYUFBYTtBQUU5QyxNQUFNRSxlQUFlLENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQ3ZDLE1BQU0sQ0FBQ0MsTUFBTUMsUUFBUSxHQUFHakIsK0NBQVFBLENBQUM7SUFDakMsTUFBTSxDQUFDa0IsU0FBU0MsV0FBVyxHQUFHbkIsK0NBQVFBLENBQUM7SUFFdkNDLGdEQUFTQSxDQUFDO1FBQ1IsTUFBTW1CLGNBQWNmLGlFQUFrQkEsQ0FBQ0UsK0NBQUlBLEVBQUUsT0FBT1M7WUFDbEQsSUFBSUEsTUFBTTtnQkFDUiwwQ0FBMEM7Z0JBQzFDLE1BQU1LLFVBQVUsTUFBTVYsMERBQU1BLENBQUNGLHVEQUFHQSxDQUFDRCw2Q0FBRUEsRUFBRSxTQUFTUSxLQUFLTSxHQUFHO2dCQUN0RCxNQUFNQyxXQUFXRixRQUFRRyxJQUFJO2dCQUM3QlAsUUFBUTtvQkFBRSxHQUFHRCxJQUFJO29CQUFFLEdBQUdPLFFBQVE7Z0JBQUM7WUFDakMsT0FBTztnQkFDTE4sUUFBUTtZQUNWO1lBQ0FFLFdBQVc7UUFDYjtRQUVBLE9BQU9DO0lBQ1QsR0FBRyxFQUFFO0lBRUwsTUFBTUssU0FBUyxPQUFPQyxPQUFPQyxVQUFVQyxhQUFhQztRQUNsRCxNQUFNLEVBQUViLElBQUksRUFBRSxHQUFHLE1BQU1iLDZFQUE4QkEsQ0FBQ0ksK0NBQUlBLEVBQUVtQixPQUFPQztRQUNuRSxNQUFNckIsNERBQWFBLENBQUNVLE1BQU07WUFBRVk7UUFBWTtRQUV4QyxvQ0FBb0M7UUFDcEMsTUFBTWxCLDBEQUFNQSxDQUFDRCx1REFBR0EsQ0FBQ0QsNkNBQUVBLEVBQUUsU0FBU1EsS0FBS00sR0FBRyxHQUFHO1lBQ3ZDSTtZQUNBRTtZQUNBQztZQUNBQyxNQUFNO1lBQ05DLFdBQVcsSUFBSUMsT0FBT0MsV0FBVztZQUNqQ0MsY0FBYztZQUNkQyxPQUFPO2dCQUNMQyxnQkFBZ0I7Z0JBQ2hCQyxXQUFXO1lBQ2I7UUFDRjtRQUVBLE9BQU9yQjtJQUNUO0lBRUEsTUFBTXNCLFFBQVEsT0FBT1osT0FBT0M7UUFDMUIsT0FBT3pCLHlFQUEwQkEsQ0FBQ0ssK0NBQUlBLEVBQUVtQixPQUFPQztJQUNqRDtJQUVBLE1BQU1ZLFNBQVM7UUFDYixNQUFNbkMsc0RBQU9BLENBQUNHLCtDQUFJQTtJQUNwQjtJQUVBLE1BQU1pQyxRQUFRO1FBQ1p4QjtRQUNBc0I7UUFDQWI7UUFDQWM7UUFDQXJCO0lBQ0Y7SUFFQSxxQkFDRSw4REFBQ04sWUFBWTZCLFFBQVE7UUFBQ0QsT0FBT0E7a0JBQzFCLENBQUN0QixXQUFXSDs7Ozs7O0FBR25CLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ncmlwcy1mcm9udGVuZC8uL2NvbnRleHRzL0F1dGhDb250ZXh0LmpzPzU5Y2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgXHJcbiAgc2lnbkluV2l0aEVtYWlsQW5kUGFzc3dvcmQsXHJcbiAgY3JlYXRlVXNlcldpdGhFbWFpbEFuZFBhc3N3b3JkLFxyXG4gIHNpZ25PdXQsXHJcbiAgb25BdXRoU3RhdGVDaGFuZ2VkLFxyXG4gIHVwZGF0ZVByb2ZpbGVcclxufSBmcm9tICdmaXJlYmFzZS9hdXRoJztcclxuaW1wb3J0IHsgYXV0aCwgZGIgfSBmcm9tICcuLi9saWIvZmlyZWJhc2UnO1xyXG5pbXBvcnQgeyBkb2MsIHNldERvYywgZ2V0RG9jIH0gZnJvbSAnZmlyZWJhc2UvZmlyZXN0b3JlJztcclxuXHJcbmNvbnN0IEF1dGhDb250ZXh0ID0gY3JlYXRlQ29udGV4dCh7fSk7XHJcblxyXG5leHBvcnQgY29uc3QgdXNlQXV0aCA9ICgpID0+IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlciA9ICh7IGNoaWxkcmVuIH0pID0+IHtcclxuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gb25BdXRoU3RhdGVDaGFuZ2VkKGF1dGgsIGFzeW5jICh1c2VyKSA9PiB7XHJcbiAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgLy8gR2V0IGFkZGl0aW9uYWwgdXNlciBkYXRhIGZyb20gRmlyZXN0b3JlXHJcbiAgICAgICAgY29uc3QgdXNlckRvYyA9IGF3YWl0IGdldERvYyhkb2MoZGIsICd1c2VycycsIHVzZXIudWlkKSk7XHJcbiAgICAgICAgY29uc3QgdXNlckRhdGEgPSB1c2VyRG9jLmRhdGEoKTtcclxuICAgICAgICBzZXRVc2VyKHsgLi4udXNlciwgLi4udXNlckRhdGEgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2V0VXNlcihudWxsKTtcclxuICAgICAgfVxyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB1bnN1YnNjcmliZTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IHNpZ251cCA9IGFzeW5jIChlbWFpbCwgcGFzc3dvcmQsIGRpc3BsYXlOYW1lLCBjb21wYW55KSA9PiB7XHJcbiAgICBjb25zdCB7IHVzZXIgfSA9IGF3YWl0IGNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZChhdXRoLCBlbWFpbCwgcGFzc3dvcmQpO1xyXG4gICAgYXdhaXQgdXBkYXRlUHJvZmlsZSh1c2VyLCB7IGRpc3BsYXlOYW1lIH0pO1xyXG4gICAgXHJcbiAgICAvLyBDcmVhdGUgdXNlciBkb2N1bWVudCBpbiBGaXJlc3RvcmVcclxuICAgIGF3YWl0IHNldERvYyhkb2MoZGIsICd1c2VycycsIHVzZXIudWlkKSwge1xyXG4gICAgICBlbWFpbCxcclxuICAgICAgZGlzcGxheU5hbWUsXHJcbiAgICAgIGNvbXBhbnksXHJcbiAgICAgIHJvbGU6ICdicm9rZXInLFxyXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgc3Vic2NyaXB0aW9uOiAnZnJlZScsXHJcbiAgICAgIHVzYWdlOiB7XHJcbiAgICAgICAgdHJhbnNjcmlwdGlvbnM6IDAsXHJcbiAgICAgICAgcHdBY3Rpb25zOiAwXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICByZXR1cm4gdXNlcjtcclxuICB9O1xyXG5cclxuICBjb25zdCBsb2dpbiA9IGFzeW5jIChlbWFpbCwgcGFzc3dvcmQpID0+IHtcclxuICAgIHJldHVybiBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZChhdXRoLCBlbWFpbCwgcGFzc3dvcmQpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ291dCA9IGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHNpZ25PdXQoYXV0aCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgdmFsdWUgPSB7XHJcbiAgICB1c2VyLFxyXG4gICAgbG9naW4sXHJcbiAgICBzaWdudXAsXHJcbiAgICBsb2dvdXQsXHJcbiAgICBsb2FkaW5nXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxBdXRoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PlxyXG4gICAgICB7IWxvYWRpbmcgJiYgY2hpbGRyZW59XHJcbiAgICA8L0F1dGhDb250ZXh0LlByb3ZpZGVyPlxyXG4gICk7XHJcbn07Il0sIm5hbWVzIjpbImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCIsImNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZCIsInNpZ25PdXQiLCJvbkF1dGhTdGF0ZUNoYW5nZWQiLCJ1cGRhdGVQcm9maWxlIiwiYXV0aCIsImRiIiwiZG9jIiwic2V0RG9jIiwiZ2V0RG9jIiwiQXV0aENvbnRleHQiLCJ1c2VBdXRoIiwiQXV0aFByb3ZpZGVyIiwiY2hpbGRyZW4iLCJ1c2VyIiwic2V0VXNlciIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwidW5zdWJzY3JpYmUiLCJ1c2VyRG9jIiwidWlkIiwidXNlckRhdGEiLCJkYXRhIiwic2lnbnVwIiwiZW1haWwiLCJwYXNzd29yZCIsImRpc3BsYXlOYW1lIiwiY29tcGFueSIsInJvbGUiLCJjcmVhdGVkQXQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJzdWJzY3JpcHRpb24iLCJ1c2FnZSIsInRyYW5zY3JpcHRpb25zIiwicHdBY3Rpb25zIiwibG9naW4iLCJsb2dvdXQiLCJ2YWx1ZSIsIlByb3ZpZGVyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./contexts/AuthContext.js\n");

/***/ }),

/***/ "./lib/firebase.js":
/*!*************************!*\
  !*** ./lib/firebase.js ***!
  \*************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   db: () => (/* binding */ db),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"firebase/app\");\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/firestore */ \"firebase/firestore\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_firestore__WEBPACK_IMPORTED_MODULE_2__]);\n([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_firestore__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\nconst firebaseConfig = {\n    apiKey: \"AIzaSyDL4MHT1BIBxG22eCeYvoNkwgpqjtWVfMQ\",\n    authDomain: \"grips-assistant-6692.firebaseapp.com\",\n    projectId: \"grips-assistant-6692\",\n    storageBucket: \"grips-assistant-6692.firebasestorage.app\",\n    messagingSenderId: \"670660602767\",\n    appId: \"1:670660602767:web:9d19815ed0149b3c17b9fa\"\n};\nconst app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\nconst auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)(app);\nconst db = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_2__.getFirestore)(app);\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (app);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvZmlyZWJhc2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQTZDO0FBQ0w7QUFDVTtBQUVsRCxNQUFNRyxpQkFBaUI7SUFDckJDLFFBQVFDLHlDQUF3QztJQUNoREcsWUFBWUgsc0NBQTRDO0lBQ3hESyxXQUFXTCxzQkFBMkM7SUFDdERPLGVBQWVQLDBDQUErQztJQUM5RFMsbUJBQW1CVCxjQUFvRDtJQUN2RVcsT0FBT1gsMkNBQXVDO0FBQ2hEO0FBRUEsTUFBTWEsTUFBTWxCLDJEQUFhQSxDQUFDRztBQUNuQixNQUFNZ0IsT0FBT2xCLHNEQUFPQSxDQUFDaUIsS0FBSztBQUMxQixNQUFNRSxLQUFLbEIsZ0VBQVlBLENBQUNnQixLQUFLO0FBQ3BDLGlFQUFlQSxHQUFHQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3JpcHMtZnJvbnRlbmQvLi9saWIvZmlyZWJhc2UuanM/YWI0NCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbml0aWFsaXplQXBwIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcclxuaW1wb3J0IHsgZ2V0QXV0aCB9IGZyb20gJ2ZpcmViYXNlL2F1dGgnO1xyXG5pbXBvcnQgeyBnZXRGaXJlc3RvcmUgfSBmcm9tICdmaXJlYmFzZS9maXJlc3RvcmUnO1xyXG5cclxuY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XHJcbiAgYXBpS2V5OiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19GSVJFQkFTRV9BUElfS0VZLFxyXG4gIGF1dGhEb21haW46IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX0ZJUkVCQVNFX0FVVEhfRE9NQUlOLFxyXG4gIHByb2plY3RJZDogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfRklSRUJBU0VfUFJPSkVDVF9JRCxcclxuICBzdG9yYWdlQnVja2V0OiBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19GSVJFQkFTRV9TVE9SQUdFX0JVQ0tFVCxcclxuICBtZXNzYWdpbmdTZW5kZXJJZDogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfRklSRUJBU0VfTUVTU0FHSU5HX1NFTkRFUl9JRCxcclxuICBhcHBJZDogcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfRklSRUJBU0VfQVBQX0lEXHJcbn07XHJcblxyXG5jb25zdCBhcHAgPSBpbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKTtcclxuZXhwb3J0IGNvbnN0IGF1dGggPSBnZXRBdXRoKGFwcCk7XHJcbmV4cG9ydCBjb25zdCBkYiA9IGdldEZpcmVzdG9yZShhcHApO1xyXG5leHBvcnQgZGVmYXVsdCBhcHA7Il0sIm5hbWVzIjpbImluaXRpYWxpemVBcHAiLCJnZXRBdXRoIiwiZ2V0RmlyZXN0b3JlIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfRklSRUJBU0VfQVBJX0tFWSIsImF1dGhEb21haW4iLCJORVhUX1BVQkxJQ19GSVJFQkFTRV9BVVRIX0RPTUFJTiIsInByb2plY3RJZCIsIk5FWFRfUFVCTElDX0ZJUkVCQVNFX1BST0pFQ1RfSUQiLCJzdG9yYWdlQnVja2V0IiwiTkVYVF9QVUJMSUNfRklSRUJBU0VfU1RPUkFHRV9CVUNLRVQiLCJtZXNzYWdpbmdTZW5kZXJJZCIsIk5FWFRfUFVCTElDX0ZJUkVCQVNFX01FU1NBR0lOR19TRU5ERVJfSUQiLCJhcHBJZCIsIk5FWFRfUFVCTElDX0ZJUkVCQVNFX0FQUF9JRCIsImFwcCIsImF1dGgiLCJkYiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/firebase.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyApp)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/AuthContext */ \"./contexts/AuthContext.js\");\n/* harmony import */ var _components_AuthWrapper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/AuthWrapper */ \"./components/AuthWrapper.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__, _components_AuthWrapper__WEBPACK_IMPORTED_MODULE_3__]);\n([_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__, _components_AuthWrapper__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// pages/_app.js\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_2__.AuthProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_AuthWrapper__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\sasha\\\\Desktop\\\\code\\\\insurance_endurance\\\\grips\\\\frontend\\\\pages\\\\_app.js\",\n                lineNumber: 10,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\sasha\\\\Desktop\\\\code\\\\insurance_endurance\\\\grips\\\\frontend\\\\pages\\\\_app.js\",\n            lineNumber: 9,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\sasha\\\\Desktop\\\\code\\\\insurance_endurance\\\\grips\\\\frontend\\\\pages\\\\_app.js\",\n        lineNumber: 8,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxnQkFBZ0I7O0FBQ2U7QUFDd0I7QUFDRztBQUUzQyxTQUFTRSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFFO0lBQ3BELHFCQUNFLDhEQUFDSiwrREFBWUE7a0JBQ1gsNEVBQUNDLCtEQUFXQTtzQkFDViw0RUFBQ0U7Z0JBQVcsR0FBR0MsU0FBUzs7Ozs7Ozs7Ozs7Ozs7OztBQUloQyIsInNvdXJjZXMiOlsid2VicGFjazovL2dyaXBzLWZyb250ZW5kLy4vcGFnZXMvX2FwcC5qcz9lMGFkIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHBhZ2VzL19hcHAuanNcclxuaW1wb3J0ICcuLi9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5pbXBvcnQgeyBBdXRoUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0cy9BdXRoQ29udGV4dCc7XHJcbmltcG9ydCBBdXRoV3JhcHBlciAgICAgICBmcm9tICcuLi9jb21wb25lbnRzL0F1dGhXcmFwcGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE15QXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfSkge1xyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aFByb3ZpZGVyPlxyXG4gICAgICA8QXV0aFdyYXBwZXI+XHJcbiAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgICA8L0F1dGhXcmFwcGVyPlxyXG4gICAgPC9BdXRoUHJvdmlkZXI+XHJcbiAgKTtcclxufSJdLCJuYW1lcyI6WyJBdXRoUHJvdmlkZXIiLCJBdXRoV3JhcHBlciIsIk15QXBwIiwiQ29tcG9uZW50IiwicGFnZVByb3BzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "firebase/app":
/*!*******************************!*\
  !*** external "firebase/app" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/app");;

/***/ }),

/***/ "firebase/auth":
/*!********************************!*\
  !*** external "firebase/auth" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/auth");;

/***/ }),

/***/ "firebase/firestore":
/*!*************************************!*\
  !*** external "firebase/firestore" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/firestore");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.js"));
module.exports = __webpack_exports__;

})();