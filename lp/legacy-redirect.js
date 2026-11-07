// Alte Viewer-Links (mapx.at/#zoom/lat/lon[/bearing/pitch][&…]) führen jetzt zur Demo-Karte.
// Die Landing selbst nutzt keine Hash-Adressen, daher ist die Weiterleitung eindeutig.
(function () {
  var h = location.hash;
  if (/^#\d{1,2}(\.\d+)?\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?/.test(h)) {
    location.replace("https://map.mapx.at/" + h);
  }
})();
