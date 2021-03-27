function ready()
{
    const galleryBox = document.querySelector('.gallery-box');
    const galerryBlock = document.querySelector('#gallery-block');
    const uploadImageUrlEl = document.querySelector('#uploadImageUrl');
    const loadFromUrlEl = document.querySelector('#loadFromUrl');
    const bodyEl = document.querySelector('body');
    const modalEl = document.querySelector('.modal-window-block');
    

    function getGallery(){
        sendRequest('/api/getImages','get')
        .then(function(response){
            galerryBlock.innerHTML = '';
            drawGallery(response.message, galerryBlock);
            toggleModal();
        });
    }

    function sendRequest(url, type, sendData)
    {
        return fetch(url,
            {
                method: type,
                body: JSON.stringify(sendData)
            })
            .then(response => response.json());
    }

    function drawGallery(images, container)
    {
        images.forEach(function(image){
            createImg(image, container);
        });

        const imgWrappers = document.querySelectorAll('.item-wrapper');
        imgWrappers.forEach(function(imgWrapper){
            imgWrapper.addEventListener('mouseover', showDeleteButton);
            imgWrapper.addEventListener('mouseout', hideDeleteButton);
            imgWrapper.addEventListener('click', deleteImage);
        });

        recalcImageSize();
    }

    function deleteImage()
    {
        image = this.querySelector('.gallery-img');
        id = image.dataset.id;
        toggleModal();
        sendRequest('/api/deleteImage/'+id,'delete')
        .then(function(){
            getGallery();
        });
    }


    function hideDeleteButton()
    {
        btn = this.querySelector('.delete-btn');
        btn.style.opacity = 0;
    }

    function showDeleteButton()
    {
        btn = this.querySelector('.delete-btn');
        btn.style.opacity = 1;
    }

    function createImg(data, parent)
    {
        let itemWrapper = document.createElement('div');
        itemWrapper.className = 'item-wrapper';
        parent.appendChild(itemWrapper);

        size = calcSize(data.width,data.height, parent);
        let img = new Image(size.width, size.height);
        //img.src = 'img/placeholder.png';
        img.dataset.src = data.url
        img.dataset.id = data.id;
        img.dataset.startWidth = data.width;
        img.dataset.startHeight = data.height;
        img.className = 'gallery-img';
        itemWrapper.appendChild(img);

        let deleteImg = document.createElement('div');
        deleteImg.className = 'delete-btn';
        deleteImg.innerHTML = '<p>Удалить</p>';
        itemWrapper.appendChild(deleteImg);
    }

    size = new Object();
    function calcSize(width, height, parent)
    {

        imgWidth = width;
        imgHeight = height;
        const ratio = width/height;
        if(height != 200)
        {
            imgHeight = 200;
            imgWidth = 200*ratio;
        }
        if(imgWidth > parseInt(getComputedStyle(parent).width))
        {
            imgHeight = parseInt(getComputedStyle(parent).width)/ratio;
            imgWidth = parseInt(getComputedStyle(parent).width);
        }
        
        size.width = imgWidth;
        size.height = imgHeight;

        return size;
    }

    function calcRow(images, parent)
    {
        let parentWidth = parseInt(getComputedStyle(parent).width);

        let row_arr = [];
        let row_size = 0;
        let scale = 1;
        //build rows
        for(let i=0;i < images.length; i++)
        {
            if(row_size + images[i].width >= parentWidth)
            {
                scale = parentWidth/row_size;
                row_arr.forEach(function(item){
                    item.width *= scale;
                    item.height *= scale;
                    item.dataset.scale = scale;
                });
                row_arr = [];
                row_size = 0;
                scale = 1;
            }

            row_arr.push(images[i]);
            row_size += images[i].width;

            //build last row
            if(i == images.length-1)
            {
                scale = parentWidth/row_size;
                row_arr.forEach(function(item){
                    item.width *= scale;
                    item.height *= scale;
                    item.dataset.scale = scale;
                });
            }

        }
    }

    function resizeWrapper(images)
    {
        images.forEach(function(image){
            parentImage = image.parentNode;
            parentImage.style.height = image.height+'px';
        });
    }


    function recalcImageSize()
    {
        const galerryImgs = document.querySelectorAll('.gallery-img');
        galerryImgs.forEach(function(image){
            size = calcSize(image.dataset.startWidth, image.dataset.startHeight, galerryBlock);
            image.width = size.width;
            image.height = size.height;
        });
        calcRow(galerryImgs,galerryBlock);
        resizeWrapper(galerryImgs);
        checkVision();
    }

    img = new Object();
    function loadFromUrl(input)
    {
        if(isValidHttpUrl(input.value))
        {
            img.url = input.value;
            img.url = input.value;
            toggleModal();
            sendRequest('/api/uploadImageFromUrl','post',img)
            .then(function(response){
                if(response.status == 'ok')
                {
                    getGallery();
                }else{
                    toggleModal();
                    alert('Ошибка HTTP: ' + response.status);
                }
            });
        }else{
            alert('Не верный URL адрес');
        }
    }

    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (_) {
            return false;  
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    function toggleModal()
    {
        console.log(modalEl.style.display);
        if(modalEl.style.display == 'none')
        {
            window.scrollTo(0, 0);
            bodyEl.classList.add('stop-scrolling');
            modalEl.style.display = 'flex';
        }else{
            bodyEl.classList.remove('stop-scrolling');
            modalEl.style.display = 'none';
        }
    }

    function showDropZone(e)
    {
        e.preventDefault();
        e.stopPropagation();
        galleryBox.classList.add('active');
    }

    function hideDropZone(e)
    {
        e.preventDefault();
        e.stopPropagation();
        galleryBox.classList.remove('active');
    }

    function loadDropFile(e)
    {
        e.preventDefault();
        e.stopPropagation();
        let dt = e.dataTransfer
        let files = dt.files

        for(let i = 0; i < files.length; i++)
        {
            console.log(files[i]);
            uploadFile(files[i]);
        }
        /*
        files.forEach(function(file){
            uploadFile(file);
        });*/
        galleryBox.classList.remove('active');
    }

    function uploadFile(file) {
        toggleModal();
        let url = '/api/uploadFile'
        let formData = new FormData()
        formData.append('file', file)
        fetch(url, {
          method: 'POST',
          body: formData
        })
        .then(() => {
            getGallery();
        })
        .catch(() => {alert('Что то пошло не так.')})
    }

    function checkVision()
    {
        galleryImage = document.querySelectorAll('.gallery-img');
        galleryImage.forEach(function(image){
            if(!image.src)
            {
                if(elementInViewport(image))
                {
                    image.src = image.dataset.src;
                }
            }
        })
    }

    function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;
      
        while(el.offsetParent) {
          el = el.offsetParent;
          top += el.offsetTop;
          left += el.offsetLeft;
        }
      
        return (
            top < (window.pageYOffset + window.innerHeight) &&
            left < (window.pageXOffset + window.innerWidth) &&
            (top + height) > window.pageYOffset &&
            (left + width) > window.pageXOffset
        );
    }

    galleryBox.addEventListener('dragover', showDropZone);
    galleryBox.addEventListener('dragleave', hideDropZone);
    galleryBox.addEventListener('drop', loadDropFile);


    window.addEventListener('scroll',checkVision)
    window.addEventListener('resize', recalcImageSize);
    loadFromUrlEl.addEventListener('click', function(){loadFromUrl(uploadImageUrlEl)});

    getGallery();
}
document.addEventListener('DOMContentLoaded', ready);