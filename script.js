const left =document.querySelector('.left');
const right =document.querySelector('.right');
const slider =document.querySelector('.slider');
const images=document.querySelectorAll('.image');
const overlay = document.getElementById('overlay');
const overlayLeft = document.getElementById('overlayLeft');
const overlayRight = document.getElementById('overlayRight');
const overlaySlider = document.getElementById('overlaySlider');
const overlayImages = document.querySelectorAll('.overlay-image');

let slidenumber=0;
const length=images.length;
const nextSlide=()=>{
    slider.style.transform=`translateX(-${slidenumber*700}px)`
    slidenumber++ ;
}
const prevSlide=()=>{
    slider.style.transform=`translateX(-${(slidenumber-2)*700}px)`
    slidenumber--;
}
const getfirstslide=()=>{
    slider.style.transform=`translateX(0px)`;
    slidenumber=1; 
}
const getlastslide=()=>{
    slider.style.transform=`translateX(-${(length-1)*800}px)`;
    slidenumber=1; 
}
right.addEventListener('click',()=>{
    slidenumber<length? nextSlide(): getfirstslide();

});
left.addEventListener('click',()=>{
    slidenumber>1? prevSlide(): getlastslide();

});
images.forEach((image, index) => {
    image.addEventListener('click', () => {
        openOverlay(index);
    });
});
let overlaySlideNumber = 0;
const openOverlay = (index) => {
    overlay.style.display = 'flex';
    overlaySlider.style.transform = `translateX(-${index * 100}%)`;
    overlaySlideNumber = index + 1;
};

const closeOverlay = () => {
    overlay.style.display = 'none';
};



const nextOverlaySlide = () => {
    overlaySlider.style.transform = `translateX(-${overlaySlideNumber * 100}%)`;
    overlaySlideNumber++;
};

const prevOverlaySlide = () => {
    overlaySlider.style.transform = `translateX(-${(overlaySlideNumber - 2) * 100}%)`;
    overlaySlideNumber--;
};

const getFirstOverlaySlide = () => {
    overlaySlider.style.transform = `translateX(0px)`;
    overlaySlideNumber = 1;
};

const getLastOverlaySlide = () => {
    overlaySlider.style.transform = `translateX(-${(overlayImages.length - 1) * 100}%)`;
    overlaySlideNumber = overlayImages.length;
};

overlayRight.addEventListener('click', (event) => {
    event.stopPropagation();
    overlaySlideNumber < overlayImages.length ? nextOverlaySlide() : getFirstOverlaySlide();
});

overlayLeft.addEventListener('click', () => {
    event.stopPropagation();
    overlaySlideNumber > 1 ? prevOverlaySlide() : getLastOverlaySlide();
});

overlay.addEventListener('click', closeOverlay);