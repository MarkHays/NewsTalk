// global bootbox
$(document).ready(function () {
    // Setting a reference to the article-container dic where all the dynamic content will go 
    // adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    // Once the page is ready, run the initPage function to kick things off
    initPage();

    function initPage() {
        // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function (data) {
            // If we have headlines, render them to the page
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
                "<a class='btn btn-danger delete'>",
                "Delete From Saved",
                "</a>",
                "<a class='btn btn-info notes'>Article Notes</a>",
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
                "<h3>Would you like to browse Available Articles?</h3>",
                "</div>",
                "<div class='panel-body text-center'>",
                "<h4><a href='/'>Browse Articles</a></h4>",
                "</div>",
                "</div>"
            ].join(""));
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {
        // this function handles rendering note list items to our notes modal
        // setting up an array of notes to render after finished
        // also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // if we have no notes, just display a message explaining this
            currentNote = [
                "<li class'list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            // if we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // Constructs an li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // Store the note id on the delete button for easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        //Now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        // this function is triggered when the user wants to delete an article
        // we grab the id of the article to delete from the panel element the delete button sits inside
        var articleToDelete = $(this).parents(".panel").data();

        // using a delete method here just to be semantic since we are deleting an article/headling
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id,
        })
            .then(function (data) {

                if (data.ok) {
                    initPage();
                }
            });
    }

    function handleArticleNotes() {
        // this function handles appending the notes modal and displaying our notes
        // we grab the id of the article to get notes for from the panel element the delete button sits inside
        var currentArticle = $(this).parents(".panel").data();
        // grab any notes with this headling article id
        $.get("/api/notes/" + currentArticle._id).then(function (data) {
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes for Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='NewNote' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // adding some info about the article and article notes to the save button for easy access
            // when trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
            renderNotesList(noteData);
        });

    }

    function handleNoteSave() {
        // this function handles what happens when a user tries to save a new note for an article
        // setting a variable to hold some formatted data about our note,
        // grabbing the note typed into the input box
        var noteData;
        var NewNote = $(".bootbot-body textarea").val().trim();
        // if we actually have data typed into the note input field, format it
        // and post it to the "/api/notes" route and send the formatted noteDate as well
        if (NewNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteTextL NewNote
            };
            $.post("/api/notes", noteData).then(function () {
                // when complete close the modal 
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        // this function handles the deletion of notes
        // first we grab the id of the note we want to delete
        // we stored this data on the delete button when we created it
        var noteToDelete = $(this).data("_id");
        // perform a DELETE request "/api/notes" with the id of the note we're deleting as a parameter
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function () {
            // when done, hide the modal
            bootbox.hideAll();
        });
    }
});