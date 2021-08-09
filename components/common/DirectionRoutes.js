import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import PropTypes from 'prop-types'
import Button from './Button'
import * as turf from '@turf/turf'
import Marker from './Marker'
import ThreeDots from './ThreeDots'

const DirectionRoutes = ({ showMap, currentLocation, listUserLocation, destination }) => {
  const [distance, setDistance] = useState([])
  const distanceRef = useRef([])

  const saveDistance = (item, newDistance) => {
    if (
      distanceRef.current &&
      (distanceRef.current.length === 0 || distanceRef.current.every((ele) => ele.userId !== item.userId))
    ) {
      distanceRef.current.push({
        userId: item.userId,
        address: item.address,
        newDistance,
      })
    }
  }

  useEffect(() => {
    distanceRef.current = []

    const longitude = destination.coordinates[0]
    const latitude = destination.coordinates[1]
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
      markerPopup.setText(`${destination.name} - (${destination.address})`)
      marker.setPopup(markerPopup)
      marker.setLngLat([destination.coordinates[0], destination.coordinates[1]])
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

      let start = [item.coordinates[0], item.coordinates[1]]
      const coordsDestination = [destination.coordinates[0], destination.coordinates[1]]

      const getRoute = async (item, start, end) => {
        // start: user location; end: destination
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
        )
        const data = response.data.routes[0]
        const coordinates = data.geometry.coordinates
        // distanceRef.current.push({
        //   userId: item.userId,
        //   distance: data.distance,
        // })

        // setDistance([...distance, distanceRef.current])
        saveDistance(item, data.distance)
        setDistance([...distanceRef.current])

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
          let colorMarker
          if (item.userId === currentLocation.userId) {
            colorMarker = '#166f00'
          } else colorMarker = '#3887be'
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
              'line-color': `${colorMarker}`,
              'line-width': 5,
              'line-opacity': 0.75,
            },
          })
        }
      }
      //add start point
      map.on('load', async () => {
        let colorMarker
        if (item.userId === currentLocation.userId) {
          colorMarker = '#166f00'
        } else colorMarker = '#3887be'
        await getRoute(item, start, coordsDestination)
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
            'circle-color': `${colorMarker}`,
          },
        })
      })
      // add end point
      map.on('load', async () => {
        await getRoute(item, start, coordsDestination)
        let end = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coordsDestination,
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
                      coordinates: coordsDestination,
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
      })
    })
    //xử lý mảng điểm kinh độ vĩ độ có a[0]=a[n-1]
    let arrayPoint = []
    const getCenterPoint = () => {
      listUserLocation.forEach((item) => {
        arrayPoint.push(item.coordinates)
      })
      arrayPoint.push(destination.coordinates)
      arrayPoint.push(arrayPoint[0])
    }

    let coords, bounds
    getCenterPoint()
    if (listUserLocation.length >= 2) {
      let polygon = turf.polygon([arrayPoint])
      let centerCoordinates = turf.center(polygon)

      map.on('load', function () {
        coords = arrayPoint.slice(0, arrayPoint.length - 1)
        const from = turf.point(centerCoordinates.geometry.coordinates)
        const to = turf.point(arrayPoint[0])
        const distanceOption = { unit: 'radian' }
        const distanceRadius = turf.distance(from, to, distanceOption)
        let center = turf.point(centerCoordinates.geometry.coordinates)
        let radius = distanceRadius + 0.5
        let options = { steps: 100 }

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
        bounds = coords.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[coords.length - 1]),
        )
        map.fitBounds(bounds, { padding: 50 })
      })
    } else {
      coords = arrayPoint.slice(0, 2)
      console.log(coords)
      bounds = new mapboxgl.LngLatBounds(coords[0], coords[1])
      map.fitBounds(bounds, { padding: 50 })
    }
  }, [destination.id])

  const getAverageDistance = () => {
    if (distance.length !== 0) {
      const total = distance.reduce((acc, element) => acc + element.newDistance, 0)
      return total / distance.length
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
        <div className="flex justify-between items-center">
          <p className="text-blue-600 text-xl font-semibold">Thong tin duong di</p>
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
          <Marker />
          Đến: {destination.address}
        </p>
        <div className="my-2 p-2 h-32 overflow-y-scroll border border-gray-400">
          {distance.length !== 0 &&
            distance.map((item) => (
              <div key={item.userId} className="mb-2">
                <p>
                  <Marker />
                  Từ: {item.address}
                </p>
                <p>
                  <ThreeDots />
                  Chiều dài quãng đường: {(item.newDistance / 1000).toFixed(2)} KM
                </p>
              </div>
            ))}
        </div>
        <p className="mb-3">
          <ThreeDots />
          Chiều dài quãng đường trung bình: {(getAverageDistance() / 1000).toFixed(2)} KM
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
