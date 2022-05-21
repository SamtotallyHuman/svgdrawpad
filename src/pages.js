
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
      link.click();
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