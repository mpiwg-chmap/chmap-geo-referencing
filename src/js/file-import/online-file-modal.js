
import { Constants, BootstrapWrap } from '@chmap/utilities';

const { EXAMPLE_FILES_DIR } = Constants;

const { Modal } = BootstrapWrap;

const OnlineFileModal = function() {

    let modal = null;

    let gCallback = null

    function creat() {

        const html =
`<div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Import online IIIF manifest file</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
            <label class="form-label" for="onlineIIIFManifestFile">*Url</label>
            <input type="text" id="onlineIIIFManifestFile" class="form-control" value="">
        </div>
         <br>
        <pre>
Georeferencing only supports one format:
IIIF manifest.json (<a id="iiif-general-images.json" class="example-file"  href="#">example-images</a>, <a id="iiif-map-images.json" class="example-file" href="#">example-maps</a>)
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
            link.onclick = (e) => {

                e.preventDefault();

                const target = e.target;

                const url = EXAMPLE_FILES_DIR + target.id;

                const input = target.parentElement.parentElement.querySelector('#onlineIIIFManifestFile');

                input.value = url;

                input.focus();
                input.scrollLeft = input.scrollWidth;

            }
        }

    }

    async function onImport() {

        const url = modal._element.querySelector('#onlineIIIFManifestFile').value.trim();

        const { loadOnlineFile } = await import('./file-loader');

        loadOnlineFile(url, 'unknown');

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
    };

}();

export { OnlineFileModal };
