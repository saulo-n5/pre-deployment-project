"use client";
import { useRouter } from "next/navigation";
import styles from "./LinkApp.module.css";

export const LinkApps = ({
  Icon,
  AppName,
  Description,
  Updated,
  CustonColor,
  Link,
}) => {
  const myStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "40px",
    height: "40px",
    borderRadius: "5px",
    backgroundColor: CustonColor,
  };
  const route = useRouter();
  return (
    <div className={styles.BaseLinkApps} onClick={() => route.push(Link)}>
      <div className={styles.IconLayer}>
        <p style={myStyle}>{Icon}</p>
        <p>Updated: {Updated}</p>
      </div>
      <div className={styles.NameLayer}>
        <h3>{AppName}</h3>
        <p>{Description}</p>
      </div>
    </div>
  );
};
