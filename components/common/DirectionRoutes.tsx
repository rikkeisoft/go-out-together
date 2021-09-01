import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import Button from './Button'
import * as turf from '@turf/turf'
import Marker from './Marker'
import ThreeDots from './ThreeDots'
import { Units } from '@turf/turf'
import { UserLocation } from 'lib/interfaces'

interface Destination {
  id: number
  name: string
  address: string
  coordinates: number[]
}

interface Props {
  showMap: () => unknown
  currentLocation: UserLocation
  listUserLocation: UserLocation[]
  destination: Destination
}

interface CircleOption {
  step?: number
  units: Units
}

const DirectionRoutes = ({ showMap, currentLocation, listUserLocation, destination }: Props): JSX.Element => {
  const [distance, setDistance] = useState([])
  const [route, setRoute] = useState([])
  const [mapBox, setMapBox] = useState(null)
  const distanceRef = useRef([])
  const routesRef = useRef([])

  const saveDistance = (item: UserLocation, newDistance: number) => {
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

  const saveRoute = (coordinates: number[]) => {
    if (routesRef.current) {
      routesRef.current = [...routesRef.current, ...coordinates]
    }
  }

  useEffect(() => {
    const longitude = destination.coordinates[0]
    const latitude = destination.coordinates[1]
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_TOKEN_MAPBOX
    setMapBox(
      new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitude, latitude],
        zoom: 10,
      }),
    )

    return () => {
      setMapBox(null)
      setRoute([])
      setDistance([])
    }
  }, [destination.id])

  useEffect(() => {
    distanceRef.current = []
    routesRef.current = []

    if (mapBox) {
      // add marker for distance
      const addDestinationMarker = () => {
        const marker = new mapboxgl.Marker({ color: '#ff0000' })
        const markerPopup = new mapboxgl.Popup()
        markerPopup.setText(`Điểm đến - (${destination.address})`)
        marker.setPopup(markerPopup)
        marker.setLngLat([destination.coordinates[0], destination.coordinates[1]])
        marker.addTo(mapBox)
      }
      mapBox.on('load', addDestinationMarker)

      listUserLocation.map((item, index) => {
        let colorSetting: string, info: string
        if (item.userId === currentLocation.userId) {
          colorSetting = '#166f00'
          info = `Bạn - (${item.address})`
        } else {
          colorSetting = '#3887be'
          info = `${item.name} - (${item.address})`
        }

        const addMarker = () => {
          const marker = new mapboxgl.Marker({
            color: colorSetting,
          })
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(info)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.coordinates[0], item.coordinates[1]])
          marker.addTo(mapBox)
        }
        mapBox.on('load', addMarker)

        let start = [item.coordinates[0], item.coordinates[1]]
        const coordsDestination = [destination.coordinates[0], destination.coordinates[1]]

        const getRoute = async (item: UserLocation, start: number[], end: number[]) => {
          // start: user location; end: destination
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
          )
          const data = response.data.routes[0]
          const coordinates = data.geometry.coordinates
          saveRoute(coordinates)
          setRoute([...routesRef.current])
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
          if (mapBox.getSource(`route${index}`)) {
            mapBox.getSource(`route${index}`).setData(geojson)
          } else {
            mapBox.addLayer({
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
                'line-color': `${colorSetting}`,
                'line-width': 5,
                'line-opacity': 0.75,
              },
            })
          }
        }
        //add start point
        mapBox.on('load', async () => {
          await getRoute(item, start, coordsDestination)
          mapBox.addLayer({
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
              'circle-color': `${colorSetting}`,
            },
          })
        })
        // add end point
        mapBox.on('load', async () => {
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
          if (mapBox.getLayer('end')) {
            mapBox.getSource('end').setData(end)
          } else {
            mapBox.addLayer({
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
    }
  }, [destination.id, mapBox, listUserLocation])

  useEffect(() => {
    // draw circle and fit bound
    if (mapBox) {
      let arrayPoint = []
      const getCenterPoint = () => {
        listUserLocation.forEach((item) => {
          arrayPoint.push(item.coordinates)
        })
        arrayPoint.push(destination.coordinates)
        arrayPoint.push(arrayPoint[0])
      }

      getCenterPoint()
      if (listUserLocation.length >= 2) {
        let polygon = turf.polygon([arrayPoint])
        let centerCoordinates = turf.center(polygon)

        mapBox.on('load', function () {
          const from = turf.point(centerCoordinates.geometry.coordinates)
          const points = arrayPoint.slice(0, arrayPoint.length - 1)
          const distanceRadius = getMaxRadius(points, from)
          let center = turf.point(centerCoordinates.geometry.coordinates)
          let radius = distanceRadius
          let options = { steps: 50, units: 'kilometers' } as unknown as CircleOption

          let circle = turf.circle(center, radius, options)

          mapBox.addSource('circleData', {
            type: 'geojson',
            data: circle,
          })
          mapBox.addLayer({
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
      if (route.length !== 0) {
        const bounds = getBounds()
        mapBox.fitBounds(bounds, {
          padding: 100,
        })
      }
    }
  }, [route, mapBox, listUserLocation])

  const getMaxRadius = (pointArray, fromPoint): number => {
    const distanceOption = { units: 'kilometers' } as unknown as CircleOption
    const distanceArray = pointArray.map((point) => {
      const newPoint = turf.point(point)
      return turf.distance(fromPoint, newPoint, distanceOption)
    })
    const maxRadius = distanceArray.reduce(
      (acc: number, distanceEle: number) => (distanceEle > acc ? distanceEle : acc),
      0,
    )

    return maxRadius
  }

  const getBounds = () => {
    if (route.length !== 0) {
      const routeLine = turf.lineString(route)
      const bbox = turf.bbox(routeLine)
      const bboxPolygon = turf.bboxPolygon(bbox)
      const coords = bboxPolygon.geometry.coordinates[0]
      routesRef.current = [...coords]
      const bounds = coords.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coords[0], coords[coords.length - 1]),
      )
      return bounds
    }
  }

  const getAverageDistance = (): number => {
    if (distance.length !== 0) {
      const total = distance.reduce((acc, element) => acc + element.newDistance, 0)
      return total / distance.length
    }
  }

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel='icon' href='/favicon.ico' />
        <script async src='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css' rel='stylesheet' />
      </Head>
      <div className='mx-auto relative popup-direction'>
        <div className='flex justify-between items-center'>
          <p className='text-blue-600 text-xl font-semibold'>Thông tin đường đi</p>
          <Button
            type='submit'
            variant='primary'
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
        <div className='my-2 p-2 h-32 overflow-y-scroll border border-gray-400'>
          {distance.length !== 0 &&
            distance.map((item) => (
              <div key={item.userId} className='mb-2'>
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
        {distance.length !== 0 && (
          <p className='mb-3'>
            <ThreeDots />
            Chiều dài quãng đường trung bình: {(getAverageDistance() / 1000).toFixed(2)} KM
          </p>
        )}
        <div id='map' className='w-full' style={{ height: '60vh' }} />
      </div>
    </>
  )
}

export default DirectionRoutes
