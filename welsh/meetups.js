
/*
function showArea(area)
{
	$divsForSelectedArea = $(".area-" + area).show();
}

function hideArea(area)
{
	$divsForSelectedArea = $(".area-" + area).hide();
}

function toggleAreaFilter()
{
	var $checkBox = $(event.target);
	
	if($checkBox.is(":checked"))
	{
		showArea($checkBox.val());
	}
	else
	{
		hideArea($checkBox.val());
	}
}*/
/*function renderFilters($json,$areaFilters)
{
	
	if($areaFilters==null)
	{
		return;
	}
	
	$areaFilters.empty();
	var areas = {};
	$areaFilters.addClass('well');
	
	$.each($json.Items, function(i,item)
	{
	
		if(areas[item.Area]==undefined)
		{
			areas[item.Area]='';
		}
	});
	
	var areaFilter = getParameterByName('areaFilter');
	
	for(var propertyName in areas) 
	{
		var escapedArea = propertyName.split(' ').join('-');
		log(propertyName);
		 var $checkBox = $("<input type='checkbox'></input>");
		 $checkBox.attr('id', 'filter' + propertyName);
		 $checkBox.val(escapedArea);
		 
		 
		 $areaFilters.append($checkBox);
		 $areaFilters.append(" <label for='filter" + propertyName + "'>" + propertyName + "</label> ");
		$checkBox.click(toggleAreaFilter);
		
		if(areaFilter==null || areaFilter==propertyName)
		{
			$checkBox.prop('checked','true');
			//showArea(escapedArea);
		}
		else
		
		{
			//hideArea(escapedArea);
		}
	}
}*/
function renderMeetup(item,$wrapper)
{
	var $wrapperDiv = $("<div class=''></div>");

	
	if($wrapper==null)
	{
		$wrapperDiv.appendTo($("#dynamic"));
	}
	else
	{
		$wrapperDiv.appendTo($wrapper);
	}
	
	
	
		  
	$wrapperDiv.addClass("area-" + item.Area.split(' ').join('-'));
	$wrapperDiv.append("<div class=''><h3>" + item.Title + "</h3></div>");
	


	var $details = $("<div class='panel-body'/>")
	$details.appendTo($wrapperDiv);
	$details.append("<p>" + item.Where + " " + item.Postcode + "</p>");
	
	$details.append("<p>" + item.Notes + "</p>");
	if(item.Link!="")
	{
		$details.append("<p><a target='_blank' href='" + item.Link + "'>More info</a></p>");
	}
	
	
	$wrapperDiv.append("<div class=''><h3>When</h3></div>");
	var $whenDiv = $("<div class='panel-body'/>");
	$whenDiv.appendTo($wrapperDiv);
	
	$whenDiv.append("<p>" + item.When.Summary + "</p>");
	for(var index=0; index<item.When.Upcoming.length;index++)
	{
		if(!item.When.Upcoming[index].IsCancelled || item.When.Upcoming[index].IsCancelled==false)
		{	

			$whenDiv.append("<p>Next: " + moment(item.When.Upcoming[index].When).format('dddd Do MMMM') + "</p>");
			break;
		}
	}
	
}

/*
function isEven(n) {
   return n % 2 == 0;
}

function isOdd(n) {
   return Math.abs(n % 2) == 1;
}
*/


function showCalendar($json)
{
	if($("#calendarContent .loading").length==0)
	{
		log("calendar already initialised");
		return;
	}

		var events = [];
		$.each($json.Items, function(i,item){
			if(item.Status=='Confirmed')
			{
				for(var index=0;index<item.When.Upcoming.length; index++)
				{
				var upcomingItem = item.When.Upcoming[index];
					log(upcomingItem);
					var event = {title: item.Title + ' - ' + item.Area, 
								start: upcomingItem.When + "T" + item.When.StartTime,
								end: upcomingItem.When + "T" + item.When.EndTime,
					className:['eventTitle'],
					sourceItem: item};
					
					//log(item.When.Upcoming[index].IsCancelled);
					if(upcomingItem.IsCancelled==true)
					{
						event.title += " (CANCELLED)";
					}
				
					events[events.length] = event;
				}
			}
		});
		
		log($('#calendarContent').html());
		$('#calendarContent').empty();
		log($('#calendarContent').html());
		$('#calendarContent').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay,listWeek'
			},
			defaultView: 'listWeek',
//			defaultDate: '2016-09-04',
			navLinks: true, // can click day/week names to navigate views
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			events: events,
			 eventClick: function(event) {
				$("#eventDetailBody").empty();
				var $div = $("#eventDetailBody");
				renderMeetup(event.sourceItem, $div);
				
				
				$('#eventDetail').modal();
				
				return false;

			}	
		});
		
		log($('#calendarContent').html());
	
}

// function printDay(day, $json) {

// 	if ($json.Items.length > 0) {
// 		var $row = null;
// 		var isFirstForDay = true;
// 		var $col1 = null;
// 		var $col2 = null;


// 		var index = -1;
// 		$.each($json.Items, function (i, item) {
// 			if (item.When.Day == day) {
// 				if (isFirstForDay == true) {
// 					$row = $("<div class='row'/>");
// 					$row.appendTo($("#dynamic"));
// 					$row.append("<h2>" + day + "</h2>");
// 					isFirstForDay = false;
// 				}
// 				index++;
// 				if (isOdd(index)) {
// 					if ($col1 == null) {
// 						$col1 = $("<div class='col-sm-6'/>")
// 						$col1.appendTo($row);
// 					}

// 					renderMeetup(item);
// 				}
// 				else {
// 					if ($col2 == null) {
// 						$col2 = $("<div class='col-sm-6'/>");
// 						$col2.appendTo($row);
// 					}
// 					renderMeetup(item);
// 				}
// 			}

// 		});



// 	}

// }


var $jsonData;
function showMeetupsByDay($json)
{
	$jsonData = $json;
	printTableVersion($json);
	//calendar rendering happens when the user activates the calendar tab
	$("#feedDate").text($json.Generated);
	return;
}


function printTableVersion($json)
{
	$("#dynamic").empty();
	
	var $table = $("#eventsTable");
	
	var $tableBody = $table.find("tbody");
	
	
	printTableDay($tableBody, "Monday",$json);
	printTableDay($tableBody, "Tuesday",$json);
	printTableDay($tableBody, "Wednesday",$json);
	printTableDay($tableBody, "Thursday",$json);
	printTableDay($tableBody, "Friday",$json);
	printTableDay($tableBody, "Saturday",$json);
	printTableDay($tableBody, "Sunday",$json);
	
}

function printTableDay($tableBody, day, $json)
{
	var isHeaderRowAppended = false;
	var $row = $(
					 '	<tr class="fc-list-heading" data-date="2016-09-06">'
					+ '		<td class="fc-widget-header" colspan="3">'
					+ '			<a class="fc-list-heading-main" data-goto="{&quot;date&quot;:&quot;2016-09-06&quot;,&quot;type&quot;:&quot;day&quot;}">Tuesday</a>' //<a class="fc-list-heading-alt" data-goto="{&quot;date&quot;:&quot;2016-09-06&quot;,&quot;type&quot;:&quot;day&quot;}">September 6, 2016</a>'
					+ '		</td>'
					+ '	</tr>');
	$row.find("a").text(day);
	
	
	for(var index=0;index<$json.Items.length;index++)
	{
		var item = $json.Items[index];
		
		if(item.When.Day==day)
		{
			if(!isHeaderRowAppended)
			{
				$row.appendTo($tableBody);
				isHeaderRowAppended=true;
			}
		
			$row = $('<tr class="fc-list-item eventTitle">'
					+ '		<td class="fc-list-item-time fc-widget-content"></td>'
					+ '		<td class="fc-list-item-marker fc-widget-content">'
					+ '			<span class="fc-event-dot"/>'
					+ '		</td>'
					+ '		<td class="fc-list-item-title fc-widget-content">'
					+ '			<a></a><span class="fc-list-heading-alt"/>'
					+ '		</td>'
					+ '	</tr>');
			//log($row);
			
			if(item.When.StartTime!=undefined && item.When.StartTime!="")
			{
				$row.find(".fc-list-item-time").text(moment("1963-09-23T" + item.When.StartTime).format("h:mma"));
			}
			var titleText = item.Title + " - " + item.Area;
			

			$row.find(".fc-list-item-title a").text(titleText);
			if(item.When.Repeats!='Weekly')
			{
				$row.find(".fc-list-item-title span").text(item.When.Summary);
			}
			
			$row.appendTo($tableBody);
			$row.data("item",item);
			$row.click(function(){
			
				$("#eventDetailBody").empty();
				var item = $(this).data("item");
				var $div = $("#eventDetailBody");
				renderMeetup(item, $div);
				
				//$('#eventDetail .modal-title').text(item.Title);
				$('#eventDetail').modal();
				
				return false;
			
			
			
		});
	}
}
}

