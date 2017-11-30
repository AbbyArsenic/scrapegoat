$(function() {
  
  // Save article button ajax request
  $("button#saveArticle").on("click", function(event) {
    const thisId = $(this).parent("div").parent("div").attr("data-id");
    //console.log("thisId: " + thisId);
    
    // Send UPDATE request
    $.ajax("/save/" + thisId, {
      type: "PUT"
    }).then(
      function() {
        console.log("saved id: ", thisId);
      }
    );
  });

  // Scrape articles button ajax request
  $("#scrapeBtn").on("click", function(event) {
    $.ajax("/scrape", {
      type: "GET"
    }).then(
      function() {
        console.log("scrape button activated!");
      });
  });

  // Add note button modal

  // Save note ajax request

  // Remove note ajax request

  // Remove saved article button ajax request

});
