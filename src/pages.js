
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
        updatePageNoBKUP();
        doc.addPage({
            size: [0.75*$("#svg").width(),0.75*$("#svg").height()],
            margin: 0
        });
        doc.rect(0, 0, $("#svg").width(), $("#svg").height()).fill('#000000');
        SVGtoPDF(doc, svg, 0, 0, {useCSS: false});
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

function updatePageNoBKUP() {
    document.getElementById("pageNumber").innerHTML = "Page " + pageNumber + " of " + maxPage;
    document.getElementById("svg").innerHTML = pageContents[pageNumber];
    if (pageHeight[pageNumber] != undefined)
    {
        svg.setAttribute("height", pageHeight[pageNumber]);
    }
    else
    {
        svg.setAttribute("height", $("#svgholder").height());
    }
}

function updatePage() {
    storeDataToBS()
    document.getElementById("pageNumber").innerHTML = "Page " + pageNumber + " of " + maxPage;
    document.getElementById("svg").innerHTML = pageContents[pageNumber];
    if (pageHeight[pageNumber] != undefined)
    {
        svg.setAttribute("height", pageHeight[pageNumber]);
    }
    else
    {
        svg.setAttribute("height", $("#svgholder").height());
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

function uploadFile() {

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
            updatePage();

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
        } else if (file.name.includes("notebook")) {
            
            pageNumber = 1; 
            pageContents = []; 
            maxPage = 1; 
            pageHeight = [];
            svg.innerHTML = "";

            updatePage();

            JSZip.loadAsync(file).then(function(content) {
                
                let buildArray = [];

                content.forEach(function(path, file) {
                    if (path.includes("page")) {
                        var matches = path.match(/page(.*?).svg/);
                        var str = matches && matches.length ? matches[1] : '';
                        buildArray[str] = file.async("text");
                    }
                });

                return Promise.all(buildArray);

            }).then(function (buildArray) {

                for (let i = 1; i < buildArray.length+1; i++) {
                    if (buildArray[i-1].includes("<\\title>")) {
                        var matches = buildArray[i-1].match(/<\/title>(.*?)<\/svg>/);
                        var str = matches && matches.length ? matches[1] : '';
                    } else {
                        var matches = buildArray[i-1].match(/(?<=<svg.*>)(.*)(?=<\/svg>)/);
                        var str = matches && matches.length ? matches[1] : '';
                    }
                    
                    svg.innerHTML = '<rect x="0" y="0" width="100%" height="100%" fill="#ffffff" st_id="6"/>' + str;

                    var matches = buildArray[i-1].match(/height="(.*?)"/);
                    var str = matches && matches.length ? matches[1] : '';
                    svg.setAttribute("height", str);

                    var matches = buildArray[i-1].match(/width="(.*?)"/);
                    var str = matches && matches.length ? matches[1] : '';
                    svg.setAttribute("width", str);

                    if (i < buildArray.length) {
                        advancePage();
                    } else {
                        updatePageContents();
                        pageNumber = 1;
                        updatePage();
                    }
                }

            });
        } else {
            alert("Unknown Filetype, it is a " + file.type);
        }
    }
}

function downloadNotebook() {
    updatePageContents();
    pageNumber = 1;
    updatePage();
    let zip = new JSZip();

    for (let i = 1; i < pageContents.length; i++) {
        let string = "<svg width='" + svg.getAttribute("width") + "' height='" + svg.getAttribute("height") + "'>" + pageContents[i] + "</svg>";
        zip.file("page" + i + ".svg", string);
        if (i < pageContents.length-1) {
            advancePage();
        }
    }

    fetch('./notebookfiles/imsmanifest.xml')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("imsmanifest.xml", ab);
    });

    fetch('./notebookfiles/metadata.db')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("metadata.db", ab);
    });

    fetch('./notebookfiles/metadata.rdf')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("metadata.rdf", ab);
    });

    fetch('./notebookfiles/metadata.xml')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("metadata.xml", ab);
    });

    fetch('./notebookfiles/preview.png')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("preview.png", ab);
    });

    fetch('./notebookfiles/settings.xml')
    .then(res => res.arrayBuffer())
    .then(ab => {
        console.log(ab);
        zip.file("settings.xml", ab);
    }).then(function() {

    zip.generateAsync({type:"blob"}).then(function(content) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        var filename = "."

        while (filename.includes(".")) {
            filename = prompt("Please enter a filename", "")
        }
        filename += ".notebook";
        a.download = filename;
        a.click();
        a.remove();
    });});

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

    pageNumber = 1; 
    pageContents = []; 
    maxPage = 1; 
    pageHeight = [];
    svg.innerHTML = "";

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

function storeDataToBS() {
    console.log("test")
    var json = {};
    json.pageContents = pageContents;
    json.pageHeight = pageHeight;
    json.maxPage = maxPage;
    json.pageNumber = pageNumber;
    json.counter = counter;

    var jsonString = JSON.stringify(json);

    localStorage.setItem('data', jsonString)
}

function getDataFromBS() {
    let data = JSON.parse(localStorage.getItem('data'));
    pageContents = data.pageContents;
    pageHeight = data.pageHeight;
    maxPage = data.maxPage;
    pageNumber = data.pageNumber;
    counter = data.counter;
    
    updatePage();
}