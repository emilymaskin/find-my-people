/* global google */

var Tag = function(searchTerm) {
  this.apiKey = 'b3a7fa326b8255e6af7900b7a58841e0';
  this.searchTerm = searchTerm;
};

Tag.prototype.getPlaces = function(callback) {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.places.placesForTags',
      api_key: this.apiKey,
      format: 'json',
      tags: this.searchTerm,
      place_type_id: '22'
    },
    success: function(data) {
      var places = data.places.place;
      if (typeof callback !== 'undefined') {
        callback(places);
      }
    }
  });
};

Tag.prototype.getPhotos = function(latitude, longitude, map) {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.photos.search',
      api_key: this.apiKey,
      format: 'json',
      tags: this.searchTerm,
      per_page: 1,
      lat: latitude,
      lon: longitude,
      extras: 'url_sq'
    },
    success: function(data) {
      if (data.photos.photo.length) {
        var src = data.photos.photo[0].url_sq;
        var contentString = '<img src="' + src + '" alt="">';
        var latLngObj = new google.maps.LatLng(latitude, longitude);
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: latLngObj,
            map: map,
            title: 'test'
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map, marker);
        });
      }
    }
  });
};

var Map = function(latitude, longitude) {
  this.startingLatitude = latitude;
  this.startingLongitude = longitude;
  this.map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 3,
      center: new google.maps.LatLng(this.startingLatitude, this.startingLongitude),
      mapTypeId: google.maps.MapTypeId.SATELLITE
  });
  this.mapPoints = [];
  this.latLngObjArray = [];
};

Map.prototype.getMapPoints = function(places) {
  var latitude = '';
  var longitude = '';
  var latLngObj;

  for (var i = 0, count = places.length; i < count; i++) {
    latitude = places[i].latitude;
    longitude = places[i].longitude;
    this.mapPoints.push({latitude: latitude, longitude: longitude});
    this.formatMapPoints(latitude, longitude);
  }
};

Map.prototype.formatMapPoints = function(latitude, longitude) {
  latLngObj = new google.maps.LatLng(latitude, longitude);
  this.latLngObjArray.push(latLngObj);
};

Map.prototype.addHeatLayer = function(tag, showPhotos) {
  var _this = this;
  tag.getPlaces(function(places) {
    _this.getMapPoints(places);

    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: _this.latLngObjArray,
      radius: 30
    });
    heatmap.setMap(_this.map);
    if (showPhotos) {
      _this.addPhotoLayer(tag);
    }
  });
};

Map.prototype.addPhotoLayer = function(tag) {
  var photoCount = this.mapPoints.length;
  var latitude = 0;
  var longitude = 0;

  $('.message').addClass('show').find('.tag_name').text(tag.searchTerm);

  for (var i = 0; i < photoCount; i++) {
    latitude = this.mapPoints[i].latitude;
    longitude = this.mapPoints[i].longitude;
    tag.getPhotos(latitude, longitude, this.map);
  }
};

$(document).ready(function() {
  $('form').on('submit', function(e){
    var searchTerm = $(e.currentTarget).find('input').val();
    var tag = new Tag(searchTerm);
    var map = new Map(40, -95);

    e.preventDefault();
    $(e.currentTarget).find('input').blur();
    map.addHeatLayer(tag, true);
  });
});