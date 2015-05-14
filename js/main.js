/* global google */

/**
 * Tag constructor
 *
 * @constructor
 * @param {string} searchTerm The tag to search for
 */
var Tag = function(searchTerm) {
  this.searchTerm = searchTerm;
};

/**
 * Get the top places where this tag was used
 *
 * @param {function} callback An optional method to call upon completion
 */
Tag.prototype.getPlaces = function(callback) {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.places.placesForTags',
      api_key: 'b3a7fa326b8255e6af7900b7a58841e0',
      format: 'json',
      tags: this.searchTerm,
      place_type_id: '22'
    },
    success: function(data) {
      if (typeof callback !== 'undefined') {
        callback(data.places.place);
      }
    }
  });
};

/**
 * Get the top photo for a given location
 *
 * @param {number} latitude The latitude to find the photo from
 * @param {number} longitude The longitude to find the photo from
 * @param {function} map The Map instance to add the pictures to
 */
Tag.prototype.getPhotos = function(latitude, longitude, map) {
  $.ajax({
    url: "http://api.flickr.com/services/rest/?jsoncallback=?",
    dataType: 'jsonp',
    data: {
      method: 'flickr.photos.search',
      api_key: 'b3a7fa326b8255e6af7900b7a58841e0',
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
        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
        });
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map, marker);
        });
      }
    }
  });
};

/**
 * Map constructor
 *
 * @constructor
 * @param {number} latitude The latitude value for the center of the map
 * @param {number} longitude The longitude value for the center of the map
 */
var Map = function(startingLatitude, startingLongitude) {
  this.startingLatitude = startingLatitude;
  this.startingLongitude = startingLongitude;
  this.map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 3,
      center: new google.maps.LatLng(this.startingLatitude, this.startingLongitude),
      mapTypeId: google.maps.MapTypeId.SATELLITE
  });
  this.mapPoints = [];
  this.latLngObjArray = [];
};

/**
 * Get the coordinates to plot on the map
 *
 * @param {array} The list of places returned by the api
 */
Map.prototype.getMapPoints = function(places) {
  var latitude = '';
  var longitude = '';

  for (var i = 0, count = places.length; i < count; i++) {
    latitude = places[i].latitude;
    longitude = places[i].longitude;
    this.mapPoints.push({latitude: latitude, longitude: longitude});
    this.formatMapPoints(latitude, longitude);
  }
};

/**
 * Format the points to be used by google api
 *
 * @param {number} latitude The latitude of the point to format
 * @param {number} longitude The longitude of the point to format
 */
Map.prototype.formatMapPoints = function(latitude, longitude) {
  var latLngObj = new google.maps.LatLng(latitude, longitude);
  this.latLngObjArray.push(latLngObj);
};

/**
 * Add heat layer to map
 *
 * @param {object} tag The the tag to be mapped
 * @param {boolean} showPhotos If true, shows top photo for each location
 */
Map.prototype.addHeatLayer = function(tag, showPhotos) {
  this.draw = function(places) {
    this.getMapPoints(places);

    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.latLngObjArray,
      radius: 30
    });
    heatmap.setMap(this.map);
    if (showPhotos) {
      this.addPhotoLayer(tag);
    }
  };
  tag.getPlaces(this.draw.bind(this));
};

/**
 * Add photos to map
 *
 * @param {object} tag The the tag to be mapped
 */
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