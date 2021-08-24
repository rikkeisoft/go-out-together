import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import axios from 'axios'
import Button from './Button'
// import * as turf from '@turf/turf'

const MapBox = ({ listAddress, show, isOneLocaion, data }) => {
  const [location, setLocation] = useState(null)
  const [dataLocation, setDataLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [listLocation, setListLocation] = useState([])
  const [showListLocation, setShowListLocation] = useState(true)
  const selectedLocationRef = useRef([])

  useEffect(() => {
    if (selectedLocationRef.current && !isOneLocaion) {
      if (listAddress) {
        selectedLocationRef.current = listAddress.map((address) => ({
          name: address.name,
          coordinates: [address.longitude, address.latitude],
        }))
      } else selectedLocationRef.current = []
    }
  }, [listAddress])

  const handleDeleteAddressListLocation = (locationId) => {
    const locationIndex = listLocation.findIndex((location) => location.id === locationId)
    setLocation('')
    setListLocation([...listLocation.slice(0, locationIndex), ...listLocation.slice(locationIndex + 1)])
  }

  useEffect(() => {
    if (location) {
      const getLocation = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_MAPBOX}/${location}.json?proximity=105.75077611516895,20.999219111687964&bbox=105.57999631946717,20.86290687846366,105.91278669275977,21.162623422597193&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
            // `${process.env.NEXT_PUBLIC_GOOGLE_API_URL}?input=${location}&inputtype=textquery&locationbias=rectangle:21.162623422597193,105.57999631946717,20.86290687846366,105.91278669275977&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
          )
          const dataList = response.data.features
          setDataLocation(dataList)
        } catch (error) {
          console.error('error: ', error)
        }
      }
      getLocation()
    }
  }, [location])

  useEffect(() => {
    if (selectedLocation) {
      const longitude = selectedLocation.center[0]
      const latitude = selectedLocation.center[1]
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_TOKEN_MAPBOX
      let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longitude, latitude],
        zoom: 12,
      })
      const newLocations = listLocation.map((location) => ({
        name: location.place_name,
        coordinates: location.center,
      }))
      let arrayCoordinates = [...selectedLocationRef.current, ...newLocations]

      arrayCoordinates.map((item) => {
        map.on('load', () => {
          const marker = new mapboxgl.Marker({
            color: '#3887be',
          })
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(`${item.name}`)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.coordinates[0], item.coordinates[1]])
          marker.addTo(map)

          let bounds = []
          const addedCoor = 0.0025
          let arrayCoordinateMarkers = arrayCoordinates.map((address) => address.coordinates)
          if (isOneLocaion || arrayCoordinates.length === 1) {
            bounds = new mapboxgl.LngLatBounds(
              [arrayCoordinateMarkers[0][0] + addedCoor, arrayCoordinateMarkers[0][1] - addedCoor],
              [arrayCoordinateMarkers[0][0] - addedCoor, arrayCoordinateMarkers[0][1] + addedCoor],
            )
            map.fitBounds(bounds, { padding: 50 })
          } else {
            bounds = arrayCoordinateMarkers.reduce(
              (bounds, coord) => bounds.extend(coord),
              new mapboxgl.LngLatBounds(arrayCoordinateMarkers[0], arrayCoordinateMarkers[arrayCoordinates.length - 1]),
            )
            map.fitBounds(bounds, { padding: 50 })
          }
        })
      })
    }
  }, [selectedLocation, listLocation])

  const checkDisabledButton = () => {
    if (listAddress !== undefined)
      return isOneLocaion ? listAddress.length + 1 > 5 : listAddress.length + listLocation.length > 5

    return false
  }

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script async src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        {/* <script async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`}>
        </script> */}
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <h1 className="text-center font-semibold text-xl">Hãy chọn địa điểm ở Hà Nội</h1>
      <div className="w-full md:w-4/5 px-2 mb-2 relative mx-auto">
        {listLocation.length > 4 ? (
          <div className="flex justify-between">
            <p className="text-red-500">Chỉ được tạo tối đa 5 địa điểm !</p>
            <Button
              type="submit"
              variant="primary"
              onClick={() => {
                if (isOneLocaion) {
                  data(selectedLocation)
                } else {
                  data(listLocation)
                }
                show()
              }}
            >
              Xong
            </Button>
          </div>
        ) : (
          <>
            {listAddress && (
              <>
                <p className="text-center">Bạn chỉ được nhập tối đa {5 - listAddress.length} địa chỉ</p>
                {isOneLocaion
                  ? listAddress.length + 1 >= 5 && <p className="text-red-500">Đã đủ 5 địa chỉ!!</p>
                  : listAddress.length + listLocation.length >= 5 && (
                      <p className="my-1 text-red-500">Đã đủ 5 địa chỉ!!</p>
                    )}
                <ul className="my-3">
                  {listLocation.length !== 0 && <span>Danh sách địa điểm được thêm vào: </span>}
                  {listLocation.map((location) => (
                    <li key={location.id} className="px-3 py-2 mb-2 border border-gray-400">
                      {location.place_name}
                      <span
                        className="ml-2 cursor-pointer"
                        onClick={() => handleDeleteAddressListLocation(location.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 inline"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <form className="mb-4 flex flex-col-reverse items-center md:flex-row md:justify-between">
              <div className="relative w-full md:w-80 bg-white border md:border-0 border-gray-400">
                <input
                  type="text"
                  value={location || ''}
                  className="w-11/12 md:w-80 p-2 pr-10 inline outline-none whitespace-nowrap overflow-hidden overflow-ellipsis"
                  placeholder="Nhập địa chỉ của bạn"
                  onChange={(event) => {
                    setLocation(event.target.value)
                    setShowListLocation(true)
                  }}
                />
                <span
                  className="absolute top-1.5 md:left-72"
                  onClick={() => {
                    setLocation('')
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <div className="mb-2 md:mb-0">
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => {
                    if (isOneLocaion) {
                      data(selectedLocation)
                    } else {
                      data(listLocation)
                    }
                    show()
                  }}
                  disabled={checkDisabledButton()}
                >
                  Thêm địa điểm
                </Button>
              </div>
            </form>
          </>
        )}
        {dataLocation && dataLocation.length !== 0 && showListLocation && location && (
          <ul className="border border-gray-400 bg-gray-100">
            {dataLocation.map((item, index) => {
              return (
                <li
                  key={index}
                  className="cursor-pointer p-2"
                  onClick={() => {
                    setSelectedLocation(item)
                    setLocation(item.place_name)
                    if (isOneLocaion) {
                      setListLocation([item])
                    } else {
                      if (listLocation.length === 0) {
                        setListLocation([...listLocation, item])
                      } else {
                        listLocation.forEach((location) => {
                          location.id === item.id ? null : setListLocation([...listLocation, item])
                        })
                      }
                    }
                    setShowListLocation(false)
                  }}
                >
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
                  {item.place_name}
                </li>
              )
            })}
          </ul>
        )}
        <div id="map" className="w-full mb-8" style={{ height: '70vh' }}></div>
        <div id="google-map"></div>
      </div>
    </>
  )
}

MapBox.propTypes = {
  show: PropTypes.func,
  isOneLocaion: PropTypes.bool,
  data: PropTypes.func,
  listLocation: PropTypes.array,
}

MapBox.defaultProps = {}
export default MapBox
