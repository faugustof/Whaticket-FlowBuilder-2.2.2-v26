import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";

import MomentsUser from "../../components/MomentsUser";
// import MomentsQueues from "../../components/MomentsQueues";

import MainHeader from "../../components/MainHeader";
import { Grid, Paper } from "@material-ui/core";
import Title from "../../components/Title";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: "5px",
    maxWidth: "100%"
  },
  mainPaper: {
    display: "flex",
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    alignItems: "center"
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 100,
  },
  chatPapper: {
    display: "flex",
    height: "100%",
  },
  contactsHeader: {
    display: "flex",
    flexWrap: "wrap",
    padding: "0px 6px 6px 6px",
  }
}));

const ChatMoments = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext)
  return (

    user.profile === "user" && user.allowRealTime === "disabled" ?
      <ForbiddenPage />
      :
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container justifyContent="center" alignItems="flex-start">
          <Grid xs={12} sm={8} xl={4} item >
            <Title>{"Painel de Atendimentos"}</Title>
          </Grid>
          <Grid style={{ width: "100%", height: "100vh" }} item >
            <Paper
              className={classes.mainPaper}
              variant="outlined"
              style={{ maxWidth: "100%" }}
            >
              <MomentsUser />
            </Paper>
          </Grid>
        </Grid>
      </MainHeader>
  );
};

export default ChatMoments;
