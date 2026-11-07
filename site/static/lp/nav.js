(function () {
  var n = document.getElementById("nav"), b = document.getElementById("menubtn");
  if (!n || !b) return;
  b.addEventListener("click", function () {
    var o = n.classList.toggle("open");
    b.setAttribute("aria-expanded", o ? "true" : "false");
  });
})();
