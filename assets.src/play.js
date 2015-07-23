function url (path) { return config.baseUrl + '/' + path; }
$(function () {
  $.getJSON(url('db/'+config.id+'.json'), function (res) {
    var data = JSON.parse(res.playback);
    window.liveEditor = new LiveEditor({
      el: $("#sample-live-editor"),
      code: data.init.code,
      version: data.init.version,
      recordingMP3: res.mp3,
      recordingCommands: data.commands,
      recordingInit: data.init,
      width: 400,
      height: 400,
      workersDir: url("live-editor/workers/"),
      externalsDir: url("live-editor/external/"),
      imagesDir: url("live-editor/images/"),
      execFile: url("output.html"),
      jshintFile: url("live-editor/external/jshint/jshint.js")
    });
  });
});