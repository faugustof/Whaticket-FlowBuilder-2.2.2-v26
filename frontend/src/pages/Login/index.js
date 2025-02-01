import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Helmet } from "react-helmet";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100vw",
		height: "100vh",
		background: theme.mode === "light" ? theme.palette.light : theme.palette.dark,
		backgroundRepeat: "no-repeat",
		backgroundSize: "100% 100%",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
	},
	paper: {
		backgroundColor: theme.mode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.2)",
		backdropFilter: "blur(10px)",
		boxShadow: theme.mode === "light" ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "0 4px 6px rgba(255, 255, 255, 0.2)",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "55px 30px",
		borderRadius: "12.5px",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.primary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	powered: {
		color: "white",
	},
	logoImg: {
		width: "100%",
		maxWidth: "350px",
		height: "auto",
		maxHeight: "120px",
		margin: "0 auto",
		content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")",
	},
	iconButton: {
		position: "absolute",
		top: 10,
		right: 10,
		color: theme.mode === "light" ? "black" : "white",
	},
}));

const Login = () => {
	const classes = useStyles();
	const { colorMode } = useContext(ColorModeContext);
	const { appLogoFavicon, appName, mode } = colorMode;
	const [user, setUser] = useState({ email: "", password: "" });
	const [allowSignup, setAllowSignup] = useState(false);
	const { getPublicSetting } = useSettings();
	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = (e) => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = (e) => {
		e.preventDefault();
		handleLogin(user);
	};

	useEffect(() => {
		getPublicSetting("allowSignup")
			.then((data) => {
				setAllowSignup(data === "enabled");
			})
			.catch((error) => {
				console.log("Error reading setting", error);
			});
	}, []);

	return (
		<>
			<Helmet>
				<title>{appName || "WORKZAP"}</title>
				<link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
			</Helmet>
			<div className={classes.root}>
				<Container component="main" maxWidth="xs">
					<CssBaseline />
					<div className={classes.paper}>
						<IconButton className={classes.iconButton} onClick={colorMode.toggleColorMode}>
							{mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
						</IconButton>
						<div>
							<img className={classes.logoImg} alt="logo" />
						</div>
						<form className={classes.form} noValidate onSubmit={handlSubmit}>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="email"
								label={i18n.t("login.form.email")}
								name="email"
								value={user.email}
								onChange={handleChangeInput}
								autoComplete="email"
								autoFocus
							/>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								name="password"
								label={i18n.t("login.form.password")}
								type="password"
								id="password"
								value={user.password}
								onChange={handleChangeInput}
								autoComplete="current-password"
							/>
							<Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
								{i18n.t("login.buttons.submit")}
							</Button>
							{allowSignup && (
								<Grid container>
									<Grid item>
										<Link href="#" variant="body2" component={RouterLink} to="/signup">
											{i18n.t("login.buttons.register")}
										</Link>
									</Grid>
								</Grid>
							)}
						</form>
					</div>
				</Container>
			</div>
		</>
	);
};

export default Login;
