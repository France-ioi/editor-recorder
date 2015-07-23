var version = "3";

window.liveEditor = new LiveEditor({
  el: $("#sample-live-editor"),
  code: window.localStorage["test-code"] || "rect(10, 10, 100, 100);",
  version: version,
  width: 400,
  height: 400,
  workersDir: "live-editor/workers/",
  externalsDir: "live-editor/external/",
  imagesDir: "live-editor/images/",
  execFile: "output.html",
  jshintFile: "live-editor/external/jshint/jshint.js",
  transloaditAuthKey: "df5d38b0309f11e5842c77112e5efe35",
  transloaditTemplate: "badcd25030a111e5a90921da194da5d0"
});

liveEditor.editor.on("change", function () {
    window.localStorage["test-code"] = liveEditor.editor.text();
});
ScratchpadAutosuggest.init(liveEditor.editor.editor);

// When the first chunk is saved, enable the save recording button
$("#record").on("click", function () {
  $(".scratchpad-dev-save-chunk").on("click", function () {
    $(".save-recording").attr("disabled", false);
  });
});

$(".save-recording").on("click", function (el) {

  var playback = liveEditor.record.dumpRecording();
  playback.init.configVersions = version;

  var recordingName = $("#recording-name").val();
  if (!recordingName) {
    alert("Please enter a name for the recording!");
    return;
  }

  $(this).attr("disabled", true);

  $.ajax({
    url: "/save",
    method: "post",
    data: {
      "name": recordingName,
      "playback": JSON.stringify(playback)
    },
    success: function(recording_id) {

      $('.recording-list').append('<li><a href="db/' + escape(recording_id) + '.json">' + recording_id + '</a> — please wait for audio to upload</li>');

      // Save the actual recording and upload it to the storage server
      var path = "live-editor/" + recording_id + "/audio.${file.ext}";

      var templateSteps = {
        export: {path: path}
      };

      // Save the audio
      liveEditor.saveRecording(function (err, recordingMP3) {

        // Sometimes the api doesn't find the assembly, when the recording is too short
        if (err) {
          alert("The recording might have not been saved! Please refresh.")
          console.warn(err);
          $(this).attr("disabled", false);
          $.ajax({
            url: "/recording/" + recording_id,
            method: "delete"
          });
          return;
        }

        // If we have the mp3 url, add it to the recording
        if (recordingMP3) {

          $('.recording-list').append('<li><a href="'+escape(recordingMP3)+'">audio</a> — updating json file</li>');

          $.ajax({
            url: "/save",
            method: "PUT",
            data: {
              mp3: recordingMP3,
              id: recording_id
            },
            success: function (response) {
              $('.recording-list').append('<li><a href="play?id=' + escape(recording_id) + '">play the recording</a>');
            },
            error: function (response) {
              console.log(response);
            }
          });
        }

      }, templateSteps);
  },
  error: function (response) {
    console.warn(response);
  }});

});
