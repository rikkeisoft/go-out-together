import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import PropTypes from 'prop-types'
import Button from './Button'
import * as turf from '@turf/turf'

const DirectionRoutes = ({ showMap, currentLocation, listUserLocation, destination }) => {
  const [distance, setDistance] = useState([])
  const distanceRef = useRef([])
  console.log('currentLocation', currentLocation)
  // console.log('listUserLocation', listUserLocation)
  // console.log('destination', destination)

  const expCurrentLocation = {
    name: 'son nguyen',
    address: 'Dong Da, Hanoi, Vietnam',
    coordinates: [105.8333, 21.0167],
  }
  const expDestination = {
    name: 'Destination',
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

      // add marker for distance
      const addDestinationMarker = () => {
        const marker = new mapboxgl.Marker({ color: '#ff0000' })
        const markerPopup = new mapboxgl.Popup()
        markerPopup.setText(`${expDestination.name} - (${expDestination.address})`)
        marker.setPopup(markerPopup)
        marker.setLngLat([expDestination.coordinates[0], expDestination.coordinates[1]])
        marker.addTo(map)
      }
      map.on('load', addDestinationMarker)

      listUserLocation.map((item, index) => {
        const addMarker = () => {
          const marker = new mapboxgl.Marker()
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(`${item.name} - (${item.address})`)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.coordinates[0], item.coordinates[1]])
          marker.addTo(map)
        }
        map.on('load', addMarker)

        let start = [listUserLocation[index].coordinates[0], listUserLocation[index].coordinates[1]]
        const getRoute = async (end) => {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
          )
          const data = response.data.routes[0]
          const coordinates = data.geometry.coordinates
          distanceRef.current.push(data.distance)
          setDistance([...distance, distanceRef.current])
          const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          }
          if (map.getSource(`route${index}`)) {
            map.getSource(`route${index}`).setData(geojson)
          } else {
            map.addLayer({
              id: `route${index}`,
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
        }
        //add start point
        map.on('load', () => {
          getRoute(start)
          map.addLayer({
            id: `point${index}`,
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
        // add end point
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
      //xử lý mảng điểm kinh độ vĩ độ có a[0]=a[n-1]
      const arrayPoint = []
      const getCenterPoint = () => {
        listUserLocation.forEach((item) => {
          arrayPoint.push(item.coordinates)
        })
        arrayPoint.push(arrayPoint[0])
      }

      if (listUserLocation.length > 2) {
        getCenterPoint()
        let polygon = turf.polygon([arrayPoint])
        let centerCoordinates = turf.centerOfMass(polygon)

        map.on('load', function () {
          let center = turf.point([
            centerCoordinates.geometry.coordinates[0],
            centerCoordinates.geometry.coordinates[1],
          ])
          let radius = 1
          let options = {
            steps: 90,
            units: 'kilometers',
          }

          let circle = turf.circle(center, radius, options)

          map.addSource('circleData', {
            type: 'geojson',
            data: circle,
          })
          map.addLayer({
            id: 'circle-fill',
            type: 'fill',
            source: 'circleData',
            paint: {
              'fill-color': '#00FFFF',
              'fill-opacity': 0.2,
            },
          })
        })
      }
    }
  }, [destination])

  const getDistance = () => {
    if (distance[0] !== undefined) {
      const total = distance[0].reduce((accumlator, value) => {
        return accumlator + value
      }, 0)
      return total / distance[0].length / 500
    }
  }

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
          {/* Chiều dài quãng đường: {(distance / 1000).toFixed(2)} KM */}
          Chiều dài quãng đường trung bình: {distance[0] && getDistance().toFixed(2)} KM
        </p>
        <div id="map" style={{ width: '100%', height: '60vh' }} />
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
