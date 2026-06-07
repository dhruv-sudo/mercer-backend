import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      // 1. Capture base64 screenshot image format frame from active web canvas stream
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        alert("Webcam not ready yet!");
        setLoading(false);
        return;
      }

      // Convert Base64 frame to structural Blob Object
      const imageBlob = await fetch(imageSrc).then((res) => res.blob());

      // 2. Mocking a placeholder audio binary file record to fulfill the Backend's requirement
      // (For full production implementation, capture audio array buffers via MediaRecorder API)
      const mockAudioBlob = new Blob([new Uint8Array(1000)], { type: "audio/wav" });

      // 3. Assemble Multi-part Form Data payload block
      const formData = new FormData();
      formData.append("image", imageBlob, "frame.jpg");
      formData.append("audio", mockAudioBlob, "audio.wav");

      // 4. Send operational assets to Flask server
      const res = await axios.post("http://localhost:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (error) {
      console.error("Analysis request failed:", error);
      alert(error.response?.data?.error || "Server connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50, fontFamily: "sans-serif" }}>
      <h1>Stroke Risk Detector</h1>
      
      <div style={{ marginBottom: 20 }}>
        <Webcam 
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={400} 
        />
      </div>

      <button 
        onClick={analyze} 
        disabled={loading}
        style={{ fontSize: 20, padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? "Analyzing Specimen..." : "Analyze Risk"}
      </button>

      {result && (
        <div style={{ marginTop: 30, padding: 20, border: "1px solid #ccc", display: "inline-block" }}>
          <h2>Risk Score: {result.risk_score}</h2>
          <h2 style={{ color: result.label === "HIGH RISK" ? "red" : result.label === "MODERATE RISK" ? "orange" : "green" }}>
            Status: {result.label}
          </h2>
          <p>Face Feature Metrics: {result.face_score}</p>
          <p>Voice Feature Metrics: {result.voice_score}</p>
        </div>
      )}
    </div>
  );
}

export default App;
