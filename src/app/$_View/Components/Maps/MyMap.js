"use client";

import React, { useContext, useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import Daylight from "@arcgis/core/widgets/Daylight";
import Expand from "@arcgis/core/widgets/Expand";
import "@arcgis/core/assets/esri/themes/dark/main.css";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Circle from "@arcgis/core/geometry/Circle";
import cryptoRandomString from "crypto-random-string";
import Viewshed from "@arcgis/core/analysis/Viewshed";
import ViewshedAnalysis from "@arcgis/core/analysis/ViewshedAnalysis";
import ViewshedLayer from "@arcgis/core/layers/ViewshedLayer.js";
import Measurement from "@arcgis/core/widgets/Measurement.js";
import ElevationProfile from "@arcgis/core/widgets/ElevationProfile.js";
import ElevationProfileLineInput from "@arcgis/core/widgets/ElevationProfile/ElevationProfileLineInput.js";

import {
  checkWebGLCapabilities,
  CreateCircleAroundDevice,
  CreateSketch,
  displayPolygonsOnMap,
  fetchDataForPolygon,
  getClientHardwareInfo,
  handleModalSelectProjectReturns,
  handleSketchGeometry,
  KML_CreateDeviceAndCircle,
  KMLFunctionDevices,
  KMLFunctionSketch,
  SaveDescriptionDevice,

} from "@/app/$Controllers/Utils";
import { DataContext } from "@/app/$Modal/Context/ContextData";
import { deleteObject, listObjects } from "@/app/$Controllers/S3";
import Point from "@arcgis/core/geometry/Point";



const MyMap = () => {
  const { useSliderValue, setSliderValue } = useContext(DataContext)
  // getClientHardwareInfo().then(e => console.log(e))
  // checkWebGLCapabilities().then(e => console.log(e))

  // let lastTime = performance.now();
  // let frameCount = 0;

  // function monitorPerformance() {
  //   const now = performance.now();
  //   frameCount++;

  //   if (now - lastTime > 1000) { // Atualiza a cada 1 segundo
  //     console.log(`FPS: ${frameCount}`);
  //     frameCount = 0;
  //     lastTime = now;
  //   }

  //   requestAnimationFrame(monitorPerformance);
  // }

  // monitorPerformance();

  const {
    setView,
    setOwnLayers,
    setMap,
    setModalStartOperation,
    setN5ShieldLoading,
    setSketchVM,
    setGraphicsCircleLayer,
    setGraphicsLayer,
    setSketchLayer,
    setSquareMile,
    setProjectSelected,
    useEnvironmet, setEnvironment,
    setGroundData, useGroundData,
    setDeviceID,
    setDeviceDescription,
    setDeviceName,
    setS3FilesList,
    useS3FilesList
  } = useContext(DataContext);
  const mapDiv = useRef(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const RunningMap = async () => {


      // Layers
      const graphicsCircleLayer = new GraphicsLayer({
        title: "Circle",
        elevationInfo: {
          mode: "on-the-ground"
        }
      });

      const polygonLayer = new GraphicsLayer({
        title: "LTE Coverge Map",
        elevationInfo: {
          mode: "on-the-ground"
        }
      });
      const sketchLayer = new GraphicsLayer({
        title: "Sketch",
        elevationInfo: {
          mode: "on-the-ground"
        }
      });
      const graphicsLayer = new GraphicsLayer({
        title: "Devices",
        elevationInfo: {
          mode: "on-the-ground"
        }
      });

      const map = new Map({
        basemap: "hybrid",
        ground: "world-elevation",
      });

      //Map rendering

      const view = new SceneView({
        map: map,
        container: mapDiv.current,
        ground: "world-elevation",
        viewingMode: "global",
        qualityProfile: "high",
        environment: {
          lighting: {
            directShadowsEnabled: true,
            ambientOcclusionEnabled: true,
          },
          atmosphereEnabled: true,
          starsEnabled: true,
          quality: "high",
          background: { type: "color", color: [0, 0, 0, 0] },

        },
        constraints: {
          rotationEnabled: true,
        },
        camera: {
          position: {
            longitude: -98.5795,
            latitude: 39.8283,
            z: 25000000,
          },
        },
        ui: {
          components: ["attribution"],
        },
      });

      const measurementWidget = new Measurement({
        view: view,
        elevationInfo: {
          mode: "on-the-ground"
        }
      });

      const elevationProfile = new ElevationProfile({
        view: view,
        profiles: [{
          type: "ground",          // autocasts as new ElevationProfileLineGround(),
          color: "red",            // display this profile in red
          title: "World elevation" // with a custom label
        }]
      });


      //modals
      const sketchVM = new SketchViewModel({
        layer: graphicsLayer,
        view: view,
        updateOnGraphicClick: true,
        creationMode: "update",
      });

      const sketch = new Sketch({
        layer: sketchLayer,
        view: view,
        creationMode: "update",
        updateOnGraphicClick: true,
      });




      view.when(() => {
        //Transfer data to div
        view.watch("zoom", (newZoom) => {
          const root = document.documentElement;
          if (newZoom > 6) {
            root.style.setProperty("--zoom-color", "rgba(0,0,0,0.7)");
          } else {
            root.style.setProperty("--zoom-color", "rgba(255, 255, 255, 0.05)");
          }
          if (newZoom > 15) {
            root.style.setProperty("--divOn-display", "flex");
          } else {
            root.style.setProperty("--divOn-display", "flex");
          }
        });

        //Creation Tools
        const createPolygon = document.getElementById("CreatePolygon");
        createPolygon.addEventListener("click", async () => {
          sketch.create("polygon");
          view.map.add(sketchLayer);
        });
        const createSquare = document.getElementById("CreateSquare");
        createSquare.addEventListener("click", async () => {
          sketch.create("rectangle");
          view.map.add(sketchLayer);

        });
        const createCircle = document.getElementById("CreateCircle");
        createCircle.addEventListener("click", async () => {
          sketch.create("circle");
          view.map.add(sketchLayer);
        });

        document.getElementById("Measurement").addEventListener("click", () => {
          measurementWidget.clear();  // Limpa medições anteriores
          measurementWidget.activeTool = view.type === "2D" ? "distance" : "direct-line";
          view.ui.add(measurementWidget, "bottom-right");
        });

        document.getElementById("ElevationProfile").addEventListener("click", () => {
          view.ui.add(elevationProfile, "bottom-right");
        })

        document.addEventListener('keydown', (event) => {
          if (event.key == "Escape") {
            measurementWidget.clear();
            view.ui.remove(measurementWidget);
            view.ui.remove(elevationProfile);
          }
        })





        //Starting or loading projects
        const salveViewOnUsestate = document.getElementById(
          "ModalNewProjectButton"
        );
        salveViewOnUsestate.addEventListener("click", async () => {
          setMap(map);
          setView(view);
          setSketchVM(sketchVM)
          setGraphicsCircleLayer(graphicsCircleLayer)
          setGraphicsLayer(graphicsLayer)
          setSketchLayer(sketchLayer)
        });
        const OpenSavedProjectsOnUsestate = document.getElementById(
          "ModalOpenProjectButton"
        );
        OpenSavedProjectsOnUsestate.addEventListener("click", async () => {
          setMap(map);
          setView(view);
          setSketchVM(sketchVM)
          setGraphicsCircleLayer(graphicsCircleLayer)
          setGraphicsLayer(graphicsLayer)
          setSketchLayer(sketchLayer)
        });



        //KML action
        const kmlAction = document.getElementById("kmlAction");
        kmlAction.addEventListener("change", async (event) => {
          setN5ShieldLoading(true)

          const file = event.target.files[0];
          if (file && file.name.endsWith(".kml")) {

            //Creating Sketch on map
            KMLFunctionSketch(file).then(response => {
              CreateSketch(response, sketchLayer, view).then(e => view.goTo({
                target: e[0],
                tilt: 60,
                zoom: 15
              }))
            })

            //Creating devices on map
            KMLFunctionDevices(file).then(response => {
              // console.log(response)
              response.forEach(element => {
                KML_CreateDeviceAndCircle(graphicsCircleLayer, element, graphicsLayer, view)
              })

            }).then((b) => {
              setOwnLayers(map.layers.items.filter((layer, index, self) =>
                index === self.findIndex((e) => e.title === layer.title)
              ));
              setN5ShieldLoading(false)
            })

          } else {
            alert("KML not valid.");
          }
        });

        const SaveProjetc = document.getElementById("saveProject")
        SaveProjetc.addEventListener("click", async () => {
          kmlAction.value = null;

        })



        //----------------------------------------------------------------------------Reloading data on Map
        view.on("click", (event) => {
          view.hitTest(event).then((response) => {
            setN5ShieldLoading(true)

            const SetArray = new Set(map.layers.items.map(e => e))
            const copiedArray = [...SetArray]
            setOwnLayers(copiedArray);

            const data = response.ground.mapPoint
            view.map.ground.queryElevation(data).then(elevation => {
              setEnvironment(elevation)

            }).then(() => setN5ShieldLoading(false))


            view.on('key-down', (event) => {
              if (event.key == 'Delete' || event.key == 'Backspace') {
                const objects = response.results
                listObjects(objects[0].graphic.attributes?.name).then(a => {
                  const data = a.Contents
                  // console.log(objects[0].graphic.attributes?.name)
                  for (let i = 0; i < data.length; i++) {
                    deleteObject(objects[0].graphic.attributes?.name, data[i])
                  }
                })

                for (let i = 0; i < objects.length; i++) {
                  const object = objects[i].graphic
                  graphicsLayer.remove(object)
                  graphicsCircleLayer.remove(object)
                }
              }
            })

          });
        });

        //----------------------------------------------------------------------------Creating ChemNode on map
        const ChemNodeDeviceLTE_button = document.getElementById("ChemNodeDeviceLTE_button");
        ChemNodeDeviceLTE_button.addEventListener("click", async () => {
          const addPoint = async () => {
            sketchVM.pointSymbol = {
              type: "point-3d",
              symbolLayers: [
                {
                  type: "object",
                  resource: {
                    href: "/ChemNode_Device.glb",
                  },
                },
              ],
            };
            sketchVM.create('point')

            const baseNamePoint = cryptoRandomString({ length: 5, type: 'numeric' });

            sketchVM.on('create', (event) => {
              if (event.state == 'start') {
                const graphic = event.graphic
                graphic.attributes = {
                  name: baseNamePoint,
                  Description: "LTE Device",
                  DeviceModel: "ChemNode"
                }
                // console.log(graphic)

              }
              if (event.state == "complete") {
                const graphic = event.graphic

                CreateCircleAroundDevice(graphic, graphicsCircleLayer, baseNamePoint, "ChemNodeLTE")
                view.map.add(graphicsLayer)
                view.map.add(graphicsCircleLayer);

                const SetArray = new Set(map.layers.items.map(e => e))
                const copiedArray = [...SetArray]
                setOwnLayers(copiedArray);
              }
            })
          }

          addPoint()

        });

        //----------------------------------------------------------------------------Creating ChemNode on map
        const ChemNodeDeviceLORA_button = document.getElementById("ChemNodeDeviceLORA_button");
        ChemNodeDeviceLORA_button.addEventListener("click", async () => {
          const addPointLORA = async () => {
            sketchVM.pointSymbol = {
              type: "point-3d",
              symbolLayers: [
                {
                  type: "object",
                  resource: {
                    href: "/ChemNode_Device.glb",
                  },
                },
              ],
            };
            sketchVM.create('point')

            const baseNamePoint = cryptoRandomString({ length: 5, type: 'numeric' });

            sketchVM.on('create', (event) => {
              if (event.state == 'start') {
                const graphic = event.graphic
                graphic.attributes = {
                  name: baseNamePoint,
                  Description: "LORA Device",
                  DeviceModel: "ChemNode LORA"
                }
                // console.log(graphic)

              }
              if (event.state == "complete") {
                const graphic = event.graphic

                CreateCircleAroundDevice(graphic, graphicsCircleLayer, baseNamePoint, "ChemNodeLORA")
                view.map.add(graphicsLayer)
                view.map.add(graphicsCircleLayer);

                const SetArray = new Set(map.layers.items.map(e => e))
                const copiedArray = [...SetArray]
                setOwnLayers(copiedArray);
              }
            })
          }

          addPointLORA()

        });

        //----------------------------------------------------------------------------Creating Gateway on map
        const GatewayDeviceLTE_button = document.getElementById("GatewayDeviceLTE_button");
        GatewayDeviceLTE_button.addEventListener("click", async () => {
          const baseNameGatewayPoint = cryptoRandomString({ length: 5, type: 'numeric' });
          sketchVM.pointSymbol = {
            type: "point-3d",
            symbolLayers: [
              {
                type: "object",
                resource: {
                  href: "/ChemNode_Device.glb",
                },
              },
            ],
          };

          // Cria um ponto ao clicar
          sketchVM.create("point");

          sketchVM.on("create", (event) => {
            if (event.state == "start") {
              event.graphic.attributes = {
                name: baseNameGatewayPoint,
                Description: "LTE Gateway Device",
                DeviceModel: "Gateway"
              }
            }

            if (event.state === "complete") {
              const data = event.graphic.geometry
              view.map.ground.queryElevation(event.graphic.geometry).then(e => {
                if (event.graphic.attributes.name == baseNameGatewayPoint) {

                  const viewshedAnalysis = new ViewshedAnalysis({
                    viewsheds: [
                      new Viewshed({
                        observer: new Point({
                          spatialReference: {
                            latestWkid: e.geometry.spatialReference.latestWkid,
                            wkid: e.geometry.spatialReference.wkid
                          },
                          x: e.geometry.x,
                          y: e.geometry.y,
                          z: e.geometry.z + 70
                        }),
                        farDistance: 4828.03, //3 miles
                        heading: 64,
                        tilt: 84,
                        horizontalFieldOfView: 360,
                        verticalFieldOfView: 120,
                        visibleAreaColor: [0, 255, 0, 0.05],
                        obstructedAreaColor: [255, 0, 0, 0.05],
                      })
                    ]
                  });

                  const viewshedLayer = new ViewshedLayer({
                    source: viewshedAnalysis,
                    title: "Gateway Viewshed",
                    name: baseNameGatewayPoint
                  });


                  view.map.add(viewshedLayer);
                }
              })
              view.map.add(graphicsLayer)

              const SetArray = new Set(map.layers.items.map(e => e))
              const copiedArray = [...SetArray]
              setOwnLayers(copiedArray);

            }
          });

        });



        //Creating new Sketch
        sketch.on("create", (event) => {
          if (event.state === "complete") {
            const graphic = event.graphic;
            const geometry = graphic.geometry;
            const area = geometryEngine.geodesicArea(geometry, "square-miles");
            // console.log(`Área: ${area.toFixed(2)} milhas quadradas`);

            graphic.symbol = {
              geometry: geometry,
              type: "simple-fill",
              color: [255, 255, 0, 0.1],
              outline: {
                color: [255, 255, 0, 1],
                width: 2,
              },
            }
            sketchLayer.add(graphic)
          }
        });



        sketch.on("update", (event) => {
          if (event.state === "complete" && event.graphics.length) {
            setN5ShieldLoading(true)

            const graphic = event.graphics[0].geometry;
            const area = geometryEngine.geodesicArea(graphic, "square-miles");
            // console.log(`Área: ${area.toFixed(2)} milhas quadradas`);
            setSquareMile(area.toFixed(2))
            //update LTE data
            if (area < 200.00) {
              const myGeometry = event.graphics[0].geometry;
              handleSketchGeometry(myGeometry).then((geometry) => {
                setSquareMile(area.toFixed(2)),
                  fetchDataForPolygon(geometry).then((polygons) => {
                    displayPolygonsOnMap(polygons, polygonLayer).then((b) => {

                      setOwnLayers(map.layers.items.filter((layer, index, self) =>
                        index === self.findIndex((e) => e.title === layer.title)
                      ));
                    }).then((e) => { })
                    view.map.add(polygonLayer)
                  }).then(() => setN5ShieldLoading(false))
              })
            } else {
              alert("Warning: we only render LTA data below 200.00 square miles.")
            }
          }
        });

        let deviceAttribute = ''
        let deviceID = ''
        let deviceDescription = ''
        sketchVM.on('update', (event) => {
          if (event.state === 'start') {
            if (event.graphics[0].layer.title == "Devices") {
              setGroundData("Open")
              deviceAttribute = event.graphics[0].attributes.name
              setDeviceName(event.graphics[0].attributes.name)
              setDeviceID(event.graphics[0].attributes.DeviceModel)
              setDeviceDescription(event.graphics[0].attributes.Description)

              listObjects(deviceAttribute).then(b => setS3FilesList(b.Contents))
              if (window.innerHeight <= 596) {
                const SaveProjectsBase = document.getElementById("SaveProjectsBase");
                SaveProjectsBase.style.display = "none";

                const KMLBase = document.getElementById("KMLBase");
                KMLBase.style.display = "none";

              }
            }
          }

          if (event.state === "complete") {
            deviceID = document.getElementById("DeviceId").value
            deviceDescription = document.getElementById("DeviceDescription").value
            SaveDescriptionDevice(event, deviceID, deviceDescription, deviceAttribute).then(() => { setGroundData() })



            if (window.innerHeight <= 596) {
              const elements = document.getElementById("SaveProjectsBase");
              elements.style.display = "block";

              const KMLBase = document.getElementById("KMLBase");
              KMLBase.style.display = "block";

            }

            //update circles
            const device = event.graphics
            const allCircles = graphicsCircleLayer.graphics.items
            allCircles.forEach(element => {
              if (device[0].attributes.name == element.attributes.name && element.attributes.description == 'small-circle') {
                //small circle
                const updatedPoint = device[0].geometry;
                const smallCircleGeometry = new Circle({
                  center: updatedPoint,
                  radius: 10, // 10 metros
                  radiusUnit: "meters",
                });
                element.geometry = smallCircleGeometry;
              }

              if (device[0].attributes.name == element.attributes.name && element.attributes.description == 'square-mile-circle') {
                const updatedPoint = device[0].geometry;

                const updatedCircleGeometry = new Circle({
                  center: updatedPoint,
                  radius: 1.60934,
                  radiusUnit: "kilometers",
                });

                element.geometry = updatedCircleGeometry;
              }
            })

            //updating Gateway analysis on the map
            // console.log(parseFloat(squareMile))
            view.map.layers.forEach(response => {
              if (response.name == event.graphics[0].attributes.name) {
                const data = response.destroy()
                if (!data) {
                  view.map.ground.queryElevation(event.graphics[0].geometry).then(result => {
                    const viewshedAnalysis = new ViewshedAnalysis({
                      viewsheds: [
                        new Viewshed({
                          observer: new Point({
                            spatialReference: {
                              latestWkid: result.geometry.spatialReference.latestWkid,
                              wkid: result.geometry.spatialReference.wkid
                            },
                            x: result.geometry.x,
                            y: result.geometry.y,
                            z: result.geometry.z + 70
                          }),
                          farDistance: 4828.03, //4828.03, 3 miles
                          heading: 64,
                          tilt: 84,
                          horizontalFieldOfView: 360,
                          verticalFieldOfView: 120,
                          visibleAreaColor: [0, 255, 0, 0.05],
                          obstructedAreaColor: [255, 0, 0, 0.05],
                        })
                      ]
                    });

                    const viewshedLayer = new ViewshedLayer({
                      source: viewshedAnalysis,
                      title: "Gateway Viewshed",
                      name: event.graphics[0].attributes.name
                    });

                    view.map.add(viewshedLayer);
                  })
                }
              }
            })
          }
        })



        const RemoveAllButton = document.getElementById("removeAll");
        RemoveAllButton.addEventListener("click", async () => {
          const removeAll = async () => {
            setSquareMile()
            polygonLayer.removeAll()
            graphicsCircleLayer.removeAll()
            sketchLayer.removeAll()
            graphicsLayer.removeAll()
            view.map.layers.removeAll()
            setProjectSelected()

            // console.log("remove all")
            setOwnLayers();
            handleModalSelectProjectReturns(view, setModalStartOperation);
          }
          removeAll()
        });
      });

      // view.ui.add(daylightExpand, "bottom-left");

      return () => {
        document.getElementById("ChemNodeDeviceLTE_button").removeEventListener('click', addPoint)
        document.getElementById("removeAll").removeEventListener('click', removeAll)
        if (view) {
          view.destroy();
        }
      };

    }
    RunningMap()
  }, []);

  return <div ref={mapDiv} style={{ height: "100%", width: "100%" }}></div>;
};

export default MyMap;
