'use client'
import { HiInformationCircle } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './Login.module.css'


export default function Home() {
    //open forms and components
    const [useFormsEvolution, setFormsEvolution] = useState();
    const [useLoadingComponent, setLoadingComponent] = useState();

    //Login
    const [usePassword, setPassword] = useState("");
    const [useEmail, setEmail] = useState();

    //Management
    const [useLoginError, setLoginError] = useState();
    const [useConfirmCode, setConfirmCode] = useState();

    const route = useRouter();
    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const session = await fetchAuthSession();
                if (session.tokens) {
                    route.push("/dashboard");
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAuth();
    }, [route, fetchAuthSession]);

    const LoginHandler = async (event) => {
        event.preventDefault();
        setLoadingComponent("Loading");
        const response = await LogIn(useEmail, usePassword);

        if (response) {
            async function HandleChange() {
                route.push("/dashboard");
            }
            HandleChange().then(() => setLoadingComponent());
        } else {
            setLoginError("Password or email is incorrect...");
        }
    };

    const NewUserHandler = async (event) => {
        event.preventDefault();
        setLoadingComponent("Loading");
        const response = await handleSignUp(usePassword, useEmail);
        if (response) {
            setFormsEvolution("Confirm Code");
            setLoadingComponent();
        }
    };

    const ConfirmCodeHandler = async (event) => {
        event.preventDefault();
        setLoadingComponent("Loading");
        const response = await handleSignUpConfirmation(useEmail, useConfirmCode);
        if (response) {
            setFormsEvolution();
            setPassword();
            setEmail();
            setLoadingComponent();
        }
    };

    return (
        <div className={styles.BasePage}>
            <main className={styles.Container}>
                <div className={styles.FirstLayer}>
                    <Image
                        className={styles.logo}
                        src="/N5Hub_Lab_white.png"
                        width={170}
                        height={120}
                        alt="Logotype N5Shield"
                    />
                </div>
                <div className={styles.SecondLayer}>
                    <div className={styles.Information}>
                        <p className={styles.InformIcon}>
                            <HiInformationCircle size={35} />
                        </p>
                        <div className={styles.InformationText}>
                            <h2>This is the N5 Sensors environment</h2>
                            <p>To go to the official N5 Sensors webpage:</p>
                            <Link href="https://n5sensors.com">Click here</Link>
                        </div>
                    </div>
                    {!useFormsEvolution && (
                        <div className={styles.BaseForm}>
                            <h1>Login</h1>
                            <form
                                className={useLoginError ? styles.FormError : styles.Form}
                                onSubmit={LoginHandler}
                            >
                                <p>Your Email</p>
                                <input
                                    type="email"
                                    placeholder="your-email@gmail.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <p>Password</p>
                                <input
                                    type="password"
                                    placeholder="New password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="submit">Login</button>
                            </form>
                            <a>{useLoginError}</a>
                            <div className={styles.SignUpDiv}>
                                <p onClick={() => setFormsEvolution("Create Account")}>
                                    Create Account
                                </p>
                            </div>
                            {/* <PasswordRule password={usePassword} /> */}
                        </div>
                    )}
                    {useFormsEvolution == "Create Account" && (
                        <div className={styles.BaseForm}>
                            <h1 style={{ color: "#71D9B3" }}>Create Account</h1>
                            <form className={styles.Form} onSubmit={NewUserHandler}>
                                <p style={{ color: "#71D9B3" }}>Your Email</p>
                                <input
                                    type="email"
                                    placeholder="yourEmail@gmail.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <p style={{ color: "#71D9B3" }}>Password</p>
                                <input
                                    type="password"
                                    placeholder="Enter your new password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button style={{ backgroundColor: "#71D9B3" }} type="submit">
                                    Create Account
                                </button>
                            </form>
                            <div className={styles.SignUpDiv}>
                                <p
                                    onClick={() => {
                                        setFormsEvolution(), setPassword(), setEmail();
                                    }}
                                >
                                    Back to Sign in
                                </p>
                            </div>
                            <PasswordRule password={usePassword} />
                        </div>
                    )}
                    {useFormsEvolution == "Confirm Code" && (
                        <div className={styles.BaseForm}>
                            <h1>Confirm the Code</h1>
                            <form className={styles.Form} onSubmit={ConfirmCodeHandler}>
                                <p>Code</p>
                                <input
                                    type="text"
                                    placeholder="code"
                                    onChange={(e) => setConfirmCode(e.target.value)}
                                />
                                <button type="submit">Confirm</button>
                            </form>
                            <p style={{ width: "50%" }}>We sent a code to your email...</p>
                            <div className={styles.SignUpDiv}>
                                <p
                                    onClick={() => {
                                        setFormsEvolution(), setPassword(), setEmail();
                                    }}
                                >
                                    Back to Sign in
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {useLoadingComponent == "Loading" && <N5PageLoading />}
            </main>
        </div>
    );
}
