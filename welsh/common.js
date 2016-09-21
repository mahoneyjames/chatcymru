function navBar_highlightregion(region)
{
    $(".areanav .active").removeClass("active");
    log($(".region." + region).length);
    $(".region." + region).addClass("active");
}

function getParameterByName(name, url) {
	
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
	
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getJson(region, callback,apiMode)
{
	if(apiMode==null)
	{
		apiMode = 'simpleapi';
	}
	
	var url = 'https://chatdirectory.blob.core.windows.net/' + apiMode + '/' + region + '/meetups.json';
	//url = '/welsh/meetups.json';
	log(url);
	$.get(url, null,function (data)
	{
		log(typeof data);
		
		
		if(typeof data == "string")
		{
			callback($.parseJSON(data));
		}
		else
		{
			callback(data);	
		}
	});
}
function log(message)
{
	if(window.console)
	{
		console.log(message);
	}
}