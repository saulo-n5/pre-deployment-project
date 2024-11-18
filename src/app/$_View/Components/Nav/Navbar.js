"use client";

import styles from "./Navbar.module.css";
import { AiOutlinePoweroff } from "react-icons/ai";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DataContext } from "../../../$Modal/Context/ContextData";
import { LogOutUser } from "@/app/$Controllers/Amplify_Controller";

export const Navbar = () => {
  const { session } = useContext(DataContext);
  const [usePage, setpage] = useState(false);

  const route = useRouter();
  useEffect(() => {
    if (window.location.pathname === "/dashboard") {
      setpage(false);
    } else {
      setpage(true);
    }
  }, []);

  return (
    <div className={styles.BaseNavbar}>
      {usePage == true ? (
        <p className={styles.Return} onClick={() => route.push("/dashboard")}>
          Return
        </p>
      ) : (
        <AiOutlinePoweroff
          size={25}
          className={styles.Exit}
          onClick={() => LogOutUser().then(() => route.push("/"))}
        />
      )}
      <section className={styles.BaseUser}>
        <h1>{session?.tokens.signInDetails.loginId}</h1>
        <Image
          src="/LogoN5_192x192px.png"
          width={30}
          height={30}
          alt="N5 Sensors Logo"
        />
      </section>
    </div>
  );
};
