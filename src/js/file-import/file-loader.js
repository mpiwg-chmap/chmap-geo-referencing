import { Commons, BasicDataProcessor } from '@chmap/utilities';

const localEventEmitter = new Commons.EventEmitterClass();

function addEventListener(obj, types, fn, context){
    localEventEmitter.on(obj, types, fn, context);
}

function loadLocalFile(fileInput){

    //only process one file.
    const aFile = fileInput.files[0];

    if (aFile !== undefined) {

        const reader = new FileReader();

        reader.onload = () => {

            const text = reader.result;

            if(!BasicDataProcessor.isIIIFFile(text)){

                //TODO: i18n
                localEventEmitter.emit('exception', "Only IIIF manifest file is allowed!");
                return;

            }

            localEventEmitter.emit('iiifManifestFileRead', { text, type: 'unknown'});
        }

        const extensionName = aFile.name.split(".")[1].toLowerCase();

        if ( extensionName === "json") {
            reader.readAsText(aFile, "UTF-8");
        } else {
            //TODO: i18n
            localEventEmitter.emit('exception', "Only IIIF manifest file is allowed!");
        }

        fileInput.value = '';
    }

}

function loadOnlineFile(url, fileType){

    if(url.trim() === '') return;

    const fetchOpts = { method: 'GET' };

    fetch(url, fetchOpts)
    .then(response => response.ok ? response : Promise.reject({err: response.status}))
    .then(response => response.text())
    .then(text => localEventEmitter.emit('iiifManifestFileRead', { text, type: fileType }))
    .catch(error => {
        localEventEmitter.emit('exception', error);
    });

}

export {
    loadLocalFile,
    loadOnlineFile,
    addEventListener as on,
}

/* Events

    { name: 'iiifManifestFileRead', params: { text, type }}
    { name: 'exception', params: String }

 */
