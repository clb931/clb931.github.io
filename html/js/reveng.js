function padnum(num, pad)
{
  return ((1e16 + num.toString(16).toUpperCase())).slice(-pad);
}

function handleFileSelect(evt)
{
  var file = evt.target.files[0];
  var reader = new FileReader();
  var urlReader = new FileReader();

  reader.onload = function()
  {
    $('#fileName').text(file.name);

    var dataView = new DataView(reader.result);
    var hex = "";
    var ascii = "";
    var lineNum = [];
    var line = 0;

    for(var counter = 0; counter < dataView.byteLength; ++counter)
    {
      hex += padnum(dataView.getUint8(counter), 2) + ' ';

      if (dataView.getUint8(counter) === 0x20)
      {
        ascii += ' ';
      }
      else if (dataView.getUint8(counter) < 0x21 || dataView.getUint8(counter) > 0x7E)
      {
        ascii += '.';
      }
      else
      {
        ascii += String.fromCharCode(dataView.getUint8(counter));
      }

      if (counter % 16 === 0)
      {
        lineNum.push('0x' + padnum(line, 7) + 0);
        line += 1;
      }
    };

    $('#hex').html(hex);
    $('#ascii').html(ascii);
    $('.lineNum').html(lineNum.join('\n'));
  }

  urlReader.onload = function()
  {
    var url = urlReader.result;
    $('body').css('background-image', 'url(' + url + ')');
    document.getElementById('img').src = url;

    $('#hex').html('');
    $('#ascii').html('');
    $('.lineNum').html('');

    if (file.size > 2000000)
    {
      $('#fileName').text('file too big!');
      alert('file too big!');
      return;
    }

    reader.readAsArrayBuffer(file);
  };

  if (file)
  {
    $('#fileName').text('Loading...');

    urlReader.readAsDataURL(file);
  }
}

var main = function()
{
  // Check for the various File API support.
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
  {
    alert('The File APIs are not fully supported in this browser.');
  }

  $('.textArea').scroll(function()
  {
    $('.textArea').not(this).scrollTop($(this).scrollTop());
    $('.lineNum').scrollTop($(this).scrollTop());
  });

  //$('#hex').mouseup(function()
  //{
  //  var selection = window.getSelection();
  //  var textArea = $('#ascii');

  //  var diff = 1/3;
  //  var start = selection.anchorOffset * diff;
  //  var end = selection.focusOffset * diff;
  //  var length = end - start;

  //  if (start > end)
  //  {
  //    length = start - end;
  //    start = end;
  //  }

  //  if (start >= 0)
  //  {
  //      textArea.html(textArea.html().substring(0, start)
  //        + "<span class='highlight'>"
  //        + textArea.html().substring(start, start + length)
  //        + "</span>"
  //        + textArea.html().substring(start + length));
  //  }
  //});

  $('#ascii').mouseup(function()
  {
    var text = window.getSelection().toString();
    var textArea = $('#hex');

    var diff = 3;
    var start = this.innerHTML.indexOf(text) * diff;
    var length = text.length * diff;
    if (start >= 0)
    {
        textArea.html(textArea.html().substring(0, start)
          + "<span class='highlight'>"
          + textArea.html().substring(start, start + length)
          + "</span>"
          + textArea.html().substring(start + length));
    }
  });

  $('.textArea').mousedown(function()
  {
    var wrap = $('.highlight');
    var text = wrap.text();
    wrap.replaceWith(text);
    $(this).removeChild($(this).firstChild);
  });

  document.getElementById('fileIn').addEventListener('change', handleFileSelect, false);
};

$(document).ready(main);
