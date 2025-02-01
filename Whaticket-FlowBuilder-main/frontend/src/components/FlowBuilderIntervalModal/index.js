import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const FlowBuilderIntervalModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [timerSec, setTimerSec] = useState(0)
  const [activeModal, setActiveModal] = useState(false)

  useEffect(() => {
    if(open === 'edit'){
      setTimerSec(data.data.sec)
      setActiveModal(true)
    } else if(open === 'create'){
      setTimerSec(0)
      setActiveModal(true)
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);
  

  const handleClose = () => {
    close(null)
    setActiveModal(false)
  };

  const handleSaveContact = async values => {
    if(!timerSec || parseInt(timerSec)  <= 0){
      return toast.error('Adicione o valor de intervalo')
    }
    if(parseInt(timerSec) > 120){
      return toast.error('Máximo de tempo atingido 120 segundos')
    }
    if(open === 'edit'){
      onUpdate({
        ...data,
        data: { sec: timerSec }
      });
    } else if(open === 'create'){
      onSave({
        sec: timerSec
      })
    }
    handleClose()
    
  };

  return (
    <div className={classes.root}>
      <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {open === 'create' ? `Adicionar um intervalo ao fluxo`: `Editar intervalo`}
        </DialogTitle>        
            <Stack>
              <DialogContent dividers>
                <TextField
                  label={'Tempo em segundos'}
                  name="timer"
                  type="number"
                  value={timerSec}
                  onChange={(e) => setTimerSec(e.target.value)}
                  autoFocus
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  margin="dense"
                  className={classes.textField}
                  style={{ width: "95%" }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={() => handleSaveContact()}
                >
                  {open === 'create' ? `Adicionar` : 'Editar'}                  
                </Button>
              </DialogActions>
            </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderIntervalModal;
