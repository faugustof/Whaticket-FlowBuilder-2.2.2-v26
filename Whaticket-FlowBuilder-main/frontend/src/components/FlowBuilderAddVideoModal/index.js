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
import Compressor from "compressorjs";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Checkbox, Stack } from "@mui/material";

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

const FlowBuilderAddVideoModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [record, setRecord] = useState(false);

  const [preview, setPreview] = useState();

  const [labels, setLabels] = useState({
    title: "Adicionar video ao fluxo",
    btn: "Adicionar"
  });

  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar video",
        btn: "Salvar"
      });
      setPreview(process.env.REACT_APP_BACKEND_URL + '/public/' + data.data.url)
      setRecord(data.data.record)
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar video ao fluxo",
        btn: "Adicionar"
      });
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
        data: { url: data.data.url,
        record: record }
      });
      return;
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,

            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            }
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        await api.post("/flowbuilder/audio", formData).then(res => {
          handleClose();
          onSave({
            url: res.data.name,
          });
          toast.success("Audio adicionada com sucesso!");
          setLoading(false);
          setMedias([]);
          setPreview();
        });
      }, 1000);
    }
  };

  const handleChangeMedias = e => {
    if (!e.target.files) {
      return;
    }

    if(e.target.files[0].size > 20000000){
      toast.error("Arquivo é muito grande! 20MB máximo")
      return
    }

    const selectedMedias = Array.from(e.target.files);
    setPreview((URL.createObjectURL(e.target.files[0])));
    setMedias(selectedMedias);
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
          <DialogContent dividers>
            <Stack gap={"16px"}>
              {preview && (
                <Stack direction={'row'} justifyContent={'center'}>
                <video controls="controls" width="552px">
                  <source src={preview} type="video/mp4" />
                  seu navegador não suporta HTML5
                </video>
                </Stack>
              )}
              {!loading && open !== "edit" && !preview && (
                <>
                <Button variant="contained" component="label">
                  Enviar video
                  <input
                    type="file"
                    accept="video/mp4"
                    disabled={loading}
                    hidden
                    onChange={handleChangeMedias}
                  />
                </Button>
                <Typography>ATENÇÃO! Apenas videos em MP4!</Typography>
                </>
              )}
              {loading && (
                <>
                  <Stack justifyContent={"center"} alignSelf={"center"}>
                    <CircularProgress />
                  </Stack>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            {!loading && (
              <>
                <Button
                  onClick={() => {
                    handleClose();
                    setMedias([]);
                    setPreview();
                  }}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={() => handleSaveContact()}
                >
                  {`${labels.btn}`}
                </Button>
              </>
            )}
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddVideoModal;
