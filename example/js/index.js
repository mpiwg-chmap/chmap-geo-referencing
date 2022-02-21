const L = window.L;

const { GeoReferencingController } = window.chmapGeoReferencing;

function initMap() {

    const defaultLayer = L.tileLayer("https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png",
    { attribution: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> â€” Map data Â© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tileset url:<span style="color:blue">https://stamen-tiles-a.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png</span>' });

    const map = L.map("map", {
        center: [35, 108],
        attributionControl: false,
        zoom: 4,
        minZoom: 0,
        maxZoom: 16,
        layers: [defaultLayer],
    });

    map.whenReady(
        () => {
            //sometimes, leaflet component doesn't expand its height in a good result initially.
            //trigger a window resize event to force it to re-calculate its available height again.
            window.dispatchEvent(new Event('resize'));
        }
    );

    GeoReferencingController.init(map);

}

function initToolbar(){

    const toolbar = document.getElementById('toolbar');

    GeoReferencingController.hookSidebarToggleBtn(toolbar.querySelector('#sidebar-toggle-btn'));

    const dynamicArea = toolbar.querySelector('#toolbar-dynamic');

    GeoReferencingController.addButtonsTo(dynamicArea);


}

function initSidebar(){

    const sidebar = document.getElementById('sidebar');

    const triggerResizeEvent = () => window.dispatchEvent(new Event('resize'));

    sidebar.addEventListener('shown.bs.collapse', triggerResizeEvent);
    sidebar.addEventListener('hidden.bs.collapse', triggerResizeEvent);

    GeoReferencingController.bindTriggerButtons({
        loadLocalIIIFManifestFileBtn: sidebar.querySelector('#loadLocalIIIFManifestFileBtn'),
        loadOnlineIIIFManifestFileBtn: sidebar.querySelector('#loadOnlineIIIFManifestFileBtn'),
    })

}

document.addEventListener("DOMContentLoaded", (event) => {

    initMap();

    initToolbar();

    initSidebar();

});
