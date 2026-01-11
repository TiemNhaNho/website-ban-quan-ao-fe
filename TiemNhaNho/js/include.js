(function() {
  var includes = document.querySelectorAll('[data-include]');
  includes.forEach(function(el) {
    var name = el.getAttribute('data-include');
    var path = 'includes/' + name + '.html';
    try {
      var req = new XMLHttpRequest();
      req.open('GET', path, false); // synchronous
      req.send(null);
      if (req.status === 200 || req.status === 0) {
        el.innerHTML = req.responseText;
      } else {
        console.error('Include not found: ' + path + ' (status ' + req.status + ')');
      }
    } catch (e) {
      console.error(e);
    }
  });
})();
