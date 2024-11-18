"use client";

import styles from "./Inputs.module.css";

export const Inputs = ({ data, label }) => {
  return (
    <div className={styles.BaseInputs}>
      <p>{label}</p>
      <input type="text" defaultValue={data} />
    </div>
  );
};
