const fs = require('fs');
const path = require('path');
const showdown = require('showdown');
const jfile = require('jfile');
const frontmatter = require('front-matter');
const axios = require('axios'); 
const moment = require('moment');           
const helpers = require('./helpers');
           
const regions = [{id:"south-east", title: "South East"}, {id: "cardiff", title: "Cardiff"}];




for(var index in regions)
{    
    
    processRegion(regions[index]);
}
function sanitisePath(path)
{
    return path.split(" ").join("-") + ".htm";
}
function processRegion(region)
{
    console.log(`https://chatdirectory.blob.core.windows.net/simpleapi/${region.id}/meetups.json`);
   axios.get(`https://chatdirectory.blob.core.windows.net/simpleapi/${region.id}/meetups.json`)
    .then(function(res){
        console.log(region);

        helpers.writeJson(`${region.id}.json`, JSON.stringify(res.data.Items));
        
        const meetupPrefix = `/meetups/${region.id}/`;
       
        for(var i in res.data.Items)
        {  
            const item = res.data.Items[i];
            let filename = sanitisePath(`${meetupPrefix}${item.Title}`);

            if(helpers.generatedFileExists(filename))
            {
                filename = sanitisePath(`${meetupPrefix}${item.Title}-${item.Area}`);
                if(helpers.generatedFileExists(filename))
                {
                    console.log(`${filename} already exists. Think of a better way to make these unique...`);
                } 
            }  
 
console.log(filename);
            item.path=filename;

            helpers.generateHtml("meetup",filename.slice(0, filename.length-4), {region, regions, meetup:item});

        }
         var  sevenDaysAgo = moment().add(-7,'days');
        const oneOffMeetups = res.data.Items.filter(item=>item.When.Repeats==="OneOff"
                                                //ignore any one off meetings older than 7 days 
                                                && moment(item.When.Upcoming[0].When).isAfter(sevenDaysAgo))
                                            .sort((a,b)=> moment(a.When.Upcoming[0].When).isAfter(moment(b.When.Upcoming[0].When)) ? 1: -1) ;

        const oneOffMeetupsByDate = helpers.groupBy(oneOffMeetups, (item)=>item.When.Upcoming[0].When);

                                                        
        const regularMeetups = res.data.Items.filter(item=>item.When.Repeats!="OneOff");

        const meetupsByDay = helpers.tempGroupMeetups(regularMeetups);
        

        helpers.generateHtml("region_index", `/regions/${region.id}/index`, {regions, region, meetups: res.data.Items, oneOffMeetupsByDate, meetupsByDay});        
        helpers.generateHtml("region_oneoff", `/regions/${region.id}/oneoff`, {regions, region, meetups: res.data.Items, oneOffMeetupsByDate, meetupsByDay});
        helpers.generateHtml("region_upcoming", `/regions/${region.id}/upcoming`, {regions, region, meetups: res.data.Items, oneOffMeetupsByDate, meetupsByDay});
    });

    helpers.generateHtml("index", "index", {regions, region:null});
    const changes = require('./changelog.json');
    helpers.generateHtml("about", "about", {regions, region:null, changes});
    helpers.generateHtml("contact", "contact", {regions, region:null});

}
