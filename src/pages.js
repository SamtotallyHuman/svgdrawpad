
var pageNumber = 1; // Defines the current page number
var pageContents = []; // Defines the page contents
var maxPage = 1; // Defines the maximum page number
var pageHeight = []; // Defines the page height
var defaultHeight = 0; // Defines the default height of the svg

function downloadPDF() {
    changePenAction('pen');
    updatePageContents();
    let doc = new PDFDocument({ 
        compress: false,
        autoFirstPage: false
    });
    
    // Loops through all svgs and adds them to a page
    for (let i = 1; i <= maxPage; i++) {
        pageNumber = i;
        updatePage();
        doc.addPage({
            size: [0.75*$("#svg").width(),0.75*$("#svg").height()],
            margin: 0
        });
        doc.rect(0, 0, $("#svg").width(), $("#svg").height()).fill('#000000');
        SVGtoPDF(doc, svg, 0, 0);
    }

    let stream = doc.pipe(blobStream());
    stream.on('finish', () => {
      let blob = stream.toBlob('application/pdf');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "svgDrawPadImage" + ".pdf";
      window.open(link.href);
    });
    doc.end();
}

function updatePage()
{
    document.getElementById("pageNumber").innerHTML = "Page " + pageNumber + " of " + maxPage;
    document.getElementById("svg").innerHTML = pageContents[pageNumber];
    if (pageHeight[pageNumber] != undefined)
    {
        svg.setAttribute("height", pageHeight[pageNumber]);
    }
    else
    {
        svg.setAttribute("height", defaultHeight);
    }
}

function updatePageContents() {
    if (penAction == "move")
    {
        changePenAction("pen");
    }
    pageContents[pageNumber] = svg.innerHTML;
    pageHeight[pageNumber] = $("#svg").height();
}

// Changes the page state
function advancePage() {
    updatePageContents();
    if (pageNumber < maxPage) {
        pageNumber++;
        updatePage();
        
    } else {
        maxPage++;
        pageNumber++;
        updatePage();
    }
}

function gobackPage() {
    updatePageContents();
    if (pageNumber > 1) {
        pageNumber--;
        updatePage();
    }
}

function extendPage() {
    var svgHeight = svg.getAttribute("height");
    svgHeight = parseInt(svgHeight) + 540;
    svg.setAttribute("height", svgHeight);
}

const scale = 1/0.75;
var currentPageNumber = 1;

function uploadPDF() {

    // User can select file
    document.getElementById('file-input').click();

    // When file is selected
    document.getElementById('file-input').onchange = function() {
        // Get file
        var file = this.files[0];
        var reader = new FileReader();
        
        // Check if file is pdf
        if (file.type == "application/pdf") {

            pageNumber = 1; 
            pageContents = []; 
            maxPage = 1; 
            pageHeight = [];
            svg.innerHTML = "";
            currentPageNumber = 0;

            // Read file
            reader.readAsArrayBuffer(file);
            // When file is read
            reader.onload = function(event) {
                var pdf = new Uint8Array(event.target.result);
                var loadingTask = pdfjsLib.getDocument(pdf);
                loadingTask.promise.then(function(pdf) {
                    var numPages = pdf.numPages;
                    for (var i = 1; i <= numPages; i++) {
                        pdf.getPage(i).then(function(page) {
                            
                            var viewport = page.getViewport({scale: scale});
                            // Converts the page to an image
                            var canvas = document.createElement('canvas');
                            var context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            var renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            var renderTask = page.render(renderContext);
                            renderTask.promise.then(function() {

                                currentPageNumber++;
                                var dataurl = canvas.toDataURL("image/png")
                                var img = document.createElementNS('http://www.w3.org/2000/svg','image');
                                img.setAttributeNS(null,'height',viewport.height);
                                img.setAttributeNS(null,'width',viewport.width);
                                img.setAttributeNS('http://www.w3.org/1999/xlink','href',dataurl);
                                img.setAttributeNS(null,'draggable','false');
                                img.setAttributeNS(null, 'style', 'pointer-events:none');
                                img.setAttributeNS(null,'x','0');
                                img.setAttributeNS(null,'y','0');
                                img.setAttributeNS(null,'preserveAspectRatio','none');

                                svg.setAttribute("height", viewport.height);
                                svg.setAttribute("width", viewport.width);
                                console.log(viewport.width)
                                $('#svg').append(img);
                                if (currentPageNumber < numPages) {
                                    advancePage();
                                } else {
                                    updatePageContents();
                                    pageNumber = 1;
                                    updatePage();
                                }
                            });
                            
                        });
                    }
                });
            }
        }        
    }
}

function saveToText() {
    updatePageContents();

    var filename = "."

    while (filename.includes(".")) {
        filename = prompt("Please enter a filename", "")
    }
    filename += ".drw"

    var json = {};
    json.pageContents = pageContents;
    json.pageHeight = pageHeight;
    json.maxPage = maxPage;
    json.pageNumber = pageNumber;
    json.counter = counter;

    var jsonString = JSON.stringify(json);

    var a = document.createElement("a");
    var file = new Blob([jsonString], {type: "text/plain;charset=utf-8"});
    a.href = window.URL.createObjectURL(file);
    a.download = filename;
    a.click();
    a.remove();
}

function loadFromText() {
    // User can select file
    document.getElementById('text-file-input').click();

    // When file is selected
    document.getElementById('text-file-input').onchange = function() {
        // Get file
        var file = this.files[0];
        var reader = new FileReader();
        
        // Read file
        reader.readAsText(file);
        // When file is read
        reader.onload = function(event) {
            var jsonString = event.target.result;
            var json = JSON.parse(jsonString);
            pageContents = json.pageContents;
            pageHeight = json.pageHeight;
            maxPage = json.maxPage;
            pageNumber = json.pageNumber;
            counter = json.counter;
            
            updatePage();
        }
    }
}
