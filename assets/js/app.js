$(document).ready(function() {
  // API
  var apiUrl = "https://api.titledb.com/v0/";
  var apiTitleIds = [];
  var apiTitles = [];
  var apiDevelopers = [];
  var titleIDPre = "00040000";
  var titleIDPost = "00";
  
  $.getJSON( apiUrl, function( data ) {
    
    $.each( data, function( key, value ) {
      // console.log(value.titleid);
      apiTitleIds.push(value.titleid);
      apiTitles.push(value.name);
      apiDevelopers.push(value.author);
    });
    
    $(".unusedTitleID").html(generateID());
  });
  
  $("#checkID").click(function() {
    $(".response_failed").slideUp(function() {
      $(".response_success").slideUp(function() {
        searchID($("input[name='checkTitleID']").val());
      });
    });
  });
  
  $("#reloadTitleID").click(function() {
    $(".unusedTitleID").html(generateID());
  });
  
  function generateID() {
    var randomID = titleIDPre + Math.random().toString(36).replace(/[^a-f1-9]+/g, '').substr(0, 2) + pad(Math.random().toString(36).replace(/[^a-f0-9]+/g, '').substr(0, 4), 4) + titleIDPost;
    
    if($.inArray(randomID, apiTitleIds) > -1) {
      // Found Id
      generateID();
    } else {
      return randomID;
    }
  }
  function searchID(titleID) {
    
    if($.inArray(titleID, apiTitleIds) > -1) {
      // Found Id
      $(".foundAppTitle").html(apiTitles[$.inArray(titleID, apiTitleIds)]);
      $(".foundAppDev").html(apiDevelopers[$.inArray(titleID, apiTitleIds)]);
      $(".foundAppImage").attr("src", "https://api.titledb.com/images/" + titleID + ".png");
      
      // Show Box
      $(".response_success").slideDown();
    } else if (titleID.length === 16 
               && titleID.substring(0, 8) === "00040000"
               && titleID.substring(14) === "00"
               && parseInt(titleID.substring(8, 14)) > 0x2FF) {
      $(".response_failed").slideDown();
    } else {
      $(".response_invalid").slideDown();
    }
  }
  
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
});
