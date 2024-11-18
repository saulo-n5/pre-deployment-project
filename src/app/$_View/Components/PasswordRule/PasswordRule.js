import { MdOutlineDone } from "react-icons/md";
import styles from "./PasswordRule.module.css";
import { IoMdClose } from "react-icons/io";

export const PasswordRule = ({ password }) => {
  return (
    <div className={styles.Rules}>
      <h3>Password requirements</h3>
      <p>
        {/\d/.test(password) ? (
          <MdOutlineDone size={15} color="#49BF88" />
        ) : (
          <IoMdClose size={15} color="#F25764" />
        )}
        Contains at least 1 number
      </p>
      <p>
        {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
          <MdOutlineDone size={15} color="#49BF88" />
        ) : (
          <IoMdClose size={15} color="#F25764" />
        )}
        Contains at least 1 special character
      </p>
      <p>
        {password && /[A-Z]/.test(password) ? (
          <MdOutlineDone size={15} color="#49BF88" />
        ) : (
          <IoMdClose size={15} color="#F25764" />
        )}
        Contains at least 1 uppercase letter
      </p>
      <p>
        {password && /[a-z]/.test(password) ? (
          <MdOutlineDone size={15} color="#49BF88" />
        ) : (
          <IoMdClose size={15} color="#F25764" />
        )}
        Contains at least 1 lowercase letter
      </p>
      <p>
        {password?.length >= 8 ? (
          <MdOutlineDone size={15} color="#49BF88" />
        ) : (
          <IoMdClose size={15} color="#F25764" />
        )}
        Password must be at least 8 characters long.
      </p>
    </div>
  );
};
