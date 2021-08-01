import React, { useEffect, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import PropTypes from 'prop-types'
import Button from './Button'

const DirectionRoutes = ({ showMap, currentLocation, listUserLocation, destination }) => {
  const [distance, setDistance] = useState(0)
  console.log('currentLocation', currentLocation)
  // console.log('listUserLocation', listUserLocation)
  // console.log('destination', destination)

  const expCurrentLocation = {
    name: 'son nguyen',
    address: 'Dong Da, Hanoi, Vietnam',
    coordinates: [105.8333, 21.0167],
  }
  const expDestination = {
    name: 'son nguyen',
    address: 'Bên xe Mỹ Đình',
    coordinates: [105.777909, 21.028412],
  }

  useEffect(() => {
    if (expDestination) {
      const longitude = expDestination.coordinates[0]
      const latitude = expDestination.coordinates[1]
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_TOKEN_MAPBOX
      let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitude, latitude],
        zoom: 15,
      })

      listUserLocation.map((item) => {
        // add marker
        const addMarker = () => {
          const marker = new mapboxgl.Marker()
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(`${item.value}`)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.coordinates[0], item.coordinates[1]])
          marker.addTo(map)
        }
        map.on('load', addMarker)

        // add route
        let start = [item.coordinates[0], item.coordinates[1]]
        const getRoute = async (end) => {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
          )
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
            const length = response.data.routes[0].distance
            setDistance(length)
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
                features: [
                  {
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
          const coords = [expDestination.coordinates[0], expDestination.coordinates[1]]
          let end = {
            type: 'FeatureCollection',
            features: [
              {
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
                  features: [
                    {
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: 'Point',
                        coordinates: coords,
                      },
                    },
                  ],
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
      })
    }
  }, [destination])

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div className="w-9/12 mx-auto relative">
        <div className="absolute right-0">
          <Button
            type="submit"
            variant="primary"
            onClick={() => {
              showMap()
            }}
          >
            Xong
          </Button>
        </div>
        <div id="map" className="absolute top-20" style={{ width: '100%', height: '70vh' }}></div>
        <p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Từ: {expCurrentLocation.address}
        </p>
        <p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Đến: {expDestination.address}
        </p>
        <p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
          Chiều dài quãng đường: {(distance / 1000).toFixed(2)} KM
        </p>
      </div>
    </>
  )
}

DirectionRoutes.prototype = {
  showMap: PropTypes.any,
  currentLocation: PropTypes.object,
  listUserLocation: PropTypes.array,
  destination: PropTypes.object,
}

DirectionRoutes.defaultProps = {}

export default DirectionRoutes
