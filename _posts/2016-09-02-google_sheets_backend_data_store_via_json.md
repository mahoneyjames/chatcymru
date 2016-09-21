---
title: Using Google sheets as a backend data store for a dynamic web page
layout: post
tags:
- cymraeg
---

I was after a _simple_ way to curate a list of nearby Welsh practice meeting groups and have that information displayed on a web page. A Google spreadsheet seemed an good starting point because it's a spreadsheet hosted by Google that other people can help keep up to date. 

[Here's the sheet (in case you're in the area, want to practise your Welsh, and you like your data tabular)](https://docs.google.com/spreadsheets/d/1zzhf4SebQ5IIU1PfrrAzh1d0Q2ZLDaesN-cQ2Ux0bwA)

Displaying the data on a web page can be as simple as some Javascript that downloads the data and renders it in whatever fashion makes sense e.g. a simple list, or plotting the meetings on a map. 

## Getting the data out of Google

There's a JSON based API you can use, but it's reported to be a somewhat clunky and fiddly JSON format. Plus, I'd one day like to have all this data accessible via a clean API, rather than being tied to whatever Google happen to be using. 

This is the method I picked
 - Publish the spreadsheet as CSV. 
    - This provides a public URL that mirrors the spreadsheet rows and columns as CSV
	
 - Use an Azure web job to download the data, convert it to a simple JSON format and then save it to an Azure BLOB
 
```json
[
  {
    "Area": "Newport",
    "Title": "Cwtch on a Saturday",
    "Notes": "",
    "Where": "Stow Hill, Handpost, Newport",
    "Postcode": "NP20 4HA",
    "When": "Every Saturday, 1000-1200"
  },
  {
    "Area": "Newport",
    "Title": "The Upper Cock - SSiW",
    "Notes": "",
    "Where": "The Upper Cock, The Hwy, Cwmbran",
    "Postcode": "NP44 2HE",
    "When": "Every Tuesday, 1900-2100"
  }
]
```
 
 - Download the BLOB from my web page, parse the JSON and then render it in some way 

```javascript

$( document ).ready(function() {
  $.get('https://chatdirectory.blob.core.windows.net/simpleapi/newport/meetups.json', null,showMeetups);
});

function showMeetups(data)
{
  $("#dynamic").empty();
  
  $json = $.parseJSON(data);
  $.each($json, function(i,item){
  
  $("#dynamic").append("<h1>" + item.Title + "</h1>");
  $("#dynamic").append("<p>" + item.Where + " " + item.Postcode + "</p>");
  $("#dynamic").append("<p>" + item.When + "</p>");
  $("#dynamic").append("<p>" + item.Notes + "</p>");
	
  });
}
```
 - Configure CORS for the Azure Storage account
 
   - By default you can't simply download a BLOB from any old web page. You'll probably see this error: No 'Access-Control-Allow-Origin' header is present on the requested resource
   
   - Fortunately Azure storage accounts [support CORS](https://msdn.microsoft.com/en-us/library/azure/dn535601.aspx), meaning that it's a simple matter to fix this. 
   
   - The easiest way I found to configure CORS was to use the [Azure Storage Explorer](http://storageexplorer.com/) - find the container your BLOBs will live in, right click and choose the "Configure CORS Settings" option
 
 - See it in action 
 
    - [Newport meetups](/welsh/newport_meetups.html)
	
## References

 - Turn a CSV file into an array of .NET objects in a single line of code

    - [https://joshclose.github.io/CsvHelper/](https://joshclose.github.io/CsvHelper/)
	
 - A PHP based blog post on the same topic (with useful screenshots)
 
    - [http://www.ravelrumba.com/blog/json-google-spreadsheets/](http://www.ravelrumba.com/blog/json-google-spreadsheets/)
	
 - How to download a specific worksheet via CSV

   - [https://adamlofting.com/1098/new-google-sheets-publishing-a-single-worksheet-to-the-web-as-csv/](https://adamlofting.com/1098/new-google-sheets-publishing-a-single-worksheet-to-the-web-as-csv/) 
