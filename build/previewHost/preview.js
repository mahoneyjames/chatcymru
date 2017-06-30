
const express = require('express');
const path = require('path');
const helpers = require('./_previewHelpers');

const app = express();

console.log(__dirname);
app.use(express.static(path.join(__dirname, '../_generated')));

app.set('port', process.env.PORT || 7777);
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too
console.log(developmentErrors);
app.use(developmentErrors);
console.log("here");
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});


function developmentErrors  (err, req, res, next) {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails) // Ajax call, send JSON back
  });
};
