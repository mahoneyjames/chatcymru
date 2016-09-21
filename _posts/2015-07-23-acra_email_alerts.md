---
title: Email alerts with ACRA
layout: post
tags:
- android
---

For capturing errors in an Android app, [ACRA](https://github.com/ACRA/acra) is great. 

>ACRA catches the error, turns it into JSON and then persists that data on a web server using the *[acra-storage](https://github.com/ACRA/acra-storage)* CouchDB app. The *[acralyzer](https://github.com/ACRA/acralyzer)* CouchDB HTML app provides a nice front end to view error information. 

One thing it lacks is a mechanism to notify about new errors via email, but what it does have is an RSS feed of the latest errors that have been uploaded. Combine this with a script executed every few minutes and you have a simple alerting system. 

#### Enter....[Google App Scripts](https://developers.google.com/apps-script/). 

Think of this as a Javascript environment hosted by Google. It was designed to add scripting capabilities to Google documents and spreadsheets, but since it includes a timer based trigger for executing scripts it can be used to provide a hosted alerting system

There's nothing much to the script

1. Download the RSS feed
2. Work through the items until we find the first one that we've sent already, or we reach the end
3. Add the details of any unset items to an email
4. Send the email
5. Make a note of the guid of the first error item we included in the email, so that next time the script runs we know where to stop including items


##Acralyzer RSS feed
This is the structure of the URL you need

> https://server/CouchDB/_design/acra-storage/_list/rss/recent-items?descending=true

###RSS XML Example
{% highlight xml %}
<rss version="0.91">
	<channel>
		<title> latest Crash Reports</title>
		<link>http://username.cloudant.com/acralyzer/_design/acralyzer/index.html#/dashboard/type</link>
		<description>Acralyzer latest crash reports.</description>
		<item>
			<title>java.lang.NullPointerException: This is a test exception to test logging : SupportSettingsActivity.java:79</title>
			<link>http://username.cloudant.com/acralyzer/_design/acralyzer/index.html#/report-details/type/36242529-580c-4703-bfab-d42dac5e4a06</link>
			<description>
				<p>app_version: 1.0.14</p><p>android_version: 4.2.2</p>
				<p>device: samsung samsung GT-S7580</p>
				<p>crash line: java.lang.NullPointerException: This is a test exception to test logging at ....</p>
			</description>
			<guid>36242529-580c-4703-bfab-d42dac5e4a06</guid>
			<pubDate>2015-07-23T15:17:32.000Z</pubDate>
		</item>
	</channel>
</rss>
{% endhighlight %}
###Authentication using Cloudant
>Cloudant provides hosting of CouchDB apps. It's a common choice when setting up *acra-storage* because their free plans are pretty generous.

Cloudant handles authentication with a username and what they term an "API Key". (Or, username and password...)

When calling the RSS feed you need to supply the details of a user that has been granted **read** access to your *acra-storage* instance. 

See this link for information

> <a href="https://docs.cloudant.com/authentication.html" target="_blank">https://docs.cloudant.com/authentication.html</a>

You need to supply your username and API key via a HTTP Header called "Authorization"

More usefully, here's how to do it using our script

{% highlight javascript %}
var options =
{
    "headers": 
    {
	  "Authorization":"Basic c2F5c29tZljI=="
    }
};

var xml = UrlFetchApp.fetch(sourceRssUrl, options).getContentText();

{% endhighlight %}

####Base64 encoding your username and password
The simplest way to get this is to use a HTTP Proxy (e.g. Fiddler) and then access your *acralyzer* front end in your browser. Sign in with the user you're going to use for script. Once signed in you can inspect the headers and grab the Base64 encoded details. 

##Parsing the XML
{% highlight javascript %}

//Use the XmlService to parse the XML
var document = XmlService.parse(xml);

var root = document.getRootElement();

//get the <channel> element  
var xChannel = root.getChild("channel");

//There's not much more to it than that.

{% endhighlight %}

###Tracking the most recently sent guid
You can use the PropertiesService to persist data across script runs. Think of this as name/value pairs linked to your Google account. 

{% highlight javascript %}

var userProperties = PropertiesService.getUserProperties();

//get a property
var lastDocumentId = userProperties.getProperty("somekey");

//save a property
userProperties.setProperty("somekey","somevalue");

{% endhighlight %}

  
####Sending an email
Google makes this easy for us

{% highlight javascript %}
MailApp.sendEmail("bob@gmail.com", title, emailBody);
{% endhighlight %}


##Set the script up in Google App Script

> These instructions were correct at the time of writing, but we all know Google's penchant for releasing often...

 1. In Google Drive click on the big red button labeled "New", choose "More" and then "Google Apps Script"
 
 2. From the dialog that pops up, go ahead and choose "Blank project"
 
 3. Give the project a suitable name and save it
 
 4. Copy the [script](#fullScript) into the code editor and save it
 
      > Now you need to manually run your function for the first time. This is important because it's how you grant any permissions your script needs

 5. There's a drop down that says "select function" in the toolbar. This contains a list of all functions in your script. Select the function "sendAlerts" then click the play button

    - You will be prompted that authorisation is required. Go ahead and set up any permissions the script needs

    - When the script starts you'll see a little tooltip like popup near the top of the window. 
 
    - If everything has gone to plan, that's all you'll see. Assuming you've got some errors in your acra-storage database you should receive an email

 6. The final step is to schedule your script to run. Click on the project triggers icon in the toolbar, and away you go
 
###If your script fails to run...
You'll see a red tooltip like popup inviting you to view details of the failure

The View menu also has a couple of options to help with debugging - the Execution Transcript and Logs

Logs - This is what you've explicitly written via a call to Logger.Log

Execution transcripts - this is the logs, plus diagnostic information that the execution engine generates

### Errors that tripped me up

#### 502 Bad Gateway

I got this when my Base64 user credentials were incorrect i.e. Cloudant couldn't even begin to work out the username I was trying to use

## <a name="fullScript">Full script</a>

{% highlight javascript %}
function sendAlerts()
{
  var recipientEmail=null;
  var acraServerName="username.cloudant.com";
  var acraDatabaseName="acra-storage";
  var cloudantCredentials =null;
 
  
  processAcraErrors(recipientEmail,acraServerName,acraDatabaseName, cloudantCredentials);
  
}

function processAcraErrors(recipientEmail,acraServerName,acraDatabaseName,cloudantCredentials)
{

  if(recipientEmail==null)
  {
    throw new Error("recipientEmail is null");
  }

  if(cloudantCredentials==null)
  {
    throw new Error("cloudantCredentials is null");
  }
  
  var userProperties = PropertiesService.getUserProperties();
  
  var lastNotificationKey = acraDatabaseName + "_lastNotificationDocumentId";
  
  var lastDocumentId = userProperties.getProperty(lastNotificationKey);
  
  Logger.log("last key=" + lastDocumentId);
  

  var sourceRssUrl = "https://xServerNamex/xDatabaseNamex/_design/acra-storage/_list/rss/recent-items?descending=true";
  sourceRssUrl = sourceRssUrl.replace("xServerNamex", acraServerName);
  sourceRssUrl = sourceRssUrl.replace("xDatabaseNamex", acraDatabaseName);
  
  Logger.log("URL:" + sourceRssUrl);
   
  var options = 
  {
      "headers": {
        "Authorization":"Basic " + cloudantCredentials
        }
  };
  
 
  var xml = UrlFetchApp.fetch(sourceRssUrl, options).getContentText();
   
  //Need to escape fake XML tags that are included in some error details
  var regEx = new RegExp("<unknown>",'g');
  xml = xml.replace(regEx,"[unknown]");
  
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  var xChannel = root.getChild("channel");
  var title = null;
  var link = null;
  
  if(xChannel!=null)
  {

    
    title = xChannel.getChild("title");
    if(title!=null)
    {
      title = title.getText();
    }
    
    link = xChannel.getChild("link");
    if(link!=null)
    {
      link = link.getText();
    }
    
    Logger.log("title:" + title);
    Logger.log("link:" + link);
    
    
    var lastItemSendIndex = -1;
    
    //grab an array of all the <item> elements in the RSS feed
    var items = xChannel.getChildren("item");
    
    //Work through it, looking for an element that has a <guid> 
    //which matches the <guid> we saved the last time the script ran.
    //This gives us the point in the list at which to stop including
    //error details
    for(var index=0;index<items.length; index++)
    {
      var itemGuid = items[index].getChild("guid").getText();
      
      if(itemGuid==lastDocumentId)
      {
        lastItemSendIndex = index;
        break;
      }
    
    }
    
    
    Logger.log("last index:" + lastItemSendIndex);
    
    if(lastItemSendIndex==-1)
    {
      //We have never sent alerts for any of our items...
      lastItemSendIndex = items.length;
    }
    
    
    //Now we can build our sophisticated email content
    var emailBody = "";
    
    for(var index=0; index<lastItemSendIndex;index++)
    {
      emailBody +="----------------------------------\n";
      emailBody+=items[index].getChild("title").getText() + "\n";
      emailBody+=items[index].getChild("pubDate").getText() + "\n";
      emailBody+=items[index].getChild("link").getText() + "\n";
      emailBody+="\n";
    }
    
    Logger.log(emailBody);
    
    if(emailBody!="")
    {
    
      emailBody = "Recent errors:\n\n" + emailBody;
    
      MailApp.sendEmail(recipientEmail, title, emailBody);
      
      if(items.length>0)
      {
        //Save the <guid> of the first <item>. New <item>
        //elements will appear above it in the array, meaning
        //that the next time the scripts runs we should include 
        //items between position 0 and wherever our <guid> ends up
        //in that future list
        lastDocumentId = items[0].getChild("guid").getText();
        userProperties.setProperty(lastNotificationKey,lastDocumentId);
      }
    }
    else
    {
      Logger.log("Nothing to send");
    }  
  }  
}
{% endhighlight %}