import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Select, Card } from 'antd';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const WarehouseViewer3D = ({ warehouses }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const warehouseGroupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const initScene = () => {
      // Scene setup
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = new THREE.Color(0xf0f0f0);

      // Camera setup
      const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      cameraRef.current.position.set(20, 15, 20);

      // Renderer setup
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      rendererRef.current.shadowMap.enabled = true;
      containerRef.current.appendChild(rendererRef.current.domElement);

      // Controls setup
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      sceneRef.current.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      sceneRef.current.add(directionalLight);

      // Ground plane
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        roughness: 0.8,
        metalness: 0.2
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      sceneRef.current.add(ground);

      // Warehouse group
      warehouseGroupRef.current = new THREE.Group();
      sceneRef.current.add(warehouseGroupRef.current);

      // Grid helper
      const gridHelper = new THREE.GridHelper(100, 100);
      sceneRef.current.add(gridHelper);

      // Performance stats
      const stats = Stats();
      containerRef.current.appendChild(stats.dom);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controlsRef.current.update();
        stats.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      };
      animate();
    };

    initScene();

    // Cleanup
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  // Create warehouse mesh
  const createWarehouse = (warehouse) => {
    const {
      length = 10,
      width = 8,
      height = 4,
      x = 0,
      z = 0,
      sections = []
    } = warehouse;

    const group = new THREE.Group();

    // Main structure
    const buildingGeometry = new THREE.BoxGeometry(width, height, length);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.8
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Sections
    sections.forEach(section => {
      const sectionGeometry = new THREE.BoxGeometry(
        section.width,
        section.height,
        section.length
      );
      const sectionMaterial = new THREE.MeshStandardMaterial({
        color: 0x999999
      });
      const sectionMesh = new THREE.Mesh(sectionGeometry, sectionMaterial);
      sectionMesh.position.set(
        x + section.x - width/2,
        section.height/2,
        z + section.z - length/2
      );
      sectionMesh.castShadow = true;
      sectionMesh.receiveShadow = true;
      group.add(sectionMesh);
    });

    return group;
  };

  const loadCustomModel = async (modelUrl) => {
    if (!modelUrl) return null;

    const loader = new GLTFLoader();
    
    try {
      const gltf = await loader.loadAsync(modelUrl);
      const model = gltf.scene;
      
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      model.position.sub(center);
      const scale = 10 / Math.max(size.x, size.y, size.z);
      model.scale.multiplyScalar(scale);
      
      return model;
    } catch (error) {
      console.error('Error loading model:', error);
      return null;
    }
  };

  // Handle warehouse selection
  const handleWarehouseSelect = async (warehouseId) => {
    if (!warehouseGroupRef.current || !sceneRef.current) return;

    // Clear existing warehouses
    while (warehouseGroupRef.current.children.length) {
      warehouseGroupRef.current.remove(warehouseGroupRef.current.children[0]);
    }

    const warehouse = warehouses.find(w => w._id === warehouseId);
    if (warehouse) {
      if (warehouse.modelUrl) {
        const customModel = await loadCustomModel(warehouse.modelUrl);
        if (customModel) {
          warehouseGroupRef.current.add(customModel);
        } else {
          const defaultModel = createWarehouse(warehouse);
          warehouseGroupRef.current.add(defaultModel);
        }
      } else {
        const defaultModel = createWarehouse(warehouse);
        warehouseGroupRef.current.add(defaultModel);
      }
      
      // Reset camera position
      cameraRef.current.position.set(20, 15, 20);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative">
      {/* Warehouse selector */}
      <Card className="absolute top-4 left-4 z-10">
        <Select
          placeholder="Select Warehouse"
          onChange={handleWarehouseSelect}
          className="w-48"
        >
          {warehouses.map((warehouse) => (
            <Select.Option key={warehouse._id} value={warehouse._id}>
              {warehouse.name}
            </Select.Option>
          ))}
        </Select>
      </Card>

      {/* 3D container */}
      <div 
        ref={containerRef} 
        className="h-[600px] w-full"
        style={{ background: '#f0f0f0' }}
      />
    </div>
  );
};

export default WarehouseViewer3D; 