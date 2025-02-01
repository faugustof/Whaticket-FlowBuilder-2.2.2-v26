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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from "@mui/material";

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

const selectFieldStyles = {
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "#909090"
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
    borderWidth: "thin"
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0000FF",
    borderWidth: "thin"
  }
};

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite um nome!"),
  text: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite uma mensagem!")
});

const FlowBuilderConditionModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [rule, setRule] = useState();

  const [textDig, setTextDig] = useState();

  const [valueCondition, setValueCondition] = useState();

  const [labels, setLabels] = useState({
    title: "Adicionar condição ao fluxo",
    btn: "Adicionar"
  });

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar condição",
        btn: "Salvar"
      });
      setTextDig(data.data.key);
      setRule(data.data.condition);
      setValueCondition(data.data.value);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar condição ao fluxo",
        btn: "Adicionar"
      });
      setTextDig();
      setRule();
      setValueCondition();
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { key: textDig, condition: rule, value: valueCondition }
      });
      return;
    } else if (open === "create") {
      handleClose();
      onSave({
        key: textDig,
        condition: rule,
        value: valueCondition
      });
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">{labels.title}</DialogTitle>
        <Stack>
          <Stack
            dividers
            style={{ height: "250px", gap: "8px", padding: "16px" }}
          >
            <TextField
              label={"Campo da condição (Digiter apenas 1 chave)"}
              rows={7}
              name="text"
              variant="outlined"
              value={textDig}
              onChange={e => setTextDig(e.target.value)}
              className={classes.textField}
              style={{ width: "95%" }}
            />
            <FormControl sx={{ width: "95%" }} size="medium">
              <InputLabel sx={selectFieldStyles} id="demo-simple-select-label">
                Regra de validação
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={rule}
                label="Regra de validação"
                onChange={e => setRule(e.target.value)}
                variant="outlined"
                color="primary"
                sx={selectFieldStyles}
              >
                <MenuItem value={1}> {"=="} </MenuItem>
                <MenuItem value={2}> {">="} </MenuItem>
                <MenuItem value={3}> {"<="} </MenuItem>
                <MenuItem value={4}> {" < "} </MenuItem>
                <MenuItem value={5}> {" > "} </MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={"Valor da condição a ser analisada"}
              rows={7}
              name="text"
              variant="outlined"
              value={valueCondition}
              onChange={e => setValueCondition(e.target.value)}
              className={classes.textField}
              style={{ width: "95%", marginTop: "11px" }}
            />
          </Stack>
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.btnWrapper}
              onClick={() => handleSaveContact()}
            >
              {`${labels.btn}`}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderConditionModal;
