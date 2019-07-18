var removeItems = (target) => {
    [...target.querySelectorAll('#video-title[aria-label*="Teaser"],#video-title[aria-label*="Contest"],#video-title[aria-label*="Preview"]')].map(tag => tag.closest('ytd-grid-video-renderer')).forEach(tag => tag.style.display = 'none')
}

var observer = new MutationObserver((mutationsList, observer) => {
    for(var mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.target.classList.contains('ytd-section-list-renderer')) {
            removeItems(mutation.target)
        }
    }
});

var list = document.querySelector('#contents.ytd-section-list-renderer');
if(list) {
    observer.observe(list, { childList: true, subtree: true });
    //observer.disconnect();
    
    removeItems(document)
}