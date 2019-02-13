// scrape script
// ==============

// Require request and cheerio, making our scrapes possible
var request = require("request");
var cheerio = require("cheerio");

var scrape = function (cb) {
    request("http://www.nytimes.com", function(err, res, body) {

        var $ = cheerio.load(body);

        var articles = [];
        $("article").each(function (i, element) {
            var head = $(this).find("h2").text();
            var sum = $(this).find("p").text().trim();

            if (head && sum) {
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

                var dataToAdd = {
                    headline: headNeat,
                    summary: sumNeat
                };

                articles.push(dataToAdd);
            }
        });
        cb(articles);
    });
};

module.exports = scrape;