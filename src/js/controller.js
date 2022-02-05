import { Commons } from "@chmap/utilities";

const GeoReferencingController = function() {

    const localEventEmitter = new Commons.EventEmitterClass();

    const initialized = { geoReferencing: false };

    let sidebarToggleBtn = null;

    let localMap = null;

    let localToolbar = null;

    function addEventListener(obj, types, fn, context) {
        localEventEmitter.on(obj, types, fn, context);
    }

    function init(map) {

        localMap = map;

        cmpEventBinding(map);

    }

    function initGeoReferencing(map, toolbar, geoReferencing) {

        localMap = map;

        geoReferencing.init(map);

        toolbar.appendChild(geoReferencing.getToolbarButtons());

        mapEventBinding(map);

        geoReferencing.on('rendered', (rows, imgType) => {

            if (sidebarToggleBtn && sidebarToggleBtn.className.indexOf('collapsed') < 0) {
                sidebarToggleBtn.click();
            }
        });

    }

    function mapEventBinding(map) {

        map.on('popupopen', (e) => {

            const popupRoot = e.popup._contentNode;

            bindThumbnail(popupRoot);

            bindShowBigImage(popupRoot);

            bindShowIIIFViewer(popupRoot);

            bindGoogleSearch(popupRoot);

            bindEditGeoReference(e.popup, popupRoot);

        });

    }

    function bindThumbnail(popupRoot) {

        const img = popupRoot.querySelector('.popup.thumbnail-img');

        if (img && !img.onload) {

            img.onload = () => {
                popupRoot.querySelector('.popup.thumbnail-img-loading').style.display = 'none';
            }
        }

    }

    function bindFloatingPanelEvent (panel, eventPrefix){

        panel.on('shown', (panelDOM) => {

            localEventEmitter.emit(`${eventPrefix}.shown`, panelDOM);

        });

        panel.on('hidden', (panelDOM) => {

            localEventEmitter.emit(`${eventPrefix}.hidden`, panelDOM);

        });

    }

    let BigImagePanel = null;

    function bindShowBigImage(popupRoot) {

        const img = popupRoot.querySelector('.thumbnail-img');

        if (img && !img.onclick) {

            img.onclick = async (e) => {

                if(!BigImagePanel) {

                    BigImagePanel = await import("./floating-panel/big-image-panel");

                    bindFloatingPanelEvent(BigImagePanel, "big-image-panel");
                }

                const target = e.target;

                const url = target.getAttribute('data-big-image') || target.src;

                BigImagePanel.show(url);
            }
        }

    }

    function bindShowIIIFViewer(popupRoot) {

        const btn = popupRoot.querySelector('.show-IIIF-viewer-btn');

        if (btn && !btn.onclick) {

            const manifestId = btn.getAttribute('data-manifest-id');
            const canvasId = btn.getAttribute('data-canvas-id');

            btn.onclick = async () => {

                const {IIIFViewer} = await import('@chmap/utilities');

                IIIFViewer.open({manifestId, canvasId});

            }
        }

    }

    function bindGoogleSearch(popupRoot) {

        const btn = popupRoot.querySelector('.google-seearch-btn');

        if (btn && !btn.onclick) {

            const name = btn.getAttribute('data-node-name');

            btn.onclick = () => window.open(`https://www.google.com/search?q=${name}`);
        }

    }

    function bindEditGeoReference(popup, popupRoot) {

        const btn = popupRoot.querySelector('.edit-geo-referencing-btn');

        if (btn && !btn.onclick) {

            const nodeId = btn.getAttribute('data-node-id');

            btn.onclick = async () => {

                const {GeoReferencing} = await import ("./geo-referencing");

                GeoReferencing.edit(nodeId);

                popup._close()
            }
        }

    }

    function bindTriggerButtons({loadLocalIIIFManifestFileBtn, loadOnlineIIIFManifestFileBtn}) {

        loadLocalIIIFManifestFileBtn.onclick = async (e) => {

            e.preventDefault();

            const {LocalFileModal} = await import("./file-import/local-file-modal");

            LocalFileModal.show();
        }

        loadOnlineIIIFManifestFileBtn.onclick = async (e) => {

            e.preventDefault();

            const {OnlineFileModal} = await import("./file-import/online-file-modal");

            OnlineFileModal.show();
        }

    }

    async function cmpEventBinding() {

        const {on: FileLoader_on} = await import("./file-import/file-loader");

        FileLoader_on('iiifManifestFileRead', async ({text, type}) => {

            localEventEmitter.emit('iiifManifestFileRead', {text, type});

            const { GeoReferencing } = await import ("./geo-referencing");

            if (!initialized.geoReferencing) {

                initGeoReferencing(localMap, localToolbar, GeoReferencing);

                initialized.geoReferencing = true;
            }

            GeoReferencing.load(text, type);

            const { LocalFileModal } = await import("./file-import/local-file-modal");

            LocalFileModal.hide();

            const { OnlineFileModal } = await import("./file-import/online-file-modal");

            OnlineFileModal.hide();

        });

        FileLoader_on('exception', async (info) => {

            const { Notification } = await import('@chmap/utilities');

            Notification.show(info, 'danger');
        });

    }

    function hookSidebarToggleBtn(btn) {

        sidebarToggleBtn = btn;
    }

    function addButtonsTo(toolbar) {

        localToolbar = toolbar;

    }

    async function clear() {

        if (initialized.geoReferencing) {

            const {GeoReferencing} = await import ("./geo-referencing");

            GeoReferencing.clear();
        }

    }

    return {
        init,
        clear,
        addButtonsTo,
        bindTriggerButtons,
        hookSidebarToggleBtn,
        on: addEventListener,
    }

    /* Events

    { name: 'iiifManifestFileRead', params: { text, type }}

    */

}();

export default GeoReferencingController;
