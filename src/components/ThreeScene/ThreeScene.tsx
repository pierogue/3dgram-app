'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { modelDto } from '../../dto/modelDto';
import axios from 'axios';
import { Buffer } from 'buffer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { useServer } from '@/hooks/useServer';
import styled from 'styled-components';
import { IconButton } from '@telegram-apps/telegram-ui';

const CoverButton = styled(IconButton)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: url('../images/photo.svg') no-repeat, var(--tg-theme-accent-text-color);
  background-position: center;
  background-size: 70%;
`;

const FlashOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0;
  pointer-events: none;
  animation: flashAnimation 0.4s ease-out;

  @keyframes flashAnimation {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
  }
`;

const InteractiveThreeScene: React.FC<{ model: modelDto | null }> = ({ model }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [rendererS, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [cameraS, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [sceneS, setScene] = useState<THREE.Scene | null>(null);
  const [controlsS, setControls] = useState<OrbitControls | null>(null);
  const [flash, setFlash] = useState(false); // 👈 Состояние для вспышки

  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  let clock = new THREE.Clock();
  let mixer: THREE.AnimationMixer;

  const { postModelCover, apiUrl } = useServer();

  function saveAsImage(renderer: THREE.WebGLRenderer) {
    try {
      const strMime = "image/jpeg";
      return renderer.domElement.toDataURL(strMime);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  const createThumbnail = () => {
    const img = saveAsImage(rendererS!!);
    if (img && model && model.owner.userId === currentUser?.userId) {
      const bf = Buffer.from(img.split(',')[1]!, "base64");
      postModelCover(model.modelID, bf);
    }

    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    setScene(scene);
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    setCamera(camera);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    setRenderer(renderer);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0xffffff, 1);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    setControls(controls);

    const loader = new GLTFLoader();
    loader.load(
      `${apiUrl}/static/${model?.modelID}/scene.gltf`,
      (gltf) => {
        const loadedModel = gltf.scene;
        scene.add(loadedModel);

        mixer = new THREE.AnimationMixer(loadedModel);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxSize = Math.max(size.x, size.y, size.z);
        const scaleFactor = 4 / maxSize;
        loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        loadedModel.position.sub(center.multiplyScalar(scaleFactor));

        camera.position.set(2, 3, 5);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-2, 2, 2);
    directionalLight.lookAt(scene.position);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);
      if (scene && camera && renderer && controls) {
        controls.update();
        renderer.render(scene, camera);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
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
        currentMount.removeChild(renderer.domElement);
      }
      resizeObserver.disconnect();
      scene.clear();
    };
  }, [model]);

  if (!model) return <div>Error occurred</div>;

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {model.owner.userId === currentUser?.userId && <CoverButton onClick={createThumbnail} />}
      {flash && <FlashOverlay />}
    </div>
  );
};

export default InteractiveThreeScene;
