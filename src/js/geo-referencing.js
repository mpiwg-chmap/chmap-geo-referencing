
import { saveAs } from 'file-saver';
import { DistortableImageLayer } from '@chmap/leaflet-extensions';
import { Constants, Commons, DateUtils, BasicDataProcessor } from '@chmap/utilities';

const { GEO_REF_IMG_SIZE, PHOTO_ICON_SIZE, POPUP_THUMBNAIL_WIDTH  } = Constants;

const GeoReferencing = function () {

    const localEventEmitter = new Commons.EventEmitterClass();

    const loadingTmpl = '<div class="popup thumbnail-img-loading"><span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span> Loading...</div>';

    let localMap = null;

    let nodes = [];

    let layers = [];

    let editingLayer = null;

    let iiifJson = null;

    const loadedData = { rows: [], imgType: 'text' };

    let manifestId = '';

    let toolbarWrap = null;

    const actions = {}

    function addEventListener(obj, types, fn, context) {
        localEventEmitter.on(obj, types, fn, context);
    }

    function init(map) {

        localMap = map;

    }

    function load(text, fileType) {

        const {rows, imgType, json} = BasicDataProcessor.execute(text, fileType);

        iiifJson = json;
        manifestId = json['@id'];

        loadedData.rows = rows;
        loadedData.imgType = imgType;

        localEventEmitter.emit('loaded', {rows: [...rows], imgType});

        nodes = [...rows];

        refineZeroCoordinate();

        exitEditingMode();

    }

    function refineZeroCoordinate() {

        const zeros = [];

        for (const node of nodes) {
            if (node.Longitude === 0 && node.Latitude === 0) {
                zeros.push(node);
            }
        }

        if (zeros.length > 1) {

            const offset = PHOTO_ICON_SIZE * 1.5;

            const zoom = localMap.getZoom();

            const center = localMap.project({lat: 0, lng: 0});

            for (let idx = 0, len = zeros.length; idx < len; idx++) {

                const item = zeros[idx];
                const column = idx % 7;
                const row = Math.floor(idx / 7);

                let colMultiplier = 0;
                let rowMultiplier = 0;

                if (column > 0) {
                    if (column % 2 === 0) colMultiplier = -0.5;
                    else if (column === 1) colMultiplier = 1;
                    else if (column === 3) colMultiplier = 0.65;
                    else if (column === 5) colMultiplier = 0.6;
                }

                if (row > 0) {
                    if (row % 2 === 0) rowMultiplier = -0.5;
                    else if (row === 1) rowMultiplier = 1
                    else if (row === 3) rowMultiplier = 0.65
                    else rowMultiplier = 0.6;
                }

                const point = localMap.unproject([center.y + (row * offset) * rowMultiplier, center.x + (column * offset) * colMultiplier], zoom);

                item.Longitude = point.lat;

                item.Latitude = point.lng;

            }

        }

    }

    function renderMarkers() {

        clear();

        for (let idx = 0, len = nodes.length; idx < len; idx++) {

            const node = nodes[idx];

            const marker = L.marker([node.Latitude, node.Longitude],
            {icon: creatIcon(node), draggable: true, nodeIdx: idx})
            .addTo(localMap)
            .bindPopup(createPopup(node, idx));

            marker.on("dragend", onMarkerDragEnd);

            layers.push(marker);

        }

        fitBounds();

        showInfo(`Total: ${nodes.length}.`);

        localEventEmitter.emit('rendered', {nodes: [...nodes], imgType: loadedData.imgType});

    }

    function fitBounds() {

        if (nodes.length === 1) {

            const node = nodes[0];

            localMap.flyTo({lat: node.Latitude, lng: node.Longitude}, localMap.getZoom());

        } else {

            const group = new L.featureGroup(layers);

            localMap.fitBounds(group.getBounds());

            if (localMap.getZoom() > 7) {
                localMap.setZoom(6)
            }
            ;
        }
    }

    function renderOverlayImages() {

        clear();

        for (let idx = 0, len = nodes.length; idx < len; idx++) {

            layers.push(creatOverlayImage(nodes[idx]));
        }

    }

    function creatOverlayImage(node) {

        const SID = node.serviceID;
        const corners = node.metadata[0].Corners;
        const imgURL = `${SID}/full/${GEO_REF_IMG_SIZE},/0/default.jpg`;

        const dImg = DistortableImageLayer.build({
            mode: "scale",
            editable: false,
            imgURL,
            corners: corners,
        }).addTo(localMap)

        return dImg;
    }

    function creatIcon(node) {

        return L.divIcon({
            className: "leaflet-marker-photo",
            iconSize: [PHOTO_ICON_SIZE, PHOTO_ICON_SIZE],
            html: `<div style="background-image: url('${node.thumbnail}');width:100%;height:100%;"></div>`,
        });
    }

    function createPopup(node) {

        const caption = JSON.stringify(node).replace(/,/g, "<br/>");

        const nodeInfoStyle = 'max-height:100px;overflow:auto;margin:3px 0px;padding:0px 4px;border:1px solid rgba(0, 0, 0, 0.125);';

        const imgStyle = `cursor:pointer;width:${(node.thumbnailWidth) ? node.thumbnailWidth : POPUP_THUMBNAIL_WIDTH}px;`;

        return (
        `${loadingTmpl}
<img class="popup thumbnail-img" src="${node.thumbnail}" data-big-image="${node.bigImage}" style="${imgStyle}" />
<div style="${nodeInfoStyle}">${caption}</div>${getNodeActions(node)}`
        );

    }

    function getNodeActions(node) {

        const primaryBtnCls = 'btn btn-primary btn-sm mb-1';

        const secondBtnCls = 'btn btn-secondary btn-sm';

        const btns = [];

        btns.push(
        `<button class="${secondBtnCls} show-IIIF-viewer-btn" data-manifest-id="${manifestId}" data-canvas-id="${node.ID}">IIIF Viwer</button>`);

        btns.push(
        `<button class="${primaryBtnCls} edit-geo-referencing-btn" data-node-id="${node.ID}">Lite Georeference</button>`);

        btns.push(
        `<button class="${secondBtnCls} google-seearch-btn" data-node-name="${node.name}" >Google</button>`);

        return btns.join(' ');

    }

    function onMarkerDragEnd(e) {

        const target = e.target;

        const {lat, lng} = target._latlng;
        const zoomLvl = localMap.getZoom();
        const nodeIdx = target.options.nodeIdx;

        // //update back to iiifJson for exporting later
        const canvas = iiifJson.sequences[0].canvases[nodeIdx];

        const firstMeta = (canvas.metadata) ? canvas.metadata[0] : {};

        firstMeta.Latitude = lat;
        firstMeta.Longitude = lng;
        firstMeta.Zoom = zoomLvl;
        firstMeta.Corners = null; //makeCorners(node.Latitude, node.Longitude, node.Zoom, 1);

        if (!canvas.metadata) {
            canvas.metadata = [firstMeta];
        }

        const node = nodes[nodeIdx];

        node.metadata[0] = firstMeta;
        node.Latitude = lat;
        node.Longitude = lng;
        node.Zoom = zoomLvl;

        target._popup._content = createPopup(node);

    }

    function edit(nodeId) {

        startEditing();

        const nodeIdx = nodes.findIndex((node) => node.ID === nodeId);
        const node = JSON.parse(JSON.stringify(nodes[nodeIdx]));

        const SID = node.serviceID;
        const corners = node.metadata[0].Corners;

        const imgURL = `${SID}/full/${GEO_REF_IMG_SIZE * 4},/0/default.jpg`;

        editingLayer = DistortableImageLayer.build({
            mode: "scale",
            editable: true,
            imgURL,
            corners,
            nodeIdx,
        }).addTo(localMap);

        if (corners) {
            localMap.flyTo(corners[0], localMap.getZoom());
        }

        // L.DomEvent.on(editingLayer, "load", editingLayer.editing.enable, editingLayer.editing);

        L.DomEvent.on(editingLayer, "load", inEditing);

    }

    function startEditing() {

        clear();

        toolbarWrap.style.display = 'inline-block';
        showInfo(loadingTmpl.replaceAll('div', 'span'));
        showEditingModeBtns('none');
        showDisplayModeBtns('none');

    }

    function inEditing() {

        showInfo('In editing');

        toolbarWrap.style.display = 'inline-block';
        showEditingModeBtns('inline-block');
        showDisplayModeBtns('none');
    }

    function exitEditingMode() {

        renderMarkers();

        toolbarWrap.style.display = 'inline-block';
        showEditingModeBtns('none');
        showDisplayModeBtns('inline-block');
    }

    function showEditingModeBtns(display) {
        actions.exitEditingMode.style.display = display;
        actions.saveAndExit.style.display = display;
        actions.saveAndExport.style.display = display;
    }

    function showDisplayModeBtns(display) {
        actions.displayModeGrp.style.display = display;
        actions.exportAll.style.display = display;
        actions.clearAll.style.display = display;
    }

    function switchTo(mode) {

        if (mode === 'ThumbnailMode') {
            renderMarkers();
        } else {
            renderOverlayImages();
        }

        toolbarWrap.style.display = 'inline-block';
        showDisplayModeBtns('inline-block');
    }

    function saveAndExit() {

        save();

        exitEditingMode();

    }

    function save() {

        const nodeIdx = editingLayer.options.nodeIdx;

        const node = nodes[nodeIdx];

        const corners = editingLayer.getCorners();

        const topLeft = corners[0];
        const topRight = corners[1];
        const bottomLeft = corners[2];

        const firstMeta = iiifJson.sequences[0].canvases[nodeIdx].metadata[0];

        firstMeta.Latitude = (topLeft.lat + bottomLeft.lat) / 2;
        firstMeta.Longitude = (topLeft.lng + topRight.lng) / 2;
        firstMeta.Zoom = localMap.getZoom();
        firstMeta.Corners = corners;

        node.Latitude = firstMeta.Latitude;
        node.Longitude = firstMeta.Longitude;
        node.Zoom = firstMeta.Zoom;
        node.metadata[0] = firstMeta;

    }

    function saveAndExport() {

        save();

        const nodeIdx = editingLayer.options.nodeIdx;

        const newIIIFJson = JSON.parse(JSON.stringify(iiifJson));

        const canvas = newIIIFJson.sequences[0].canvases[nodeIdx];

        newIIIFJson.sequences[0].canvases = [canvas];

        setEditingInfo(newIIIFJson);

        doExport(newIIIFJson, `single_manifest_${getNowStr()}.json`);

    }

    function exportAll() {

        setEditingInfo(iiifJson);

        doExport(iiifJson, `manifest_${getNowStr()}.json`);

    }

    function doExport(text, fileName) {

        const str = (typeof text === 'object') ? JSON.stringify(text) : text;

        const blob = new Blob([str], {type: "text/plain;charset=utf-8"});

        saveAs(blob, fileName);

    }

    function setEditingInfo(json) {

        const editorURL = window.location.href;
        const nowStr = getNowStr(true);

        if (Array.isArray(json.metadata)) {
            updateMetadata(json.metadata, "editor URL", editorURL);
            updateMetadata(json.metadata, "modified date", nowStr);
        } else {
            json.metadata = [
                {label: "editor URL", value: editorURL},
                {"modified date": nowStr},
            ];
        }
    }

    function updateMetadata(metadata, label, value) {

        const config = metadata.find((ele) => ele.label === label);

        if (config !== undefined) {
            config.value = value;
        } else {
            metadata.push({label, value});
        }

    }

    function getNowStr(withDelimiter) {

        const now = new Date();

        if (withDelimiter) {

            return DateUtils.format(now, 'yyyy-MM-dd HH:mm:ss');

        } else {
            return DateUtils.format(now, 'yyyyMMddHHmmss');
        }

    }

    function clear() {

        if (editingLayer !== null) {
            localMap.removeLayer(editingLayer);
        }

        for (const layer of layers) {
            localMap.removeLayer(layer);
        }

        layers = [];

        toolbarWrap.style.display = 'none';

    }

    function getToolbarButtons() {

        if (!toolbarWrap) {

            const div = document.createElement("div");

            toolbarWrap = div;

            div.style.cssText = 'display:none;';

            const filler1 = document.createElement("span");
            filler1.style.cssText = 'width:8rem;display:inline-block';
            div.appendChild(filler1);

            const span = document.createElement("span");

            span.className = 'me-2 pt-2 count-info';
            span.style.cssText = 'font-size: 12px;';

            div.appendChild(span);
            actions.infoDom = span;

            actions.exitEditingMode = creatElement({
                parent: div,
                tagName: "button",
                className: 'btn btn-secondary btn-sm me-1',
                innerHTML: 'Cancel',
                onclick: exitEditingMode,
            })

            actions.saveAndExit = creatElement({
                parent: div,
                tagName: "button",
                className: 'btn btn-primary btn-sm me-1',
                innerHTML: 'Save & Exit',
                onclick: saveAndExit,
            });

            actions.saveAndExport = creatElement({
                parent: div,
                tagName: "button",
                className: 'btn btn-primary btn-sm me-1',
                innerHTML: 'Save & Export',
                onclick: saveAndExport,
            });

            const btnGrp = document.createElement("div");

            btnGrp.className = 'btn-group btn-group-sm me-1';
            div.appendChild(btnGrp);
            actions.displayModeGrp = btnGrp;

            creatElement({
                parent: btnGrp,
                tagName: "input",
                type: 'radio',
                id: 'ThumbnailMode',
                name: 'displayMode',
                autocomplete: "off",
                className: 'btn-check',
                checked: true,
                onclick: () => switchTo('ThumbnailMode')
            }, true);

            creatElement({
                parent: btnGrp,
                tagName: "label",
                className: 'btn btn-outline-primary btn-sm',
                htmlFor: 'ThumbnailMode',
                innerHTML: 'Thumbnail mode'
            }, true);

            creatElement({
                parent: btnGrp,
                tagName: "input",
                type: 'radio',
                id: 'LayerMode',
                name: 'displayMode',
                autocomplete: "off",
                className: 'btn-check',
                onclick: () => switchTo('LayerMode')
            }, true);

            creatElement({
                parent: btnGrp,
                tagName: "label",
                className: 'btn btn-outline-primary btn-sm',
                htmlFor: 'LayerMode',
                innerHTML: 'Layer mode'
            }, true);

            actions.exportAll = creatElement({
                parent: div,
                tagName: "button",
                className: 'btn btn-secondary btn-sm ms-4 me-4',
                innerHTML: 'Export all',
                onclick: exportAll,
            });

            actions.clearAll = creatElement({
                parent: div,
                tagName: "button",
                className: 'btn btn-outline-secondary btn-sm',
                innerHTML: 'Clear all',
                onclick: clear,
            });

        }

        return toolbarWrap;

    }

    function creatElement({ parent, tagName, ...rest }, isDefaultVisible) {

        const ele = document.createElement(tagName);

        for (const key in rest) {
            ele[key] = rest[key];
        }

        if (!isDefaultVisible) ele.style.display = 'none';

        parent.appendChild(ele);

        return ele;


    }

    function showInfo(info) {
        actions.infoDom.innerHTML = info;
    }

    return {
        init,
        load,
        clear,
        edit,
        getToolbarButtons,
        on: addEventListener,
    }
}();

export { GeoReferencing };
