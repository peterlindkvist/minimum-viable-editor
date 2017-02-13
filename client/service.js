const _config = MVE_CONFIG;

function load(callback){
  const options =  {
    credentials: 'include'
  };
  fetch(_config.editorUrl + '/content/', options).then((resp) => resp.json()).then(callback);
}

function save(content, callback){
  const options = {
    credentials: 'include',
    body : JSON.stringify(content),
    method : 'POST',
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  };

  fetch(_config.editorUrl + '/content/', options).then(callback);
}

function uploadFile(file, name, callback){
  const data = new FormData();
  data.append(name, file);
  const options = {
    credentials: 'include',
    body : data,
    method : 'POST'
  };

  fetch(_config.editorUrl + '/files', options).
    then((response) => response.text()).then(callback);
}

module.exports = {
  load,
  save,
  uploadFile
}
