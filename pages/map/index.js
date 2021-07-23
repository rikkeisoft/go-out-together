import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Head from "next/head";
import axios from "axios";

const Map = () => {
  const [location, setLocation] = useState(null)
  const [dataLocation, setDataLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  useEffect(() => {
    const getLocation = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_MAPBOX}/${location}.json?access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`
        );
        const dataList = response.data.features;
        setDataLocation(dataList);
      } catch (error) {
        console.log("error:: ", error);
      }
    };
    getLocation();
  }, [location])

  useEffect(() => {
    console.log(selectedLocation);
    if (selectedLocation) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_TOKEN_MAPBOX;
      let map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/mapbox/streets-v11", // style URL
        center: [selectedLocation.center[0], selectedLocation.center[1]], // starting position [lng, lat]
        zoom: 10,
      });

      // dataLocation.forEach(function(marker) {

      //   // create a HTML element for each feature
      //   var element = document.createElement('div');
      //   element.className = 'marker';
      //   console.log(marker)
      //   // make a marker for each feature and add to the map
      //   new mapboxgl.Marker(element)
      //     .setLngLat(marker.geometry.coordinates)
      //     .addTo(map);
      // });
    }
  }, [selectedLocation]);

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <div className="max-w-full">
        <form>
          <input
            type="text"
            className="max-w-full m-5 p-2 outline-none border-2"
            placeholder="Nhập địa chỉ của bạn"
            onChange={(event) => {
              setLocation(event.target.value)
            }}
          />
        </form>
        <ul>
          {dataLocation &&
            dataLocation.map((item, index) => {
              return (
                <li
                  key={index}
                  className="cursor-pointer p-2"
                  onClick={() => {
                    setSelectedLocation(item);
                    setDataLocation(null);
                  }}
                >
                  {item.place_name}
                </li>
              );
            })}
        </ul>
      </div>
      <div id="map" style={{ width: "100vw", height: "80vh" }}></div>
    </>
  );
};

export default Map;
