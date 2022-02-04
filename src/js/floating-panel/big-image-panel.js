
import { BootstrapWrap } from '@chmap/utilities';

const { Offcanvas } = BootstrapWrap;

let panel = null;

let bigImgDom = null;

let loadingDom = null;

function createUI(){

    const div = document.createElement('div');

    const html =
`<div 
     class="offcanvas offcanvas-end"
     style="width:40%;z-index:9997;"
     data-bs-scroll="true"
     data-bs-backdrop="false"
     tabindex="-1"
     aria-labelledby="offcanvasScrollingLabel">
    <div class="offcanvas-header pb-0">
        <h5 class="offcanvas-title"></h5>
        <i class="bi bi-chevron-right btn-outline-success px-1" data-bs-dismiss="offcanvas" aria-label="Close" ></i>
    </div>
    <div class="offcanvas-body" style="padding-top:0.5rem;">
       <div class="big-img-loading">
         <span class="spinner-grow spinner-grow-sm text-success" role="status" aria-hidden="true"></span>
         Loading...
       </div>
       <img class="big-img" src="about:blank"/>
    </div>
</div>`;

    div.innerHTML = html;

    document.body.append(div);

    loadingDom = div.querySelector('.big-img-loading');

    bigImgDom = div.querySelector('.big-img');

    bigImgDom.onload = (e) => {
        loadingDom.style.display = 'none';
    }

    panel = new Offcanvas(div.firstChild);


}

export function show(imageURL){

    if(!panel){
        createUI();
    }

    loadingDom.style.display = 'block';

    bigImgDom.src = imageURL;

    panel.show();
}

