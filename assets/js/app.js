$(document).ready(function() {
  // API
  var apiUrl = "https://api.titledb.com/v0/";
  var nusInfoBaseUrl = "https://dantheman827.github.io/nus-info/";
  var tidsURL = "https://dantheman827.github.io/3ds-tids/data.json";
  var nusInfoUrl = nusInfoBaseUrl + "titles.json";
  var nusPublishersUrl = nusInfoBaseUrl + "publishers.json";
  var loadedStatus = 0;
  var completelyLoaded = 1 | 2 | 4 | 8;
  var apiData = {};
  var eShopData = {};
  var eShopPublishers = {}
  var titleIdListData = {};
  var eShopLanguageBias = ["US", "GB", "DE", "JP", "HK", "KR"]
  var titleIDPre = "00040000";
  var titleIDPost = "00";
  var titleIDMax = 0xF7FFF;
  var titleIDMin = 0x300;
  
  function setLoadedBit(bit) {
    loadedStatus = loadedStatus | bit;
    
    if((loadedStatus & completelyLoaded) == completelyLoaded) {
      $(".unusedTitleID").html(generateID());
    }
  }
  
  $.getJSON( apiUrl, function( data ) {
    
    $.each( data, function( key, value ) {
      // console.log(value.titleid);
      apiData[value.titleid] = value;
    });
    
    setLoadedBit(1);

  });

  $.getJSON( nusInfoUrl, function( data ) {
    
    $.each( data, function( key, value ) {
    	if(value.platform_device == "CTR") {
        eShopData[key] = value;
      }
    });
    console.log(Object.keys(eShopData));
    setLoadedBit(2);
  });

  $.getJSON( nusPublishersUrl, function( data ) {
    
    eShopPublishers = data;
    
    setLoadedBit(4);
  });
  
  $.getJSON( tidsURL, function( data ) {
    
    $.each( data, function( key, value ) {
      // console.log(value.titleid);
      value.titleid = unshortenTitleID(value.titleid);
      titleIdListData[value.titleid] = value;
    });
    
    setLoadedBit(8);
  });
  
  $("#checkID").click(function() {
    $(".response").slideUp().promise().done(function() {
      searchID($("input[name='checkTitleID']").val().toUpperCase());
    });
  });
  
  $("#reloadTitleID").click(function() {
    $(".unusedTitleID").html(generateID());
  });
  
  function generateID() {
    while(true) {
      var gameID = pad(parseInt(Math.random() * (titleIDMax - titleIDMin + 1) + titleIDMin).toString(16).toUpperCase(), 6);
      var randomID = titleIDPre + gameID + titleIDPost;
      
      if(Object.keys(apiData).indexOf(randomID) == -1 && Object.keys(eShopData).indexOf(randomID) == -1) {
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
      if($(".response_success").is(":hidden"))
        $(".response_success").slideDown();
    });
  }

  function unshortenTitleID(titleID){
    var capture = titleID.match(/([a-f0-9]+)\s*$/i);
    
    if(!capture) {
      return "";
    }
    
    titleID = capture[1];
    
    if(titleID.length <= 8) {
      
      if(titleID.length <= 6) {
        titleID = titleID + titleIDPost;
      }

      titleID = titleIDPre + pad(titleID, 8);
    }

    titleID = pad(titleID, 16);
    return titleID;
  }
  function searchID(titleID) {
    
    titleID = unshortenTitleID(titleID);
    
    console.debug(titleID);
    
    if(Object.keys(eShopData).indexOf(titleID) != -1) {
      var nusLanguageFound = false;
      $.each(eShopLanguageBias, function(key, language){
        if(eShopData[titleID].languages.indexOf(language) != -1) {
          nusLanguageFound = true;
          displayNusInfo(titleID, language);
          return false;
        }
      })

      if(nusLanguageFound == false) {
        displayNusInfo(titleID, eShopData[titleID].languages[Object.keys(eShopData[titleID].languages)[0]]);
      }

      return true;
    }
    
    if(Object.keys(apiData).indexOf(titleID) != -1) {
      // Found Id
      $(".foundAppTitle").text(apiData[titleID].name);
      $(".foundAppDev").text(apiData[titleID].author);
      $(".foundAppImage").attr("src", "https://api.titledb.com/images/" + titleID + ".png").show();
      
      // Show Box
      if($(".response_success").is(":hidden"))
        $(".response_success").slideDown();

      return true;
    }

    if(Object.keys(titleIdListData).indexOf(titleID) != -1) {
      // Found Id
      $(".foundAppTitle").text(titleIdListData[titleID].name);
      $(".foundAppDev").text(titleIdListData[titleID].author);
      $(".foundAppImage").hide();
      
      // Show Box
      if($(".response_success").is(":hidden"))
        $(".response_success").slideDown();

      return true;
    }
    
    if (!(titleID.length === 16 
               && titleID.substring(0, 8) === "00040000"
               && titleID.substring(14) === "00"
               && parseInt(titleID.substring(8, 14), 16) >= titleIDMin
               && parseInt(titleID.substring(8, 14), 16) <= titleIDMax)) {
      
      if($(".response_invalid").is(":hidden"))
        $(".response_invalid").slideDown();
      return null;
    }
    
    // Found nothing
    if($(".response_failed").is(":hidden"))
      $(".response_failed").slideDown();
    return false;
  }
  
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
});
