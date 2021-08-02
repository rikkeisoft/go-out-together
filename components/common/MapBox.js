import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import axios from 'axios'
import Button from './Button'
// import * as turf from '@turf/turf'

const MapBox = ({ show, isOneLocaion, data }) => {
  const [location, setLocation] = useState(null)
  const [dataLocation, setDataLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [listLocation, setListLocation] = useState([])
  const [showListLocation, setShowListLocation] = useState(true)
  const [arrayCoodinates, setArrayCoodinates] = useState([])

  // console.log(listLocation)

  useEffect(() => {
    if (location) {
      const getLocation = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_MAPBOX}/${location}.json?access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
          )
          const dataList = response.data.features
          setDataLocation(dataList)
        } catch (error) {
          console.log('error:: ', error)
        }
      }
      getLocation()
    }
  }, [location])

  useEffect(() => {
    setLocation(selectedLocation.place_name)

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
      listLocation.map((item) => {
        const addMarker = () => {
          const marker = new mapboxgl.Marker()
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(`${item.place_name}`)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.center[0], item.center[1]])
          marker.addTo(map)

          setArrayCoodinates([...arrayCoodinates, item.geometry.coordinates])
        }
        map.on('load', addMarker)
      })
    }
  }, [selectedLocation])

  // const getBound = () => {
  //   if (arrayCoodinates.length > 2) {
  //     let map = new mapboxgl.Map({
  //       container: 'map',
  //       style: 'mapbox://styles/mapbox/streets-v11',
  //       center: [105.8, 21.0333],
  //       zoom: 12,
  //     })

  //     const line = turf.lineString(arrayCoodinates)
  //     const bbox = turf.bbox(line)
  //     const bboxPolygon = turf.bboxPolygon(bbox)
  //     const bounds = bboxPolygon.geometry.coordinates
  //     console.log(bounds)

  //     map.fitBounds(bounds[0], { padding: 10 })
  //   }
  // }

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <div className="w-80 mb-2 relative mx-auto w-4/5">
        {listLocation.length > 4 ? (
          <div className="flex justify-between">
            <p className="text-red-500">Chỉ được tạo tối đa 5 địa điểm !</p>
            <Button
              type="submit"
              variant="primary"
              onClick={() => {
                if (isOneLocaion) {
                  data(selectedLocation)
                }
                else {
                  data(listLocation)
                }
                show()
              }}>
              Xong
            </Button>
          </div>
        ) : (
          <form className="mb-2">
            <input
              type="text"
              value={location || ''}
              className="w-80 p-2 pr-10 inline outline-none border border-black whitespace-nowrap overflow-hidden overflow-ellipsis"
              placeholder="Nhập địa chỉ của bạn"
              onChange={(event) => {
                setLocation(event.target.value)
                setShowListLocation(true)
              }}
            />
            <span
              className="absolute top-1.5 left-72"
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
            <div className="absolute inline-block right-0">
              {/* {
                isOneLocaion === true ? null :
                  (<div className="mr-2 inline-block">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={getBound}
                    >
                      Xem toàn bộ các điểm
                    </Button>
                  </div>)
              } */}
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
                Thêm địa điểm
              </Button>
            </div>
          </form>
        )}

        <ul>
          {dataLocation &&
            showListLocation &&
            dataLocation.map((item, index) => {
              return (
                <li
                  key={index}
                  className="cursor-pointer p-2"
                  onClick={() => {
                    setSelectedLocation(item)
                    if (isOneLocaion) {
                      setListLocation([item])
                    }
                    else {
                      if (listLocation.length === 0) {
                        setListLocation([...listLocation, item])
                      }
                      else {
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
        <div id="map" className="absolute" style={{ width: '100%', height: '70vh' }}></div>
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
