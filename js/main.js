$(document).ready(function() {

  'use strict';

  var search = function(searchTerm) {

    $.ajax({
        url: "http://api.flickr.com/services/rest/?jsoncallback=?",
        dataType: 'jsonp',
        data: {
          method: 'flickr.places.placesForTags',
          api_key: 'b3a7fa326b8255e6af7900b7a58841e0',
          format: 'json',
          tags: searchTerm,
          place_type_id: '22'
        },
        success: function(data) {
          var count = data.places.place.length;
          var $imgEl;
          var latitude = '';
          var longitude = '';
          var mapPoints = [];

          for (var i = 0; i < count; i++) {
            latitude = data.places.place[i].latitude;
            longitude = data.places.place[i].longitude;
            mapPoints.push(new google.maps.LatLng(latitude, longitude));
          }
          createMap(mapPoints);
        }
    });
  };

  var createMap = function(mapPoints) {
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 10,
        center: new google.maps.LatLng(40.711733, -74.008924),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    var pointArray = new google.maps.MVCArray(mapPoints);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray
    });

    heatmap.setMap(map);
  };

  $('form').on('submit', function(e){
    var searchTerm = $(e.currentTarget).find('input').val();

    e.preventDefault();
    search(searchTerm);
  });
});