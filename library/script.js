'use strict'

var geocoder = new google.maps.Geocoder();

new Vue({
  el: '#app',

  data: {
    locations: [],
    userLocation: false
  },

  methods: {
    toggleClosest: function(event) {
      if (this.userLocation) {
        // console.log(this.userLocation.lat + ", " + this.userLocation.lng)
        this.locations = this.locations.map((location)=> { return addDistance(location, this.userLocation.lat, this.userLocation.lng) })
        this.locations = this.locations.sort((a, b) => { 
          if (a.distance_from_user < b.distance_from_user) return -1;
          if (a.distance_from_user > b.distance_from_user) return 1;
          return 0
        })
      }
    }
  },

  mounted: function() {
    fetch('https://data.winnipeg.ca/resource/mpug-ezfm.json')
      .then((response) => {
        response.json().then((data) => {
          this.locations = data.map(addMaps);
        })
      })
      .catch(function(error) {
        alert('Fetch Error: ' + error)
      })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      }, function() {
        alert("Error finding your location. Sorry. :(")
      });
    }
  }
})

function addDistance(location, user_lat, user_lng) {
  var location_lat = location.location_1.coordinates[1]
  var location_lng = location.location_1.coordinates[0]
  // console.log("ll " + location_lat + " , " + location_lng + " ul " + user_lat + " , " + user_lng)
  location['distance_from_user'] = distanceBetweenPoints(location_lat, location_lng, user_lat, user_lng, 'K')
  return location
}


function addMaps(location) {
  var prepared_address = prepare_address_for_google_maps(location.address)
  location['map_url'] = google_map_image(prepared_address)
  location['distance_from_user'] = false
  return location
}

function google_map_image(address) {
  var google_maps_api_key = 'YOUR_GOOGLE_STATIC_MAPS_API_KEY'

  return 'https://maps.googleapis.com/maps/api/staticmap?markers=' + address + '&zoom=15&size=300x300&sensor=false&key=' + google_maps_api_key
}

function prepare_address_for_google_maps(address) {
  var full_address = address + ', Winnipeg, Manitoba, Canada'

  return full_address.replace(/ /g, '+')
}

function distanceBetweenPoints(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var radlon1 = Math.PI * lon1/180
  var radlon2 = Math.PI * lon2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}
