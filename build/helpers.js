const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');
const pug = require('pug');
exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

exports.siteName='James Mahoney'; 
exports.moment = moment;

exports.friendlyDateShort = (date)=>
{
    return moment(date).format("MMM Do");
};


exports.friendlyDateLong = (date)=>
{
    return moment(date).format("MMM Do YYYY");
};
exports.fileExists = (path) =>
{
    return fs.existsSync(path);
}

exports.generatedFileExists = (path) =>
{
    return exports.fileExists(`./_generated/${path}`);
};
exports.isImage = (link)=>
{
    const extension =  link.slice(link.length-3);
    return extension==="png" || extension==="jpg";
}
exports.readFile = (sourcefile) =>
{
     const filename = `${__dirname}/${sourcefile}`;
    try
    {
        return fs.readFileSync(filename,'utf-8')
    }
    catch(err)
    {
        //TODO - really should learn about better error handling in node...
        console.log(`Failed to find file '${filename}'`);
        return `Failed to find file '${filename}'`;
    }
}

exports.ensureDirectoryExists = (directory)=>{
    const path = directory.split('/').slice(0,-1).join('/');
    mkdirp(path); 
}


exports.generateHtml = (view, outputFile, options) =>
{
    options.helpers = exports; 
    options.siteRoot = "";   
    const html = pug.renderFile(`${__dirname}/views/${view}.pug`,options);

    const fullOutputFileName =`./_generated/${outputFile}.htm`;    
    exports.ensureDirectoryExists(fullOutputFileName);
    fs.writeFileSync(fullOutputFileName, html, 'utf-8');
}

exports.writeJson = (filename, json) =>
{
    const outputFilename = `./_generated/api/${filename}`;
    exports.ensureDirectoryExists(outputFilename);
    fs.writeFileSync(outputFilename, json, 'utf-8');
    
};
exports.sanitisePath = (path) =>
{
    return path.split(" ").join("-") + ".htm";
}



exports.generateFileHtmlFromMarkdown = (view, sourceFile, outputFile, options) =>
{
    const converter = new showdown.Converter();
    const content = frontmatter(helpers.readFile(sourceFile));
    options.body = converter.makeHtml(content.body);
    console.log(content.attributes);
    options.attributes = content.attributes;
    options.title = options.attributes.title;
    generateHtml(view, outputFile,options);

    const postDetails = {
        path: `/${outputFile}.htm`,
        title: content.attributes.title
    };

    return postDetails;

}

exports.htmlFromMarkdown = (sourceFile) =>
{

    const filecontents = helpers.readFile(sourceFile);

    return converter.makeHtml(filecontents);
}

exports.tempGroupMeetups = (list) =>
{
    return exports.groupBy(list, (item)=>item.When.Day);
}
exports.groupBy = (list, keyGetter)=> {
    const map = new Map();
    
    list.forEach((item) => {
        const key = keyGetter(item);
        
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    
    

    return Array.from(map);
}