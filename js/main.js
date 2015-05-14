/* global google */

var Tag = function(searchTerm) {
  this.apiKey = 'b3a7fa326b8255e6af7900b7a58841e0';
  this.searchTerm = searchTerm;
};

Tag.prototype.getRelated = function() {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.tags.getRelated',
      api_key: this.apiKey,
      format: 'json',
      tag: this.searchTerm,
    },
    context: this,
    success: function(data) {
      var tagData = data.tags.tag.slice(0, 20);
      var tagNames = [];

      for (var t in tagData) {
        tagNames.push(tagData[t]._content);
      }
      this.getPlaces(tagNames);
    }
  });
};

Tag.prototype.getPlaces = function(tags) {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.places.placesForTags',
      api_key: this.apiKey,
      format: 'json',
      tags: tags.join(','),
      place_type_id: '22'
    },
    success: function(data) {
      var map = new Map();
      var places = data.places.place;

      map.addHeatLayer(places);
    }
  });
};

var Map = function() {
  this.heatmap = null;
  this.map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 3,
      center: new google.maps.LatLng(40, -95),
      mapTypeId: google.maps.MapTypeId.SATELLITE
  });
};

Map.prototype.getMapPoints = function(places) {
  var mapPoints = [];
  var latitude = '';
  var longitude = '';

  for (var i = 0, count = places.length; i < count; i++) {
    latitude = places[i].latitude;
    longitude = places[i].longitude;
    mapPoints.push(new google.maps.LatLng(latitude, longitude));
  }
  return new google.maps.MVCArray(mapPoints);
};

Map.prototype.addHeatLayer = function(places) {
  var mapPoints = this.getMapPoints(places);

  this.heatmap = new google.maps.visualization.HeatmapLayer({
    data: mapPoints,
    radius: 30
  });
  this.heatmap.setMap(this.map);
};

$(document).ready(function() {
  'use strict';

  $('form').on('submit', function(e){
    var searchTerm = $(e.currentTarget).find('input').val();
    var tag = new Tag(searchTerm);

    e.preventDefault();
    tag.getRelated();
  });
});