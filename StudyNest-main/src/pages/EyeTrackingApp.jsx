import React, { useState, useEffect, useRef } from 'react'
import { Camera, Eye, EyeOff, Activity, Clock, TrendingUp, Settings, Play, Pause, RotateCcw, PictureInPicture } from 'lucide-react';

const EyeTrackingApp = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [attentionStatus, setAttentionStatus] = useState('idle'); // 'focused', 'distracted', 'idle'
  const [focusScore, setFocusScore] = useState(100);
  const [sessionTime, setSessionTime] = useState(0);
  const [distractionEvents, setDistractionEvents] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [mode, setMode] = useState('study'); // 'study' or 'meeting'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const pipVideoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const sessionStartRef = useRef(null);
  const timerRef = useRef(null);
  const workerRef = useRef(null);
  const audioContextRef = useRef(null);
  
  const isTrackingRef = useRef(isTracking);
  const attentionStatusRef = useRef(attentionStatus);
  const soundEnabledRef = useRef(soundEnabled);
  
  // Sync refs
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    attentionStatusRef.current = attentionStatus;
  }, [attentionStatus]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  
  // Initialize Web Worker for background timing with adaptive frame rate
  useEffect(() => {
    const workerScript = `
      let intervalId;
      let frameRate = 100; // Default 10 FPS (100ms interval)
      let isVisible = true;
      let performanceHistory = [];
      
      self.onmessage = (e) => {
        if (e.data === 'start') {
          intervalId = setInterval(() => {
            postMessage('tick');
          }, frameRate);
        } else if (e.data === 'stop') {
          clearInterval(intervalId);
        } else if (e.data.type === 'visibility') {
          isVisible = e.data.value;
          // Adjust frame rate based on visibility
          if (isVisible) {
            frameRate = Math.max(60, frameRate); // Min ~16 FPS when visible
          } else {
            frameRate = Math.min(200, frameRate); // Max 5 FPS when hidden
          }
          // Restart with new frame rate if running
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
              postMessage('tick');
            }, frameRate);
          }
        } else if (e.data.type === 'performance') {
          // Adjust frame rate based on performance
          performanceHistory.push(e.data.value);
          if (performanceHistory.length > 10) {
            performanceHistory.shift();
          }
          
          const avgPerformance = performanceHistory.reduce((sum, val) => sum + val, 0) / performanceHistory.length;
          
          // If average processing time is > 80% of frame interval, reduce frame rate
          if (avgPerformance > frameRate * 0.8) {
            frameRate = Math.min(200, frameRate + 20); // Max 5 FPS
          } else if (avgPerformance < frameRate * 0.3 && frameRate > 60) {
            frameRate = Math.max(60, frameRate - 20); // Min ~16 FPS
          }
          
          // Restart with new frame rate if running
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
              postMessage('tick');
            }, frameRate);
          }
        }
      };
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (e) => {
      if (e.data === 'tick') {
        predictWebcam();
      }
    };

    // Cleanup
    return () => {
      workerRef.current.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // Handle Page Visibility API to optimize background processing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'visibility', value: !document.hidden });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Attention tracking state
  const attentionDataRef = useRef({
    gazeHistory: [],
    eyeClosedFrames: 0,
    noFaceFrames: 0,
    distractedFrames: 0,
    focusedFrames: 0,
    lastAlertTime: 0,
    lastScoreUpdate: 0
  });

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const setupFaceLandmarker = async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/+esm"
        );
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        console.log("FaceLandmarker initialized");
      } catch (error) {
        console.error('Error loading Face Landmarker:', error);
      }
    };
    
    setupFaceLandmarker();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Attach stream to video when calibrated (video element exists)
  useEffect(() => {
    if (isCalibrated && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    }
  }, [isCalibrated]);

  // Session timer
  useEffect(() => {
    if (isTracking) {
      sessionStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      streamRef.current = stream;
      setCameraReady(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please grant camera permissions.');
    }
  };

  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && faceLandmarkerRef.current && canvas) {
        // Ensure video is ready
        if (video.readyState < 2) return;

        const detectStartTime = performance.now();
        
        // Get current visibility state
        const isVisible = !document.hidden;
        
        // Optimize canvas operations for visibility
        if (isVisible) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
        const ctx = canvas.getContext('2d');
        
        // Process face detection
        const results = faceLandmarkerRef.current.detectForVideo(video, detectStartTime);
        
        // Calculate detection performance
        const detectionTime = performance.now() - detectStartTime;
        
        // Send performance data to worker for adaptive frame rate
        if (workerRef.current) {
          workerRef.current.postMessage({ type: 'performance', value: detectionTime });
        }
        
        // Only clear canvas if visible to save resources
        if (isVisible) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            
            // 1. Get Eye Centers (Iris)
            const leftIris = landmarks[468]; 
            const rightIris = landmarks[473];
            const noseTip = landmarks[1];
            
            // 2. Simple Attention Logic
            const isLookingAway = checkAttention(landmarks, leftIris, rightIris, noseTip);
            const currentStatus = isLookingAway ? 'distracted' : 'focused';

            // Update UI status always
            if (currentStatus !== attentionStatusRef.current) {
                setAttentionStatus(currentStatus);
                
                // Logic depending on tracking state
                if (isTrackingRef.current) {
                     if (currentStatus === 'distracted') {
                         // Log distraction event
                         const event = {
                           time: Date.now(),
                           reason: 'Looking away',
                           timestamp: new Date().toLocaleTimeString()
                         };
                         setDistractionEvents(prev => [event, ...prev].slice(0, 10));
                         
                         // Play sound if enabled
                         if (soundEnabledRef.current && Date.now() - attentionDataRef.current.lastAlertTime > 3000) {
                           playAlertSound();
                           
                           // Send System Notification
                           if (document.hidden && Notification.permission === "granted") {
                             new Notification("⚠️ Distracted!", {
                               body: "Focus on your screen!",
                               icon: "/vite.svg" // Optional icon
                             });
                           }
                           
                           attentionDataRef.current.lastAlertTime = Date.now();
                         }
                     }
                }
                // Update ref immediately to avoid duplicate events
                attentionStatusRef.current = currentStatus;
            }
            
            // Update score if tracking - throttled to reduce re-renders
            if (isTrackingRef.current) {
                const now = Date.now();
                const updateInterval = isVisible ? 200 : 500; // Update more frequently when visible
                
                if (now - attentionDataRef.current.lastScoreUpdate > updateInterval) {
                    const scoreUpdateAmount = isVisible ? 0.1 : 0.05;
                    const scoreDecreaseAmount = isVisible ? 0.5 : 0.25;
                    
                    if (currentStatus === 'focused') {
                        setFocusScore(prev => Math.min(100, prev + scoreUpdateAmount));
                    } else {
                        setFocusScore(prev => Math.max(0, prev - scoreDecreaseAmount));
                    }
                    
                    attentionDataRef.current.lastScoreUpdate = now;
                }
            }
            
            // Only draw points if visible to save resources
            if (isVisible) {
                drawPoints(ctx, leftIris, rightIris, isLookingAway, canvas.width, canvas.height);
            }
        } else {
            // No face detected
            if (isTrackingRef.current) {
                 attentionDataRef.current.noFaceFrames++;
                 if (attentionDataRef.current.noFaceFrames > 30) {
                     if (attentionStatusRef.current !== 'distracted') {
                         setAttentionStatus('distracted');
                         attentionStatusRef.current = 'distracted';
                         
                         const event = {
                           time: Date.now(),
                           reason: 'No face detected',
                           timestamp: new Date().toLocaleTimeString()
                         };
                         setDistractionEvents(prev => [event, ...prev].slice(0, 10));
                     }
                     setFocusScore(prev => Math.max(0, prev - 0.5));
                 }
            }
        }
    }
    
    // Loop handled by Web Worker (see useEffect)
  };

  const checkAttention = (landmarks, leftIris, rightIris, noseTip) => {
    // 1. Calculate Eye Widths (for relative thresholds)
    // This makes the accuracy consistent regardless of how close/far you are from the camera
    const leftEyeWidth = Math.abs(landmarks[33].x - landmarks[133].x);
    const rightEyeWidth = Math.abs(landmarks[362].x - landmarks[263].x);
    const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;

    // Dynamic Thresholds based on eye size (approx 25% deviation is distracted)
    const horizontalThreshold = avgEyeWidth * 0.25; 
    const verticalThreshold = avgEyeWidth * 0.20;
    const noseThreshold = 0.15; // Stricter head turn check (15% of screen)

    // 2. Left Eye Check
    const leftEyeCenter = (landmarks[33].x + landmarks[133].x) / 2;
    const leftEyeVerticalCenter = (landmarks[33].y + landmarks[133].y) / 2;
    
    const leftHorizontalDist = Math.abs(leftIris.x - leftEyeCenter);
    const leftVerticalDist = Math.abs(leftIris.y - leftEyeVerticalCenter);
    
    const leftEyeDistracted = leftHorizontalDist > horizontalThreshold || leftVerticalDist > verticalThreshold;

    // 3. Right Eye Check
    const rightEyeCenter = (landmarks[362].x + landmarks[263].x) / 2;
    const rightEyeVerticalCenter = (landmarks[362].y + landmarks[263].y) / 2;

    const rightHorizontalDist = Math.abs(rightIris.x - rightEyeCenter);
    const rightVerticalDist = Math.abs(rightIris.y - rightEyeVerticalCenter);

    const rightEyeDistracted = rightHorizontalDist > horizontalThreshold || rightVerticalDist > verticalThreshold;

    // 4. Nose Direction Check (Head Pose)
    const noseDistracted = Math.abs(noseTip.x - 0.5) > noseThreshold;

    // Distracted if ANY indicator is true
    return leftEyeDistracted || rightEyeDistracted || noseDistracted;
  };

  const drawPoints = (ctx, left, right, distracted, width, height) => {
    ctx.fillStyle = distracted ? "#ff4444" : "#00ffcc";
    [left, right].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x * width, pt.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
  };

  // Play alert sound
  const playAlertSound = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Start calibration
  const startCalibration = async () => {
    await startCamera();
    setTimeout(() => {
      setIsCalibrated(true);
    }, 2000);
  };

  // Toggle Picture-in-Picture
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        // Create a video element for PiP if not already created
        if (!pipVideoRef.current) {
          pipVideoRef.current = document.createElement('video');
          pipVideoRef.current.muted = true;
          pipVideoRef.current.playsInline = true;
        }
        
        // Set up the canvas stream for PiP
        const canvas = canvasRef.current;
        if (canvas && canvas.captureStream) {
          const stream = canvas.captureStream(30); // 30 FPS
          pipVideoRef.current.srcObject = stream;
          await pipVideoRef.current.play();
          await pipVideoRef.current.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('Error with Picture-in-Picture:', error);
      alert('Picture-in-Picture not supported or failed to start.');
    }
  };

  // Start tracking
  const startTracking = () => {
    setIsTracking(true);
    setAttentionStatus('focused');
    setFocusScore(100);
    setDistractionEvents([]);
    attentionDataRef.current = {
      gazeHistory: [],
      eyeClosedFrames: 0,
      noFaceFrames: 0,
      distractedFrames: 0,
      focusedFrames: 0,
      lastAlertTime: 0
    };
    
    // Initialize Audio Context on user gesture
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    // Request Notification Permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Start Worker Timer (Background Capable)
    if (workerRef.current) {
      workerRef.current.postMessage('start');
    }
  };

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false);
    
    // Stop Web Worker
    if (workerRef.current) {
      workerRef.current.postMessage('stop');
    }
    
    // Clean up AudioContext if needed
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Reset session
  const resetSession = () => {
    stopTracking();
    setSessionTime(0);
    setFocusScore(100);
    setDistractionEvents([]);
    setAttentionStatus('idle');
    attentionDataRef.current = {
      gazeHistory: [],
      eyeClosedFrames: 0,
      noFaceFrames: 0,
      distractedFrames: 0,
      focusedFrames: 0,
      lastAlertTime: 0,
      lastScoreUpdate: 0
    };
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} transition-colors duration-500`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-orange-500 to-yellow-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} shadow-lg`}>
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Attention Tracker
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-Powered Focus Monitor
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow-lg transition-all hover:scale-105`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all hover:scale-105`}
            >
              {soundEnabled ? '🔔' : '🔕'}
            </button>
          </div>
        </div>

        {!isCalibrated ? (
          /* Calibration Screen */
          <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl'} rounded-3xl p-12 text-center shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-white'}`}>
            <div className="max-w-md mx-auto">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${darkMode ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-orange-400 to-amber-500'} flex items-center justify-center shadow-xl`}>
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Camera Calibration
              </h2>
              <p className={`mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We need access to your camera to track your attention. Please position yourself comfortably in front of the camera.
              </p>
              <button
                onClick={startCalibration}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
   >
                Start Calibration
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Camera Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Camera Preview */}
              <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/70 backdrop-blur-xl border-white'} rounded-3xl p-6 shadow-2xl border`}>
                <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className={`px-4 py-2 rounded-full ${
                      attentionStatus === 'focused' 
                        ? 'bg-green-500/90' 
                        : attentionStatus === 'distracted'
                        ? 'bg-red-500/90'
                        : 'bg-gray-500/90'
                    } backdrop-blur-sm flex items-center gap-2 shadow-lg`}>
                      {attentionStatus === 'focused' ? (
                        <Eye className="w-4 h-4 text-white" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white" />
                      )}
                      <span className="text-white font-semibold text-sm">
                        {attentionStatus === 'focused' ? 'Focused' : attentionStatus === 'distracted' ? 'Distracted' : 'Idle'}
                      </span>
                    </div>
                    
                    <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white font-mono text-sm shadow-lg">
                      {formatTime(sessionTime)}
                    </div>
                  </div>
                  
                  {/* Alert Overlay */}
                  {attentionStatus === 'distracted' && (
                    <div className="absolute inset-0 bg-red-500/20 border-4 border-red-500 animate-pulse pointer-events-none" />
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  {!isTracking ? (
                    <button
                      onClick={startTracking}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopTracking}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Pause className="w-5 h-5" />
                      Stop Tracking
                    </button>
                  )}
                  
                  <button
                    onClick={resetSession}
                    className={`px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2`}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>

                  <button
                    onClick={togglePiP}
                    className={`px-6 py-3 ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2`}
                    title="Keep visual feedback on top of other apps"
                  >
                    <PictureInPicture className="w-5 h-5" />
                    Float
                  </button>
                </div>
              </div>
              
              {/* Hidden Video for PiP Stream */}
              <video ref={pipVideoRef} className="hidden" muted playsInline />

              {/* Mode Selector */}
              <div className={`${darkMode ? 'bg-gray-800/20 backdrop-blur-xl border-gray-700' : 'bg-white/70 backdrop-blur-xl border-white'} rounded-3xl p-6 shadow-2xl border`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tracking Mode
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('study')}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      mode === 'study'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📚 Study Mode
                  </button>
                  <button
                    onClick={() => setMode('meeting')}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      mode === 'meeting'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💼 Meeting Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Focus Score */}
              <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/70 backdrop-blur-xl border-white'} rounded-3xl p-6 shadow-2xl border`}>
                <div className="flex items-center gap-3 mb-4">
                  <Activity className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Focus Score
                  </h3>
                </div>
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${
                    focusScore > 70 ? 'text-green-500' : focusScore > 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {Math.round(focusScore)}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    out of 100
                  </p>
                </div>
                <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                      focusScore > 70 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : focusScore > 40 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${focusScore}%` }}
                  />
                </div>
              </div>

              {/* Session Stats */}
              <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/70 backdrop-blur-xl border-white'} rounded-3xl p-6 shadow-2xl border`}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Session Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Duration</span>
                    <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(sessionTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Distractions</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {distractionEvents.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Focus</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(focusScore)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Distraction Timeline */}
              <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/70 backdrop-blur-xl border-white'} rounded-3xl p-6 shadow-2xl border`}>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className={`w-6 h-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Events
                  </h3>
                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {distractionEvents.length === 0 ? (
                    <div className={`text-center py-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      No distractions yet 🎯
                    </div>
                  ) : (
                    distractionEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          darkMode
                            ? 'bg-gray-700/50 text-gray-200'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{event.reason}</p>
                          <p className="text-xs opacity-70">{event.timestamp}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-semibold">
                          Distracted
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeTrackingApp;
