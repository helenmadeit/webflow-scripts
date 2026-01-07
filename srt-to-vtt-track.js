(function () {
  const videos = document.querySelectorAll("video[data-subtitles-src]");

  if (!videos.length) return;

  videos.forEach(async (video) => {
    const srtUrl = video.dataset.subtitlesSrc;
    if (!srtUrl) return;

    try {
      const res = await fetch(srtUrl);
      const srt = await res.text();

      const vtt =
        "WEBVTT\n\n" +
        srt
          .replace(/\r+/g, "")
          .replace(/(\d+):(\d+):(\d+),(\d+)/g, "$1:$2:$3.$4");

      const blob = new Blob([vtt], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);

      const track = document.createElement("track");
      track.kind = "subtitles";
      track.label = "English";
      track.srclang = "en";
      track.src = url;
      track.mode = "hidden"; // off by default

      video.appendChild(track);
    } catch (e) {
      console.warn("Subtitles: failed to load", srtUrl, e);
    }
  });
})();
