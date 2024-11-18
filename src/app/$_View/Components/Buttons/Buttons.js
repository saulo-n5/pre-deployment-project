"use client";

import styles from "./Buttons.module.css";
import { IoMdAddCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { MdInstallDesktop } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { TbFileCertificate } from "react-icons/tb";
import { FaPlay } from "react-icons/fa6";
import { BsPrinterFill } from "react-icons/bs";

import {
  CreateComponent,
  CreateNewDevice,
  CreateNewStandAloneSerialNumber,
  GetDeviceByStationID,
  PatchDeviceData,
} from "@/app/$Controllers/RDS";
import {
  ConnectSerialPort,
  InstallingNewSerialOnDevice,
  InstallNewSerialOnDevice,
  InstallSerialPCB,
  SeeStationID,
  ZEBRAPrinter,
} from "@/app/$Controllers/Generals";
import { FaProjectDiagram } from "react-icons/fa";

//create new part number submit
export const ButtonCreatePartNumber = ({ action, data }) => {
  return (
    <button className={styles.ButtonBase} onClick={() => action(data)}>
      <IoMdAddCircle size={20} />
      Create
    </button>
  );
};

//cancel button
export const ButtonCancel = ({ action }) => {
  return (
    <button className={styles.ButtonBase} onClick={() => action(false)}>
      <MdCancel size={20} />
      Cancel
    </button>
  );
};

//open modal create part number
export const ButtonModalCreatePartNumber = ({ action }) => {
  return (
    <button className={styles.ButtonBase} onClick={() => action(true)}>
      <IoMdAddCircleOutline size={20} />
      Create
    </button>
  );
};

// Modal Open: install modal serial number
export const ButtonModalInstallSerialtNumber = ({ action, create }) => {
  return (
    <button
      className={styles.ButtonBase}
      onClick={() => {
        action(true);
      }}
      type="submit"
    >
      <MdInstallDesktop size={20} />
      Install Serial
    </button>
  );
};

// Modal function: install modal serial on device
export const ButtonInstallSerialtNumberOnDevice = ({
  useDescription,
  useFWVersion,
  setModalDone,
  closeModal,
  loading,
  setModalWarning,
}) => {
  return (
    <button
      className={styles.ButtonBase}
      id="ButtonInstallSerialNumberOnDevice"
      onClick={() => {
        loading(true),
          InstallingNewSerialOnDevice(useDescription, useFWVersion)
            .then((a) => {
              // Patch on database
              if (a.id) {
                PatchDeviceData(a.id, {
                  serial_number: a.serial,
                  part_number: a.part_number,
                }).then(() => {
                  setModalDone(true), closeModal(false), loading(false);
                });
              } else {
                setModalWarning(a), loading(false);
              }
            })
            .catch((e) => {
              setModalWarning(e), loading(false);
            });
      }}
    >
      <MdInstallDesktop size={20} />
      Install
    </button>
  );
};

// CreateNewDevice({ part_number: useDescription }).then((a) => {
//   // console.log(a);
//   ConnectSerialPort(
//     a.serial_number,
//     a.part_number,
//     useFWVersion,
//     a.id
//   ).then(() => {
//     setModalDone(true), closeModal(false), loading(false);
//   });
// });

//Install a new serial number on pcb and create a new component in RDS
export const ButtonInstallSerialtNumberOnPCB = ({
  useDescription,
  useFWVersion,
  loading,
  closeModal,
}) => {
  return (
    <button
      className={styles.ButtonBase}
      id="InstallOnPCB"
      onClick={() => {
        loading(true),
          CreateNewStandAloneSerialNumber(useDescription.id).then((a) => {
            CreateComponent({
              part_number: `${useDescription.part_number}`,
              additional_info: { hw_rev: `${useFWVersion}` },
              serial_number: a,
            }).then((e) => {
              InstallSerialPCB(e.serial_number, e.part_number, useFWVersion)
                .then((e) => {
                  loading(false), closeModal(false);
                })
                .catch((e) => window.location.reload());
            });
          });
      }}
    >
      <MdInstallDesktop size={20} />
      Install on PCB
    </button>
  );
};

// Delete Part Number
export const ButtonDeletePartNumber = ({ action }) => {
  return (
    <button
      className={styles.ButtonBaseDelete}
      onClick={() => {
        action();
      }}
    >
      <MdDelete size={20} />
      Delete
    </button>
  );
};

// Create a new Certificate on AWS
export const ButtonCreateCertificate = ({ action, create }) => {
  return (
    <button
      style={{ width: "50%" }}
      className={styles.ButtonBase}
      onClick={() => action(true)}
    >
      <TbFileCertificate size={20} />
      New Certificate
    </button>
  );
};

// Create a new Certificate on AWS
export const ButtonChemBadgeRealtime = () => {
  return (
    <button
      style={{ width: "12%" }}
      className={styles.ButtonBase}
      id="buttonTeste"
    >
      <FaPlay size={20} />
      Run
    </button>
  );
};

// Print Zebra Printer
export const ButtonZebraPrinter = ({
  data,
  loading,
  ModalClose,
  rowsToPrint,
}) => {
  return (
    <button
      // style={{ marginRight: 0 }}
      className={styles.ButtonBase}
      id="ZebraPrinter"
      onClick={() => {
        loading(true),
          ZEBRAPrinter(data, rowsToPrint).then((e) => {
            loading(false), ModalClose();
          });
      }}
    >
      <BsPrinterFill size={20} />
      Print
    </button>
  );
};

// Print modal
export const ButtonPrintModal = ({ open }) => {
  return (
    <button
      // style={{ width: "12%" }}
      className={styles.ButtonBase}
      onClick={() => {
        open(true);
      }}
    >
      <BsPrinterFill size={20} />
      Print
    </button>
  );
};

// pre-deployment-project functions
export const SelectProjectButton = ({
  action,
  myView,
  projectSelectedData,
  ownLayers,
}) => {
  const { useView } = useContext(DataContext);
  return (
    <button
      className={styles.ButtonBase}
      style={{ marginRight: "1em" }}
      onClick={() => {
        const handleFetchingSavedProjects = async (data) => {
          return new Promise((resolve) => {
            const AllayersLength = data.length;

            for (let i = 0; i < AllayersLength; i++) {
              if (data[i].title.includes("Device")) {
                SavedProject_Devices(data[i], useView).then((e) =>
                  ownLayers(e)
                );
              }
              if (data[i].title.includes("Sketch")) {
                SavedProject_Sketch(data[i], useView).then((e) => ownLayers(e));
              }
              if (data[i].title.includes("LTE Coverge Map")) {
                SavedProject_Polygon(data[i], useView);
                GoToPositionSavedProject(data[i], useView).then((e) =>
                  ownLayers(e)
                );
              }
            }
          });
        };
        handleFetchingSavedProjects(projectSelectedData, useView);
        action(false);
      }}
    >
      <FaProjectDiagram />
      Select
    </button>
  );
};

export const CancelButton = ({ action, clear }) => {
  return (
    <button className={styles.ButtonBase} onClick={() => { action("Projects") }}>
      <FaProjectDiagram />
      Cancel
    </button>
  );
};
