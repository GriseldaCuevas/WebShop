
var Storelocator = Class.create();
Storelocator.prototype = {
    initialize: function(latitude, longtitude, zoom_value){
        
        // latitude = parseFloat($('latitude').getValue());    
        // longtitude = parseFloat($('longtitude').getValue());
        this.stockholm = new google.maps.LatLng(latitude, longtitude);
        this.zoom_value = zoom_value;       
        this.marker = null;
        this.map = null;
        //var zoom_value = parseInt($('zoom_level').getValue());
        google.maps.event.addDomListener(window, 'load', this.initGoogleMap.bind(this));
       
      
    },
    initGoogleMap: function(){
        var mapOptions = {
            zoom: this.zoom_value,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: this.stockholm
        };

        this.map = new google.maps.Map($('googleMap'),
            mapOptions);

        this.marker = new google.maps.Marker({
            map:this.map,
            draggable:true,   
            position: this.stockholm
        });
        google.maps.event.addListener(this.marker, 'dragend', function(event) {                       
            $('store_latitude_value').value = event.latLng.lat();
            $('store_longtitude_value').value = event.latLng.lng();
            $('latitude').value = event.latLng.lat();
            $('longtitude').value = event.latLng.lng();
            $('latitude').setStyle({
                background: 'rgb(250, 230, 180)'
            });
            $('longtitude').setStyle({
                background: 'rgb(250, 230, 180)'
            });
        }.bind(this));
        google.maps.event.addListener(this.map, 'zoom_changed', function() {            
            var zoomLevel = this.map.getZoom();            
            $('zoom_level_value').value = zoomLevel;
            $('zoom_level').value = zoomLevel;
            $('zoom_level').setStyle({
                background: 'rgb(250, 230, 180)'
            });
        }.bind(this));
    },
    reSizeMap: function (){
    // map = this.map;
         
    },
    reLoadMap: function (){
    //        var  service = new google.maps.places.PlacesService(map);      
    //        service.textSearch(request, this.processSearchResults.bind(this));   
    }
}

var StorelocatorFrontEnd = Class.create();
StorelocatorFrontEnd.prototype = {
    initialize: function(latitude, longtitude, zoom_value, idMap){
        this.myLatlng = new google.maps.LatLng(latitude, longtitude);
        this.markerArray = [];
        this.markearryIdStore =[];
        this.myOptions = {
            zoom: zoom_value,
            center: this.myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map(document.getElementById(idMap), this.myOptions);
        this.bounds = new google.maps.LatLngBounds();
        this.rendererOptions = {
            map:this.map
        };
        this.directionsDisplay  = new google.maps.DirectionsRenderer(this.rendererOptions);
        this.directionsService = new google.maps.DirectionsService();
    },
    
    extendPoint: function(marker){
        this.bounds.extend(marker);
    },
    
    placeMarker: function(point, store_info, storeId, image,zoomLevel, infoWindow, x, storeObject){                
        var marker;
        if(image){
            marker = new google.maps.Marker({
                position: point,
                map: this.map,
                icon: image,
                store_id :storeId 
            });
        } else {
            marker = new google.maps.Marker({
                position: point,
                map: this.map,
                store_id :storeId 
            });
        }
        storeObject.marker = marker;
        this.markerArray.push(marker);
        google.maps.event.addListener(marker, 'click', function(event) {
            infoWindow.setContent(store_info);
            infoWindow.setPosition(event.latLng);            
            infoWindow.open(this.map, marker);
            if(zoomLevel!=0){
                this.map.setZoom(zoomLevel);
            }
            this.setActiveForm(storeId, x);
        }.bind(this));
        
        //this.getPoupForm(store_info, point, marker, zoomLevel, storeId, infoWindow)
    },
    getPoupForm: function(store_info, point, zoomLevel, storeId, infoWindow){
        $('id' + storeId).observe('click', function(event) {            
            infoWindow.setContent(store_info);
            infoWindow.setPosition(point);
            //marker_point = new google.maps.LatLng(setLat, setLon);
            this.map.setCenter(point);            
            infoWindow.open(this.map);
            if(zoomLevel!=0){
                this.map.setZoom(zoomLevel);
            }
        }.bind(this));
    },
    setBoundFill: function (){
        /*this.map.fitBounds(this.bounds);*/
        this.map.setCenter(this.bounds.getCenter());
        this.map.setZoom(this.map.getZoom()+1);
    },
    
    setActiveForm: function(id, x){
        $$('.active').invoke('removeClassName', 'active');               
        $('id' + id).addClassName('active');
        if(x){
            for (i=0; i<=this.markearryIdStore.length-1; i++){
                try{

                    if(this.markearryIdStore[i] == id){
                        $('magestore-storelocator-getdirection-'+id).show();
                    }else{
                        $('magestore-storelocator-getdirection-'+this.markearryIdStore[i]).hide();
                    }

                }catch(err){
                    
                }                
            }
            this.directionsDisplay.setPanel(document.getElementById('magestore-storelocator-directionsPanel-'+id));
            this.calcRoute(id);
        }         
    },
    
    createMarker: function(marker_point){
        image_icon = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|0099FF");
        marker = new google.maps.Marker({
            position: marker_point,
            map: this.map,
            icon: image_icon
        });
        this.markerArray.push(marker);
        this.extendPoint(marker_point);
    },
    
    createRadius: function (radius){
        origin_lat = $('storelocator-lat-find').value;
        origin_lng = $('storelocator-lng-find').value;

        var myCircle = new google.maps.Circle({
            center:  new google.maps.LatLng(origin_lat,origin_lng),
            map: this.map,
            radius: radius,
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#B9D3EE",
            fillOpacity: 0.35
        });
        var myBounds = myCircle.getBounds();
        var show = null;

        //filters markers
        for(var i=this.markerArray.length;i--;){
            if(!myBounds.contains(this.markerArray[i].getPosition()))
            {
                this.markerArray[i].setMap(null);                                    
                $("id"+this.markerArray[i].store_id).hide();
            }else{
                if (this.markerArray.length == 1){
					if (i < this.markerArray.length)
						show = 1;
				} else if (i<this.markerArray.length-1)
                    show = 1;
            }
        }
        
        if(!show){
            $('store-locator-content').innerHTML = 'Not found!';
        }
        this.map.setCenter(this.markerArray[this.markerArray.length - 1].getPosition());
        this.map.setZoom(this.map.getZoom()+1);
    },
    
    calcRoute: function (idstore){
        destination_lat = $('storelocator-lat-'+idstore).value;
        destination_lng = $('storelocator-lng-'+idstore).value;
        des = destination_lat+","+destination_lng;

        origin_lat = $('storelocator-lat-find').value;
        origin_lng = $('storelocator-lng-find').value;
        ori = origin_lat+","+origin_lng;

        finalMarker = this.markerArray.length - 1;
            var request = {
                origin: ori,
                destination:  des,
                waypoints:[],
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };
            this.directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    this.directionsDisplay.setDirections(response);
                }
            }.bind(this));
    },
    computeTotalDistance: function (result) {
        var total = 0;
        var myroute = result.routes[0];
        for (var i = 0; i < myroute.legs.length; i++) {
            total += myroute.legs[i].distance.value;
        }                
    }
}

var StorelocatorObject = Class.create();
StorelocatorObject.prototype = {
    initialize: function(html, distance, storeId, marker){
        this.html = html;
        this.distance = distance;
        this.storeId = storeId;
        this.marker = marker;
    }
}

var InfoPopup = Class.create();
InfoPopup.prototype = {
    initialize: function(storeId,html, zoom, point){
        this.storeId = storeId;
        this.html = html;
        this.point = point;
        this.zoom = zoom;
    }
}
