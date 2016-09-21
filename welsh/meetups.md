---
layout: meetups
title: Meetups in Newport and the surrounding area
---

<script src="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.0.0/fullcalendar.min.js" crossorigin="anonymous"></script>

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.0.0/fullcalendar.min.css"/>

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.0.0/fullcalendar.print.css" media="print"/>

<script src="common.js"></script>
<script src="meetups.js"></script>


<style>

	body {
		margin: 40px 10px;
		padding: 0;
		font-family: "Lucida Grande",Helvetica,Arial,Verdana,sans-serif;
		font-size: 14px;
	}

	#calendar {
		max-width: 900px;
		margin: 0 auto;
	}
	
	.eventTitle
	{ cursor: pointer; cursor: hand; }

</style>


<div id="eventDetail" class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Meetup details</h4>
      </div>
      <div class="modal-body" id="eventDetailBody">
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<div class="alert alert-warning" role="alert">
	<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
	<strong>Work in progress!</strong> This site is a work in progress. <a href="about.html">Learn more</a>
</div>


 <!-- Nav tabs -->
<ul class="nav nav-tabs" id="tabStrip" role="tablist">
	<li role="presentation" class="active"><a href="#list" aria-controls="list" role="tab" data-toggle="tab">List</a></li>
	<li role="presentation"><a href="#calendar" aria-controls="calendar" role="tab" data-toggle="tab">Calendar</a></li>    
</ul>

  <!-- Tab panes -->
<div class="tab-content">    
    <div role="tabpanel" class="tab-pane active" id="list">
		<div id="listContent">
			<!--div id="filtersMeetupList"/-->
			<div  class="fc fc-unthemed fc-ltr">
		
				<div class="fc-view-container" style="">
					<div class="fc-view fc-listWeek-view fc-list-view fc-widget-content">
						<table id="eventsTable" class="fc-list-table">
							<tbody>
							</tbody>
						</table>			
				</div>
			</div>
		</div>
	</div>
</div>
	<div role="tabpanel" class="tab-pane" id="calendar">
		<div id="calendarContent"><span class="loading">Loading...</span></div>
	</div>
</div>

---




###### Info
<p>Feed updated: <span id="feedDate" /></p>

<script>

$( document ).ready(function() 
{
	var region = getParameterByName('region');
	var apiMode = getParameterByName('apimode');
	
	if(region!=null)
	{
		navBar_highlightregion(region);		
		getJson(region, showMeetupsByDay,apiMode);
	}
	else
	{
		$("#dynamic").empty();
		$("#dynamic").append("<div class='alert alert-danger'>Please pick a region from the navigation bar</div>");
	}
	
	setupTabs();
});

function setupTabs()
{

	$('#tabStrip a[href="#list"]').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
	  
	});
	$('#tabStrip a[href="#calendar"]').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
	  showCalendar($jsonData);
	  
	});
	
}




</script>
