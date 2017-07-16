import React, { Component } from 'react';
import { Session } from 'meteor/session';
import GoogleMap from './lib/GoogleMap';
import Markers from './markers';

class MyMap extends Component {
  constructor() {
    super();
    this.handleOnReady = this.handleOnReady.bind(this);

    this.state = {
      value: '',
      latitude: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlelChange = this.handlelChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMapOptions() {
    return {
      center: new google.maps.LatLng(40.6782, -73.9442),
      zoom: 8,

      mapTypeId: google.maps.MapTypeId.ROADMAP,
      maxZoom: 11,
      minZoom: 9,
      zoomControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_RIGHT,
        style: google.maps.ZoomControlStyle.DEFAULT,
      },
      panControlOptions:{
        position: google.maps.ControlPosition.BOTTOM_LEFT,
      }
    };
  }

  handleOnReady(name) {
    GoogleMaps.ready(name, map => {
      Tracker.autorun(c => {
        google.maps.event.addListener(map.instance, 'dblclick', function(event) {
          Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng(), info:"here" });
        });

        google.maps.event.addListener(map.instance, 'click', function(event) {

        });


        const markers = {};

        Markers.find().observe({
          added: function(document) {
            const marker = new google.maps.Marker({
              draggable: true,
              animation: google.maps.Animation.DROP,
              position: new google.maps.LatLng(document.lat, document.lng),
              map: map.instance,
              id: document._id,
            });

            google.maps.event.addListener(marker, 'dragend', function(event) {
              Markers.update(marker.id, {
                $set: { lat: event.latLng.lat(), lng: event.latLng.lng() },
              });
            });
             var contentString = 'check'

            var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

            google.maps.event.addListener(marker, 'click', function(event) {
                infowindow.open(map, marker);
            });


            markers[document._id] = marker;
          },
          changed: function(newDocument, oldDocument) {
            markers[newDocument._id].setPosition({
              lat: newDocument.lat,
              lng: newDocument.lng,
            });
          },
          removed: function(oldDocument) {
            markers[oldDocument._id].setMap(null);
            google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
            delete markers[oldDocument._id];
          },
        });
        this.computation = c;
      });
    });
  }

  componentWillUnmount() {
    this.computation.stop();
  }
  handleSubmit(event) {
   alert('A name was submitted: ' + this.state.value + "Latitude " + this.state.latitude);
   event.preventDefault();
 }

   handleChange(event) {
    this.setState({value: event.target.value});
  }

  handlelChange(event) {
    this.setState({latitude: event.target.value});
  }




  render() {


    return (
      <div>
        <form onSubmit={this.handleSubmit}>
       <label>
         Longitude:
         <input type="text" value={this.state.value} onChange={this.handleChange} />
       </label>
       <label>
         Latitude:
         <input type="text" latitude={this.state.latitude} onChange={this.handlelChange} />
       </label>

       <input type="submit" value="Submit" />
     </form>
        <GoogleMap
          onReady={this.handleOnReady}
          mapOptions={this.handleMapOptions}
        >
          Loading!
        </GoogleMap>
      </div>

    );
  }
}

export default MyMap;
