import React, { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import axios from 'axios'

const Map = () => {
  const [location, setLocation] = useState(null)
  const [dataLocation, setDataLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [listLocation, setListLocation] = useState([])
  const [showListLocation, setShowListLocation] = useState(true)

  useEffect(() => {
    if (location) {
      const getLocation = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_MAPBOX}/${location}.json?proximity=105.777909,21.028412&access_token=${process.env.NEXT_PUBLIC_TOKEN_MAPBOX}`,
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
        zoom: 15,
      })

      listLocation.map((item) => {
        const addMarker = () => {
          const marker = new mapboxgl.Marker()
          const markerPopup = new mapboxgl.Popup()

          markerPopup.setText(`${item.place_name}`)
          marker.setPopup(markerPopup)

          marker.setLngLat([item.center[0], item.center[1]])
          marker.addTo(map)
        }
        map.on('load', addMarker)
      })
    }
  }, [selectedLocation])

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <div className="w-80 m-5 relative">
        {listLocation.length >= 5 ? (
          <span className="text-red-500">Chỉ được tạo tối đa 5 địa điểm !</span>
        ) : (
          <form>
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
              className="absolute right-1.5 top-1.5"
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
                    setListLocation([...listLocation, item])
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
      </div>
      <div id="map" style={{ width: '100vw', height: '80vh' }}></div>
    </>
  )
}

export default Map
