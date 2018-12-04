'use strict';
var currentQUERY, imageRESULTS, textRESULTS,
first_result_on_page,
text_results_on_page = 4, 
image_results_on_page = 10,
cse_adress = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBL_RVs7FqQMRa36IYt9pxsFj5YHkCC2bE&cx=011499103571233449360:lfkrodi6ffq';

function init () {
	imageRESULTS = document.getElementById("RESULTSpanel_1"); 
	textRESULTS = document.getElementById("RESULTSpanel_2");
}


function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}



function makeCorsRequest(agent, navBARpage) {
	// new text request
	if (agent == "submitBtt") {
		var QRY = document.getElementById("Q").value;
		first_result_on_page = 1;
		if (QRY == "") {
			alert("Please insert some text");
			return;
		} 
		var url = cse_adress + '&q='+QRY+'&num='+text_results_on_page+'&start='+first_result_on_page;
	}	
	
	// next image page request
	if (agent == "RESULTSpanel_1") {
		var QRY = currentQUERY;
		first_result_on_page = (image_results_on_page * navBARpage) - (image_results_on_page - 1);
		var url = cse_adress + '&searchType=image&q='+QRY+'&num='+image_results_on_page+'&start='+first_result_on_page;
	}
	
	// next text page request
	if (agent == "RESULTSpanel_2") {
		var QRY = currentQUERY;
		first_result_on_page = (text_results_on_page * navBARpage) - (text_results_on_page - 1);
		var url = cse_adress + '&q='+QRY+'&num='+text_results_on_page+'&start='+first_result_on_page;
	}
	
	// first image page request
	if (agent == "first_image_search") {
		var QRY = currentQUERY;
		first_result_on_page = 1;
		var url = cse_adress + '&searchType=image&q='+QRY+'&num='+image_results_on_page+'&start='+first_result_on_page;
	}
   
	
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		alert('CORS not supported');
		return;
	}
	xhr.onload = function() {
		var jsonDATA = JSON.parse(xhr.responseText);
		currentQUERY = jsonDATA["queries"]["request"][0].searchTerms;
		
		if (jsonDATA["queries"]["request"][0].searchType == "image") {
			showIMAGEresults(jsonDATA);	
		} else {
			showTEXTresults(jsonDATA);
			if (agent == "submitBtt") {
				xhr.abort();
				makeCorsRequest("first_image_search", 1);
			}
		}
	}
	
	xhr.onerror = function() {
		alert('Conection error.');
	}
	
	xhr.send();
 
}


function showTEXTresults(WEBSjsonDATA) {
	textRESULTS.style.visibility = "visible";
	
	while (textRESULTS.firstChild) {textRESULTS.removeChild(textRESULTS.firstChild);}
	
	textRESULTS.innerHTML += "<h1>Web result</h1>";
	
	for (var i = 0; i < WEBSjsonDATA["items"].length; i++) {

		var tit = document.createElement("div");
		var adress = document.createElement("div");
		var snipp = document.createElement("div");
		tit.classList.add("sR-title");
		adress.classList.add("sR-adress");
		snipp.classList.add("sR-snippet");
		
		tit.innerHTML += WEBSjsonDATA["items"][i].title;
		adress.innerHTML += WEBSjsonDATA["items"][i].displayLink;
		snipp.innerHTML += WEBSjsonDATA["items"][i].snippet;
		
		var link = WEBSjsonDATA["items"][i].link;
		var link_area = document.createElement("a");
		link_area.classList.add("sR-link_area");
		link_area.setAttribute("href", link);
		
		link_area.appendChild(tit);
		link_area.appendChild(adress);
		link_area.appendChild(snipp);
		
		textRESULTS.appendChild(link_area);
		
	}
	
	navbar (WEBSjsonDATA, textRESULTS, text_results_on_page);
	
} 


function showIMAGEresults(IMGSjsonDATA) {
	console.log(IMGSjsonDATA);
	imageRESULTS.style.visibility = "visible";
	while (imageRESULTS.firstChild) {imageRESULTS.removeChild(imageRESULTS.firstChild);}
	imageRESULTS.innerHTML += "<h1>Image result</h1>";
	
	for (var i = 0; i < IMGSjsonDATA["items"].length; i++) {
		
		var thumb = document.createElement("div");
		thumb.classList.add("sR-imgTHUMB");
		var thumbLink = IMGSjsonDATA["items"][i]["image"].thumbnailLink;
		thumb.innerHTML = "<img src="+thumbLink+">"

		imageRESULTS.appendChild(thumb);
	}

	navbar (IMGSjsonDATA, imageRESULTS, image_results_on_page);

}

function navbar (jsonRESULT, panel, results_on_page) {
	
	var totalPages = Math.ceil(jsonRESULT["searchInformation"].totalResults / results_on_page);
	var currentPage = Math.floor(first_result_on_page / results_on_page) + 1;
    var pageControls = "<div class='navigation'>";

	for (var x = 1; x <= totalPages && x<=10; x++) {
		pageControls += "<div class='nav-page";
		if (x === currentPage) {
			pageControls += " nav-current-page";
			}
	   pageControls+="'onclick='navBARrequest("+panel.id+", "+x+")'>"+x+"</div>";	
	}
	pageControls += "</div>";
	panel.innerHTML += pageControls;
	
}

function navBARrequest(panel, nr) {
	makeCorsRequest(panel.id, nr);
}




