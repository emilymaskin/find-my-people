$(document).ready(function() {
  'use strict';

  var apiKey = 'b3a7fa326b8255e6af7900b7a58841e0';
  var map;

  var search = function(searchTerm) {
    $.ajax({
      url: "http://api.flickr.com/services/rest/?jsoncallback=?",
      dataType: 'jsonp',
      data: {
        method: 'flickr.tags.getRelated',
        api_key: apiKey,
        format: 'json',
        tag: searchTerm,
      },
      success: function(data) {
        var top10 = data.tags.tag.slice(0, 10);
        _getPlaces(top10);
      }
    });
  };

  var _getPlaces = function(tags) {
    for (var t in tags) {
      $.ajax({
          url: "http://api.flickr.com/services/rest/?jsoncallback=?",
          dataType: 'jsonp',
          data: {
            method: 'flickr.places.placesForTags',
            api_key: apiKey,
            format: 'json',
            tags: tags[t]._content,
            place_type_id: '22'
          },
          success: function(data) {
            var places = data.places.place;
            addHeatLayer(places);
          }
      });
    }
  };

  var addHeatLayer = function(places) {
    var mapPoints = [];
    var latitude = '';
    var longitude = '';
    var pointArray;
    var heatmap;

    for (var i = 0, count = places.length; i < count; i++) {
      latitude = places[i].latitude;
      longitude = places[i].longitude;
      mapPoints.push(new google.maps.LatLng(latitude, longitude));
    }

    pointArray = new google.maps.MVCArray(mapPoints);
    heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray,
      radius: 30
    });
    heatmap.setMap(map);
  };

  var createMap = function() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 4,
        center: new google.maps.LatLng(40, -95),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
  };

  $('form').on('submit', function(e){
    var searchTerm = $(e.currentTarget).find('input').val();

    e.preventDefault();
    search(searchTerm);
    createMap();
  });

  createMap();
});