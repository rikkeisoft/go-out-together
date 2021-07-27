import React, { useEffect } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'

const Routes = () => {

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic29ubnY1IiwiYSI6ImNrcmczMTF1ZzI3b3oyb3F1NHU0cmd6N3EifQ.cnxzBouZ3K6aMsEdQhT65w'
    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v10',
      center: [-122.662323, 45.523751],
      zoom: 12,
    })
    let start = [-122.662323, 45.523751]
    const getRoute = async (end) => {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`)
      const data = response.data.routes[0]
      const coordinates = data.geometry.coordinates
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      }
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson)
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        })
      }

      if (start !== end) {
        const distance = response.data.routes[0].distance
        console.log('Quãng đường::', distance)
      }
    }

    map.on('load', () => {
      getRoute(start)

      map.addLayer({
        id: 'point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: start,
              },
            },
            ],
          },
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#3887be',
        },
      })

    })

    map.on('load', () => {
      const coords = [-122.6389770527341, 45.51533159015108]
      let end = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords,
          },
        },
        ],
      }
      if (map.getLayer('end')) {
        map.getSource('end').setData(end)
      } else {
        map.addLayer({
          id: 'end',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: coords,
                },
              }],
            },
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#f30',
          },
        })
      }
      getRoute(coords)
    })

  }, [])

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div id="map" style={{ width: '100vw', height: '80vh' }}></div>
    </>
  )
}

export default Routes
