function pad(num, pad)
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
    var dataView = new DataView(reader.result);
    var hex = [];
    var ascii = [];
    var lineNum = [];
    var line = 0;

    for(var counter = 0; counter < dataView.byteLength; ++counter)
    {
      hex.push(pad(dataView.getUint8(counter), 2));
      ascii.push(String.fromCharCode(dataView.getUint8(counter)));

      if (dataView.getUint8(counter) === 0x20)
      {
        ascii[counter] = '_';
      }
      else if (dataView.getUint8(counter) < 0x21 || dataView.getUint8(counter) > 0x7E)
      {
        ascii[counter] = String.fromCharCode(0xFFFF);
      }

      if (counter % 16 === 0)
      {
        lineNum.push('0x' + pad(line, 7) + 0);
        line += 1;
      }
    }

    $('#hex').text(hex.join(' '));
    $('#ascii').text(ascii.join(' '));
    $('.lineNum').text(lineNum.join('\n'));
  }

  urlReader.onload = function()
  {
    var url = urlReader.result;
    $('body').css('background-image', 'url(' + url + ')');
    document.getElementById('img').src = url;
  }

  reader.onloadend = function()
  {
    $('#fileName').text(file.name);
  }

  if (file)
  {
    $('#fileName').text('Loading...');

    reader.readAsArrayBuffer(file);
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
  });

  document.getElementById('fileIn').addEventListener('change', handleFileSelect, false);
}

$(document).ready(main);
