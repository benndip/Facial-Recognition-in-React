/* eslint-disable new-parens */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js'
import './App.css';

const App = () => {
  const videoWidth = 720;
  const videoHeight = 560;
  const [initializing, setInitializing] = useState(false)
  const [currentLabel, setCurrentLabel] = useState('')
  const videoRef = useRef()
  const canvasRef = useRef()

  const handleVideoOnplay = async () => {
    if (initializing) {
      setInitializing(false)
    }

    const labeledDescriptors = await loadLabeledModels()
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)

    canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
    const disPlaySize = {
      width: videoWidth,
      height: videoHeight
    }
    faceapi.matchDimensions(canvasRef.current, disPlaySize);
    setInterval(async () => {

      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, disPlaySize);
      canvasRef.current.getContext("2d").clearRect(0, 0, videoWidth, videoHeight)
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
      })

    },100);

  }


  const loadLabeledModels = () => {
    const labels = ["Benndip", "Queen"]
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          try {
            const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`)
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detection.descriptor)
          } catch (e) {
            console.log("Error e " + e)
          }
        }
        setCurrentLabel(label + 'Face detected')
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models'
      setInitializing(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo)
    }
    loadModels();
  }, [])

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => { videoRef.current.srcObject = stream; }, (err) => console.error(err));
  }

  return (
    <div className="App">
      <span>{initializing ? 'Initializing' : 'Ready'}</span>
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
      <p>{currentLabel}</p>
    </div>
  );
}

export default App;