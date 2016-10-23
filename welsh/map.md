---
layout: default
title: Map demo
---



  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDAPhF1wOvzQ7uoAjYXKPe7FmyGQrGIZYE&callback=initMap">
    </script>

		
<script src="common.js"></script>
<script src="meetups.js"></script>

# Map demo

<div id="mapdiv"><span class="loading">Loading map...</span></div>
<style>

      #mapdiv {
        height: 100%;
		width: 100%;
		position:absolute;
      }

</style>

<script>

	function initMap()
	{
		
		//1 - centre the map on Newport
		//2 - go get the json of location
		//3 - for each location add a push pin baased on the lat/long
		//4 - click the pushpin - show a tiny pop up with a summary


		
	  var myLatLng = {lat: 51.588433, lng:-2.969394 }; //newport

         map = new google.maps.Map(document.getElementById('mapdiv'), {
          zoom: 10,
          center: myLatLng
        });

				getJson("south-east", fillMap);
	}

	var map = null;
	var openedWindow = null;

	function fillMap($json)
	{

			for(var index=0;index<$json.Items.length;index++)
			{
				var item = $json.Items[index];

				if(item.Location)
				{
					
					

					var meetingPoint = new google.maps.LatLng(parseFloat(item.Location.Lat), parseFloat(item.Location.Long));

					var marker = new google.maps.Marker({
							position: meetingPoint,
							title:item.Title
					});

					marker.setMap(map);
					var contentDiv = $("<div/>");
					renderMeetup(item,contentDiv);

					var infowindow =  new google.maps.InfoWindow();

					var content = contentDiv.html();
					google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
						return function() {
							if(openedWindow!=null)
							{
								openedWindow.close();
								openedWindow= null;
							}
							infowindow.setContent(content);
							infowindow.open(map,marker);
							openedWindow = infowindow;
						};
					})(marker,content,infowindow)); 
				}
			}
	}
</script>