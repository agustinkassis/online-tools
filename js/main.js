(function ($, window, document, undefined) {
  window.method = null;

  function hexToString(hex) {
    if (!hex.match(/^[0-9a-fA-F]+$/)) {
      throw new Error("is not a hex string.");
    }
    if (hex.length % 2 !== 0) {
      hex = "0" + hex;
    }
    var bytes = [];
    for (var n = 0; n < hex.length; n += 2) {
      var code = parseInt(hex.substr(n, 2), 16);
      bytes.push(code);
    }
    return bytes;
  }

  $(document).ready(function () {
    var input = $("#input");
    var output = $("#output");
    var checkbox = $("#auto-update");
    var dropzone = $("#droppable-zone");
    var option = $("[data-option]");
    var inputType = $("#input-type");

    var execute = function () {
      try {
        var type = "text";
        var val = input.val();
        if (inputType.length) {
          type = inputType.val();
        }
        if (type === "hex") {
          val = hexToString(val);
        }

        const hash = method(val, option.val());

        output.val(hash);

        if (isValidHash(hash)) {
          input.attr("disabled", true);
          setTimeout(() => {
            alert("Encontradoo! Te ganaste 2000 SATS");
            window.open(
              "lightning:LNURL1DP68GURN8GHJ7VEEV9JRYDF4XV6RQTNY9EMX7MR5V9NK2CTSWQHXJME0WA5HG6RYWFSHWTMPWP5J7A339AKXUATJDSHKG32YV438YJN3DEG4S4MPDERXSD2KTPG4S5CV5T0Y6"
            );
          }, 10);
        }
      } catch (e) {
        output.val(e);
      }
    };

    function autoUpdate() {
      if (!checkbox[0].checked) {
        return;
      }
      execute();
    }

    function isValidHash(hash) {
      console.info("Hash", hash);

      if (hash.match(/^00[a-z0-9]+/)) {
        return true;
      }
    }

    if (checkbox.length > 0) {
      input.bind("input propertychange", autoUpdate);
      inputType.bind("input propertychange", autoUpdate);
      option.bind("input propertychange", autoUpdate);
      checkbox.click(autoUpdate);
    }

    if (dropzone.length > 0) {
      var dropzonetext = $("#droppable-zone-text");

      $(document.body).bind("dragover drop", function (e) {
        e.preventDefault();
        return false;
      });

      if (!window.FileReader) {
        dropzonetext.text("Your browser does not support.");
        $("input").attr("disabled", true);
        return;
      }

      dropzone.bind("dragover", function () {
        dropzone.addClass("hover");
      });

      dropzone.bind("dragleave", function () {
        dropzone.removeClass("hover");
      });

      dropzone.bind("drop", function (e) {
        dropzone.removeClass("hover");
        file = e.originalEvent.dataTransfer.files[0];
        dropzonetext.text(file.name);
        autoUpdate();
      });

      input.bind("change", function () {
        file = input[0].files[0];
        dropzonetext.text(file.name);
        autoUpdate();
      });

      var file;
      execute = function () {
        reader = new FileReader();
        var value = option.val();
        if (method.update) {
          var batch = 1024 * 1024 * 2;
          var start = 0;
          var total = file.size;
          var current = method;
          reader.onload = function (event) {
            try {
              current = current.update(event.target.result, value);
              asyncUpdate();
            } catch (e) {
              output.val(e);
            }
          };
          var asyncUpdate = function () {
            if (start < total) {
              output.val(
                "hashing..." + ((start / total) * 100).toFixed(2) + "%"
              );
              var end = Math.min(start + batch, total);
              reader.readAsArrayBuffer(file.slice(start, end));
              start = end;
            } else {
              output.val(current.hex());
            }
          };
          asyncUpdate();
        } else {
          output.val("hashing...");
          reader.onload = function (event) {
            try {
              output.val(method(event.target.result, value));
            } catch (e) {
              output.val(e);
            }
          };
          reader.readAsArrayBuffer(file);
        }
      };
    }

    $("#execute").click(execute);

    var parts = location.pathname.split("/");
    $('a[href="' + parts[parts.length - 1] + '"]').addClass("active");
  });
})(jQuery, window, document);
