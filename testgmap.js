google.maps.event.addDomListener(window, 'load', initialize);

    function setDefault(data) {
        poopdata = data;
        // take data set and filter by date (month)
        for (var i = 0; i < poopdata.length; i++) {
            var year = poopdata[i][9].substring(0,4);
            var month = poopdata[i][9].substring(5,7);
            var yearMonth = year + month;
            months[yearMonth].push(poopdata[i]);
        }
        // replace space or slash with dash and make string lowercase
        function processString(string) {
            if (string.indexOf('/') > 0 || string.indexOf(' ') > 0) {
                string = string.replace('/', '-');
                string = string.replace(/\s+/g, '-');
            }
            string = string.toLowerCase();
            return string;
        }
        // create object with neighborhoods as keys, values as []
        for (var j = 0; j < poopdata.length; j++) {
            if (poopdata[j][19] !== null) {
                var neigh = processString(poopdata[j][19]);
                neighborhoods[neigh] = [];
            }
        }
        // take data set and filter by neighborhood
        for (var k = 0; k < poopdata.length; k++) {
            if (poopdata[k][19] !== null) {
                var neighborhood = processString(poopdata[k][19]);
                neighborhoods[neighborhood].push(poopdata[k]);
            }
        }
        addHeatMap();
    }

    // create markers and assign them to map, add infowindow on hover
    function createMarkers(latlng, content) {
        var marker = new google.maps.Marker({
            map: map,
            position: latlng,
            icon: 'img/JJ-jeff-poo.png'
        });
        markers.push(marker);
        var info = document.createElement('div');
        info.innerHTML = content;
        infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'mouseover', function() {
            infowindow.setContent(info);
            infowindow.open(map, this);
        });
    }

    // set all markers from markers array on map
    function setAllMap(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Deletes all markers on map and in markers array
    function deleteMarkers() {
        if (searchMarker !== undefined) {
            searchMarker.setMap(null);
        }
        setAllMap(null);
        markers = [];
    }

    // create latlng, then making markers from there
    function makeLatLng(dataset) {
        for (var i = 0; i < dataset.length; i++) {
            content = dataset[i][13];
            newLatLng = new google.maps.LatLng(dataset[i][21][1],dataset[i][21][2]);
            createMarkers(newLatLng, content);
        }
    }

    // set up heat map of all data as default behavior
    function addHeatMap() {
        for (var i = 0; i < poopdata.length; i++) {
            heatLatLng = new google.maps.LatLng(poopdata[i][21][1],poopdata[i][21][2]);
            poopheat.push(heatLatLng);
        }
        var heatPoopArray = new google.maps.MVCArray(poopheat);
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatPoopArray,
            map: map,
            radius: 25,
            opacity: 0.95,
            gradient: heatGradient
        });
        $('#heat-map').addClass('active');
    }

    // turn the heat map on or off and set it to active or not active button
    function toggleHeatmap() {
        deleteMarkers();
        var heatMapButton = $('#heat-map');
        heatmap.setMap(heatmap.getMap() ? null : map);
        if (heatMapButton.hasClass('active')) {
            heatMapButton.removeClass('active');
        }
        else {
            $('.top-bar-section li').removeClass('active');
            heatMapButton.addClass('active');
        }
    }

    // remove heat map layer from main map
    function removeHeatmap() {
        heatmap.setMap(null);
    }

    function inPoop() {
        var answer = $('#answer');
        var answerDiv = document.createElement('div');
        var address = $('#address-input').val();
        var geocoder = new google.maps.Geocoder();
        answer.hide();
        answer.empty();
        deleteMarkers();
        removeHeatmap();
        // get lat/long of address input
        geocoder.geocode({'address': address}, function(results, status) {
            var assessment;
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
                searchMarker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                });
                assessment = getDistancesAnswer(results[0].geometry.location,poopheat);
                answerDiv.innerHTML = assessment;
                answer.append(answerDiv);
                answer.show();
                makeLatLng(closePoops);
            } else {
                answerDiv.innerHTML = "Sorry, we couldn't geocode that address. Try another.";
                answer.append(answerDiv);
                answer.show();
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function getDistancesAnswer(location, data) {
        var distance;
        closePoops = [];
        // get and add distances <= 0.25mi to array
        for (var i = 0; i < data.length; i++){
            distance = google.maps.geometry.spherical.computeDistanceBetween (location, data[i]);
            distance = distance/1609.34;
            if (distance <= 0.25) {
                closePoops.push(poopdata[i]);
            }
        }
        // if there are > 100 poops within 0.25mi 
        if (closePoops.length >= 100) {
            return "Yeah, maybe... probably. Watch your step!";
        } else {
            return "Nope, probably not.";
        }
        
    }

    // heat map toggle click event
    $('#heat-map').on('click', toggleHeatmap);

    // filter by month click events
    $('.month').on('click', function() {
        var month = $(this).attr('data-month');
        $('.top-bar-section li').removeClass('active');
        $(this).addClass('active');
        deleteMarkers();
        removeHeatmap();
        makeLatLng(months[month]);
    });

    // filter by neighborhoods click events
    $('.neighborhood').on('click', function() {
        var neighborhood = $(this).attr('data-hood');
        $('.top-bar-section li').removeClass('active');
        $(this).addClass('active');
        deleteMarkers();
        removeHeatmap();
        makeLatLng(neighborhoods[neighborhood]);
    });

    // will i step in poop form click event
    $('#tell').on('click', function(e) {
        e.preventDefault();
        inPoop();
    });
});
