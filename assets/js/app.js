$(document).ready(function() {
  // API
  var apiUrl = "https://api.titledb.com/v0/";
  var nusInfoBaseUrl = "https://dantheman827.github.io/nus-info/"
  var nusInfoUrl = nusInfoBaseUrl + "titles.json";
  var nusPublishersUrl = nusInfoBaseUrl + "publishers.json";
  var loadedStatus = 0;
  var completelyLoaded = 1 | 2 | 4;
  var apiTitleIds = [];
  var eShopTitleIds = {};
  var eShopPublishers = {};
  var eShopLanguageBias = ["US", "GB", "DE", "JP", "HK", "KR"]
  var apiTitles = [];
  var apiDevelopers = [];
  var titleIDPre = "00040000";
  var titleIDPost = "00";
  
  function setLoadedBit(bit) {
    loadedStatus = loadedStatus | bit;
    
    if((loadedStatus & completelyLoaded) == completelyLoaded) {
      $(".unusedTitleID").html(generateID());
    }
  }
  
  $.getJSON( apiUrl, function( data ) {
    
    $.each( data, function( key, value ) {
      // console.log(value.titleid);
      apiTitleIds.push(value.titleid);
      apiTitles.push(value.name);
      apiDevelopers.push(value.author);
    });
    
    setLoadedBit(1);
  });

  $.getJSON( nusInfoUrl, function( data ) {
    
    $.each( data, function( key, value ) {
    	if(value.platform_device == "CTR") {
        eShopTitleIds[key] = value;
      }
    });
    
    setLoadedBit(2);
  });

  $.getJSON( nusPublishersUrl, function( data ) {
    
    eShopPublishers = data;
    
    setLoadedBit(4);
  });

  
  
  $("#checkID").click(function() {
    $(".response_failed").slideUp(function() {
      $(".response_success").slideUp(function() {
        searchID($("input[name='checkTitleID']").val().toUpperCase());
      });
    });
  });
  
  
  $("#reloadTitleID").click(function() {
    $(".unusedTitleID").html(generateID());
  });
  
  function generateID() {
    while(true) {
      var publisherID = pad(parseInt(Math.random() * 0xFF).toString(16).toUpperCase(), 2);
      var gameID = pad(parseInt(Math.random() * 0xFFFF).toString(16).toUpperCase(), 4);
      var randomID = titleIDPre + publisherID + gameID + titleIDPost;
      
      if($.inArray(randomID, apiTitleIds) == -1 && $.inArray(randomID, Object.keys(eShopTitleIds)) == -1) {
        return randomID;
      } else {
        console && console.debug && console.debug("ID " + randomID + " exists.");
      }
    }
  }
  function displayNusInfo(titleID, language) {
    $.getJSON(nusInfoBaseUrl + "titles/" + (titleID + "-" + language).toLowerCase() + ".json", function( data ) {
      // Found Id
      $(".foundAppTitle").text(data.name);
      $(".foundAppDev").text(eShopPublishers[data.publisher.toString()].name[language]);
      $(".foundAppImage").hide();
      
      // Show Box
      $(".response_success").slideDown();
    });
  }
  function searchID(titleID) {
    
    titleID = parseInt(titleID, 16).toString(16).toUpperCase();
    
    if(titleID.length <= 8) {
      
      if(titleID.length <= 6) {
        titleID = titleID + titleIDPost;
      }

      titleID = titleIDPre + pad(titleID, 8);
    }

    titleID = pad(titleID, 16);
    
    if($.inArray(titleID, apiTitleIds) > -1) {
      // Found Id
      $(".foundAppTitle").text(apiTitles[$.inArray(titleID, apiTitleIds)]);
      $(".foundAppDev").text(apiDevelopers[$.inArray(titleID, apiTitleIds)]);
      $(".foundAppImage").attr("src", "https://api.titledb.com/images/" + titleID + ".png").show();
      
      // Show Box
      $(".response_success").slideDown();

      return true;
    }

    if($.inArray(titleID, Object.keys(eShopTitleIds)) > -1) {
      var nusLanguageFound = false;
      $.each(eShopLanguageBias, function(key, language){
        if(eShopTitleIds[titleID].languages.indexOf(language) != -1) {
          nusLanguageFound = true;
          displayNusInfo(titleID, language);
          return false;
        }
      })

      if(nusLanguageFound == false) {
        displayNusInfo(titleID, eShopTitleIds[titleID].languages[Object.keys(eShopTitleIds[titleID].languages)[0]]);
      }

      return true;
    } 
    
    // Found nothing
    $(".response_failed").slideDown();
    return false;
  }
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
});
