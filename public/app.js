
// Whenever someone clicks save for an article
$(document).on("click", "button#saveArticle", function() {
  // Grab the id from the parent panel div
  var thisId = $(this).parent("div").parent("div").attr("data-id");
  // Set this article to "saved"

});
