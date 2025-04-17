'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { modelDto } from '../../dto/modelDto';
import axios from 'axios';
import { Buffer } from 'buffer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader, OrbitControls} from 'three/examples/jsm/Addons.js';
import { useServer } from '@/hooks/useServer';

const InteractiveThreeScene: React.FC<{ model: modelDto | null }> = ({ model }: { model: modelDto | null }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rendererS, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [cameraS, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [sceneS, setScene] = useState<THREE.Scene | null>(null);
  const [controlsS, setControls] = useState<OrbitControls | null>(null);
  const currentUser = useSelector((state: RootState )=>
    state.user.currentUser
  );

  const {postModelCover, apiUrl} = useServer()
  
  function saveAsImage() {
    var imgData;

    try {
      var strMime = "image/jpeg";
      imgData = rendererS?.domElement.toDataURL(strMime);
      return imgData;
      // saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

    } catch (e) {
        console.log(e);
        return;
    }

  }

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    setScene(scene);
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    setCamera(camera);
    const renderer = new THREE.WebGLRenderer({ antialias: true,  preserveDrawingBuffer: true });
    setRenderer(renderer);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0xffffff, 1);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const loader = new GLTFLoader();
    loader.load(
      `${apiUrl}/static/${model?.modelID}/scene.gltf`,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Calculate the bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Calculate the scale factor to fit the model within the camera's view
        const maxSize = Math.max(size.x, size.y, size.z);
        const scaleFactor = 4 / maxSize;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center the model
        model.position.sub(center.multiplyScalar(scaleFactor));

        // Adjust the camera position
        camera.position.z = 5;
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xaaaaaa); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-2, 2, 2);
    directionalLight.lookAt(scene.position);
    scene.add(directionalLight);

    // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(2, -2, -2);
    // directionalLight.lookAt(scene.position);
    // scene.add(directionalLight2);

    camera.position.z = 2;
    camera.position.y = 3;
    camera.position.x = 2;

    setRenderer(renderer);
    setCamera(camera);
    setScene(scene);
    setControls(controls);

    const animate = () => {
      requestAnimationFrame(animate);
      if (scene && camera && renderer && controls) {
        controls.update();
        renderer.render(scene, camera);
      }
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (renderer && camera) {
          renderer.setSize(entry.contentRect.width, entry.contentRect.height);
          camera.aspect = entry.contentRect.width / entry.contentRect.height;
          camera.updateProjectionMatrix();
        }
      }
    });

    resizeObserver.observe(currentMount);

    return () => {
      if (currentMount) {
        
        const img = saveAsImage();
        if(img && model && model.owner.userId === currentUser?.userId){
          let bf = Buffer.from(img.split(',')[1]!, "base64");
          postModelCover(model?.modelID, bf)
        }
        currentMount.removeChild(renderer!.domElement);
      }
      resizeObserver.disconnect();
      scene.clear()
    };
  }, [model, currentUser]);

  if (!model) return <div>Error occurred</div>;
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default InteractiveThreeScene;
