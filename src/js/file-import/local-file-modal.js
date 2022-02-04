
import { Constants, BootstrapWrap } from '@chmap/utilities';

const { EXAMPLE_FILES_DIR } = Constants;

const { Modal } = BootstrapWrap;

const LocalFileModal = function() {

    let modal = null;

    let gCallback = null

    function creat() {

        const html =
`<div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Import local IIIF manifest file</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3 local-data-file-input">
            <label class="form-label" for="localIIIFManifestFile">*Local file</label>
            <input type="file" id="localIIIFManifestFile">
        </div>
        <br>
        <pre>
Georeferencing only supports one format:
IIIF manifest.json (<a id="iiif-general-images.json" class="example-file" href="#" download>example-images</a>, <a id="iiif-map-images.json" class="example-file" href="#" download>example-maps</a>)
        </pre>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary import-btn">Import</button>
      </div>
    </div>
 </div>`;

        const div = document.createElement('div');

        div.className = 'modal fade';
        div.innerHTML = html;

        document.body.append(div);

        div.querySelector('.import-btn').onclick = onImport;

        setExampleFileURL(div);

        modal = Modal.getOrCreateInstance(div);

    }

    function setExampleFileURL(div) {

        const hyLinks = div.querySelectorAll('.example-file');

        for (const link of hyLinks) {

            link.href = EXAMPLE_FILES_DIR + link.id;
            link.target = "_blank";
        }

    }

    async function onImport() {

        const { loadLocalFile } = await import('./file-loader');

        loadLocalFile(modal._element.querySelector('#localIIIFManifestFile'));

    }

    function show(callback) {

        if (!modal) {
            creat();
        }

        gCallback = callback;

        modal.show();

    }

    function hide() {

        if (modal) {
            modal.hide();
        }

    }

    return {
        show,
        hide,
    }

}();

export { LocalFileModal };
