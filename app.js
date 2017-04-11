var geoJSON = {};

$.ajax({
    url: "https://data.sfgov.org/resource/h3eg-w3pj.json",
    type: "GET",
    data: {
      "$limit" : 500,
      "$$app_token" : "WbXWV7HW9S9kmP1ig5A9L8o5v" 
    }
}).done(function(data) {
  //console.log(data);
  var humanWasteFeatures = [];
  $.each(data, function(i) {
    var request_details = data[i].request_details;
    //console.log(request_details);
    if (request_details === "Human Waste") {
        var obj = {
        "type" : "Feature",
        "properties" : {},
        "geometry": {
          "type" : "Point",
          "coordinates" :
              [parseFloat(data[i].point.longitude), parseFloat(data[i].point.latitude)]
        }
      };
      humanWasteFeatures.push(obj);
    }
    //console.log(humanWasteFeatures);
  });

  geoJSON = {
    "type": "FeatureCollection",
    "features": humanWasteFeatures
  };
  console.log(geoJSON);
});



 

