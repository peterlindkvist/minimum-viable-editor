(function(config = {}){
  function load(url){
    var el = document.createElement('script');
    el.setAttribute('src', url);
    document.getElementsByTagName('head')[0].appendChild(el);
  }

  function init(){
    const checkHash = () => {
      if(document.location.hash === '#' + config.hash){
        load(config.index);
      }
    };
    var hashChange = window.onhashchange;
    window.onhashchange = function(){
      checkHash();
      if(typeof hashChange === 'function'){
        hashChange();
      }
    };
    checkHash();
  }

  init();
})(MVE_CONFIG); //replaced by node
