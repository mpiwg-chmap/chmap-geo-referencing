"use strict";(self.webpackChunkchmapGeoReferencing=self.webpackChunkchmapGeoReferencing||[]).push([[120],{85120:function(n,e,t){t.r(e),t.d(e,{LocalFileModal:function(){return y}});var a=t(95238),r=t.n(a),o=t(53592),l=t.n(o),i=t(51446),c=t.n(i),s=t(19996),u=t.n(s),f=t(33938),d=t(63109),m=t.n(d),p=t(88972);function v(n,e){(null==e||e>n.length)&&(e=n.length);for(var t=0,a=new Array(e);t<e;t++)a[t]=n[t];return a}var b=p.Constants.EXAMPLE_FILES_DIR,h=p.BootstrapWrap.Modal,y=function(){var n=null;function e(){var e=document.createElement("div");e.className="modal fade",e.innerHTML='<div class="modal-dialog">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title">Import local IIIF manifest file</h5>\n        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>\n      </div>\n      <div class="modal-body">\n        <div class="mb-3 local-data-file-input">\n            <label class="form-label" for="localIIIFManifestFile">*Local file</label>\n            <input type="file" id="localIIIFManifestFile">\n        </div>\n        <br>\n        <pre>\nGeoreferencing only supports one format:\nIIIF manifest.json (<a id="iiif-general-images.json" class="example-file" href="#" download>example-images</a>, <a id="iiif-map-images.json" class="example-file" href="#" download>example-maps</a>)\n        </pre>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-primary import-btn">Import</button>\n      </div>\n    </div>\n </div>',document.body.append(e),e.querySelector(".import-btn").onclick=a,function(n){var e,t=function(n,e){var t=void 0!==c()&&u()(n)||n["@@iterator"];if(!t){if(Array.isArray(n)||(t=function(n,e){var t;if(n){if("string"==typeof n)return v(n,e);var a=r()(t=Object.prototype.toString.call(n)).call(t,8,-1);return"Object"===a&&n.constructor&&(a=n.constructor.name),"Map"===a||"Set"===a?l()(n):"Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?v(n,e):void 0}}(n))||e&&n&&"number"==typeof n.length){t&&(n=t);var a=0,o=function(){};return{s:o,n:function(){return a>=n.length?{done:!0}:{done:!1,value:n[a++]}},e:function(n){throw n},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,s=!0,f=!1;return{s:function(){t=t.call(n)},n:function(){var n=t.next();return s=n.done,n},e:function(n){f=!0,i=n},f:function(){try{s||null==t.return||t.return()}finally{if(f)throw i}}}}(n.querySelectorAll(".example-file"));try{for(t.s();!(e=t.n()).done;){var a=e.value;a.href=b+a.id,a.target="_blank"}}catch(n){t.e(n)}finally{t.f()}}(e),n=h.getOrCreateInstance(e)}function a(){return o.apply(this,arguments)}function o(){return(o=(0,f.Z)(m().mark((function e(){return m().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.e(740).then(t.bind(t,1785));case 2:(0,e.sent.loadLocalFile)(n._element.querySelector("#localIIIFManifestFile"));case 5:case"end":return e.stop()}}),e)})))).apply(this,arguments)}return{show:function(t){n||e(),n.show()},hide:function(){n&&n.hide()}}}()}}]);
//# sourceMappingURL=120.chmap-geo-referencing.js.map