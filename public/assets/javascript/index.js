// global bootbox
$(document).ready(function () {
    // Setting a reference to the article-container dic where all the dynamic content will go 
    // adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // Once the page is ready, run the initPage function to kick things off
    initPage();

    function initPage() {
        // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
            .then(function (data) {
                if (data && data.length) {
                    renderArticles(data);
                }
                else {
                    // otherwise render a message explaining we have no articles
                    renderEmpty();
                }
            });
    }

    function renderArticles(articles) {
        // this function handles appending HTML containing our article data to the page
        // we are passed an array of JSON containing all available articles in our database
        var articlePanels = [];
        // we pass each article JSON object to the createPanel function which returns bootstrap
        // panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        // once we have all of the HTML for the articles stored in our articlePanels array,
        // append them to the articlePanels Container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        // this function takes in a single JSON object for an article/headling 
        // it constructs a jquery element containing all of the formatted HTML for the
        // article panel
        var panel =
            $(["<div class='panel panel-default'>",
                "<div class='panel-heading'>",
                "<h3>",
                article.headline,
                "<a class='btn btn-success save'>",
                "Save Article",
                "</a>",
                "</h3>",
                "</div>",
                "<div class='panel-body'>",
                article.summary,
                "</div>",
                "</div"
            ].join(""));
        // we attach the articles ID to the jquery element
        // we will use this when trying to figure out which article the user wants to save
        panel.data("_id", article._id);
        // We return the constructed panel jquery element
        return panel;
    }

    function renderEmpty() {
        // this function renders some HTML to the page explaining we dont have any articles to view
        // using a joined array of HTML string data because its easier to read/chage than a concatenated string
        var emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Uh oh. Looks like we don't have any new articles.</h4>",
                "</div>",
                "<div class='panel panel-default'>",
                "<div class='panel-heading text-center'>",
                "<h3>What would you like to do?</h3>",
                "</div>",
                "<div class='panel-body text-center'>",
                "<h4><a class='scrape-new'>Try scraping new articles</a></h4>",
                "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
                "</div>",
                "</div>"
            ].join(""));
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function handleArticleSave() {
        // this function is triggered when the user wants to save an article
        // when we rendered the article initially, we attached a javascript object containing the headling id
        // to the element using the .data method. Here we retrieve that.
        var articleToSave = $(this).parents(".panel").data();
        articleToSave.saved = true;
        // using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PATCH",
            url: "/api/headlines",
            data: articleToSave
        })
            .then(function (data) {
                // If successful, mongoose will send back an object containing a key of "ok" with the value of 1
                // (which casts to "true")
                if (data.ok) {
                    initPage();
                }
            });
    }

    function handleArticleScrape() {
        $.get("/api/fetch")
            .then(function (data) {
                // jif we are able to successfully scrape the NYTIMES and compare the articles to those
                // already in our collection, re render the articles on the page
                // and let the user know how many unique articles we were able to save
                initPage();
                bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "</h3>");
            });
    }
});