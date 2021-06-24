/* eslint-disable new-parens */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js'
import canvas from 'canvas'
import './App.css';
import { BrowserRouter, Route, Switch, Router, Link } from 'react-router-dom';


import Login from "./Pages/Login"
import SignIn from './Pages/SignIn';


const App = () => {

  const videoWidth = 370;
  const videoHeight = 560;

  const [initializing, setInitializing] = useState(true)
  const [currentLabel, setCurrentLabel] = useState([])
  const [attendants, setAttendants] = useState([])

  const videoRef = useRef()
  const canvasRef = useRef()
  const watcherRef = useRef()

  function loadLabeledImages() {
    const labels = ['Queen', 'Benndip', 'Peter']
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = []
        for (let i = 1; i <= 6; i++) {
          const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
        // document.body.append(label + ' Faces Loaded | ')
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  const handleVideoOnplay = async () => {
    if (initializing) {
      setInitializing(false)
    }

    const labeledDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)

    if (videoRef.current) {

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
      const disPlaySize = {
        width: videoWidth,
        height: videoHeight
      }
      faceapi.matchDimensions(canvasRef.current, disPlaySize);

      setInterval(async () => {

        try {

          const detections = await faceapi.detectAllFaces(videoRef.current).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
          const resizedDetections = faceapi.resizeResults(detections, disPlaySize);
          canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

          faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections)
          faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections)

          // console.log(detections)

          const results = resizedDetections.map(d => {
            return faceMatcher.findBestMatch(d.descriptor)
          })

          results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvasRef.current)
            console.log(result.toString())
            let newResult = [...currentLabel, result.toString()]
            setCurrentLabel(newResult)
            console.log('This is currentLabel ' + currentLabel.length)
            // reset()
          })
        } catch (error) {
          console.log('Reset to continue')
          //reset()
        }

      }, 1000);
    }
  }


  const startVideo = () => {
    !currentLabel.length > 0
      &&
      new Promise((res, rej) => {
        navigator.mediaDevices.getUserMedia({ video: {} })
          .then((stream) => {
            try {
              videoRef.current.srcObject = stream
            } catch (error) {
              videoRef.current.src = URL.createObjectURL(stream)
            }
            videoRef.current.play()
          })
          .catch(err => {
            throw new Error("Unable to Fetch Stream " + err)
          })
      })
  }

  const startWatcherVideo = () => {
    !currentLabel.length > 0
      &&
      new Promise((res, rej) => {
        navigator.mediaDevices.getUserMedia({ video: {} })
          .then((stream) => {
            try {
              watcherRef.current.srcObject = stream
            } catch (error) {
              watcherRef.current.src = URL.createObjectURL(stream)
            }
            // watcherRef.current.play()
          })
          .catch(err => {
            throw new Error("Unable to Fetch Stream " + err)
          })
      })
  }

  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models'
    setInitializing(true);
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),

      faceapi.loadFaceDetectionModel(MODEL_URL),
      faceapi.loadSsdMobilenetv1Model(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL),
      faceapi.loadFaceRecognitionModel(MODEL_URL)
    ]).then(startVideo)
  }

  const reset = () => {
    setCurrentLabel([])
  }


  useEffect(() => {
    console.log('running again')
    loadModels();
    startWatcherVideo()
  }, [])


  return (
    <div className="App">
      <div className="link" >
        <Link className="links" to="/">SignIn </Link>
        <Link className="links" to="/login">Login</Link>
        <Link className="links" to="/scan">ScanFace</Link>
      </div>

      <Switch>
        <Route path="/" component={SignIn} exact />
        <Route path="/login" component={Login} />
        <Route path="/scan" component={App}>
          <span className="span">{initializing ? 'Initializing' : 'SMILE!'}</span>
          {
            //!currentLabel.length > 0
            // &&
            <div className="video-and-canva">
              <video
                ref={videoRef}
                autoPlay
                muted
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideoOnplay}
              />
              <canvas ref={canvasRef} className="canva" />
            </div>
          }
          <video
            ref={initializing ? watcherRef : videoRef}
            autoPlay
            muted
            height={videoHeight}
            width={videoWidth}
          />
          {/* <span>{currentLabel}</span> */}
          <button onClick={reset}>{currentLabel}</button>
        </Route>
      </Switch>

    </div>
  );
}

export default App;