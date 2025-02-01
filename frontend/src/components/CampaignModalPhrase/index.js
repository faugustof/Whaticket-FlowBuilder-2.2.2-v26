import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { i18n } from "../../translate/i18n";
import moment from "moment";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import { Autocomplete, Checkbox, Chip, Stack } from "@mui/material";

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

const CampaignModalPhrase = ({ open, onClose, FlowCampaignId, onSave }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  const [dataItem, setDataItem] = useState({
    name: "",
    phrase: ""
  });

  const [dataItemError, setDataItemError] = useState({
    name: false,
    flowId: false,
    phrase: false
  });

  const [flowSelected, setFlowSelected] = useState();
  const [flowsData, setFlowsData] = useState([]);
  const [flowsDataComplete, setFlowsDataComplete] = useState([]);

  const [selectedWhatsapp, setSelectedWhatsapp] = useState("")
  const [whatsAppNames, setWhatsAppNames] = useState([])
  const [whatsApps, setWhatsApps] = useState([])
  const [whatsAppSelected, setWhatsAppSelected] = useState({})

  const [active, setActive] = useState(true)

  const [loading, setLoading] = useState(true);

  const getFlows = async () => {
    const flows = await api.get("/flowbuilder");
    setFlowsDataComplete(flows.data.flows);
    setFlowsData(flows.data.flows.map(flow => flow.name));
    return flows.data.flows;
  };

  const detailsPhrase = async flows => {
    setLoading(true);
    await api.get(`/flowcampaign/${FlowCampaignId}`).then(res => {
      console.log("dete", res.data);
      setDataItem({
        name: res.data.details.name,
        phrase: res.data.details.phrase
      });
      setActive(res.data.details.status)
      const nameFlow = flows.filter(
        itemFlows => itemFlows.id === res.data.details.flowId
      );
      if (nameFlow.length > 0) {
        setFlowSelected(nameFlow[0].name);
      }
      setLoading(false);
    });
  };

  const handleClose = () => {
    onClose();
  };

  const openModal = async () => {
    const flows = await getFlows();
    if (FlowCampaignId) {
      await detailsPhrase(flows);
    } else {
      clearData();
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true)
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => {
            setWhatsApps(data)
          })
      }
      fetchContacts();
      setLoading(false)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [])


  useEffect(() => {
    setLoading(true)
    if (open === true) {
      openModal();
    }
  }, [open]);

  const clearErrors = () => {
    setDataItemError({
      name: false,
      flowId: false,
      whatsappId: false,
      phrase: false
    });
  };

  const clearData = () => {
    setFlowSelected();
    setDataItem({
      name: "",
      phrase: ""
    });
  };

  const applicationSaveAndEdit = () => {
    let error = 0;
    if (dataItem.name === "" || dataItem.name.length === 0) {
      setDataItemError(old => ({ ...old, name: true }));
      error++;
    }
    if (!flowSelected) {
      setDataItemError(old => ({ ...old, flowId: true }));
      error++;
    }
    if (dataItem.phrase === "" || dataItem.phrase.length === 0) {
      setDataItemError(old => ({ ...old, phrase: true }));
      error++;
    }
    if(!selectedWhatsapp){
      setDataItemError(old => ({ ...old, whatsappId: true }))
    }

    if (error !== 0) {
      return;
    }

    const idFlow = flowsDataComplete.filter(
      item => item.name === flowSelected
    )[0].id;

    const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null

    if (FlowCampaignId) {
      api.put("/flowcampaign", {
        id: FlowCampaignId,
        name: dataItem.name,
        flowId: idFlow,
        whatsappId: whatsappId,
        phrase: dataItem.phrase,
        status: active
      })
      onClose();
      onSave('ok');
      toast.success("Frase alterada com sucesso!");
      clearData();
    } else {
      api.post("/flowcampaign", {
        name: dataItem.name,
        flowId: idFlow,
        whatsappId: whatsappId,
        phrase: dataItem.phrase
      });
      onClose();
      onSave('ok');
      toast.success("Frase criada com sucesso!");
      clearData();
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {campaignEditable ? (
            <>
              {FlowCampaignId
                ? `Editar campanha com fluxo por frase`
                : `Nova campanha com fluxo por frase`}
            </>
          ) : (
            <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
          )}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input type="file" ref={attachmentFile} />
        </div>
        {!loading && (
          <Stack sx={{ padding: "52px" }}>
            <Stack sx={{ gap: "14px" }}>
              <Stack gap={1}>
                <Typography>Nome do disparo por frase</Typography>
                <TextField
                  label={""}
                  name="text"
                  variant="outlined"
                  error={dataItemError.name}
                  defaultValue={dataItem.name}
                  margin="dense"
                  onChange={e => {
                    setDataItem(old => {
                      let newValue = old;
                      newValue.name = e.target.value;
                      return newValue;
                    });
                  }}
                  className={classes.textField}
                  style={{ width: "100%" }}
                />
              </Stack>
              <Stack gap={1}>
                <Typography>Escolha um fluxo</Typography>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  value={flowSelected}
                  error={dataItemError.flowId}
                  defaultValue={flowSelected}
                  options={flowsData}
                  onChange={(event, newValue) => {
                    setFlowSelected(newValue);
                  }}
                  sx={{ width: "100%" }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      error={dataItemError.flowId}
                      variant="outlined"
                      style={{ width: "100%" }}
                      placeholder="Escolha um fluxo"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        style={{ borderRadius: "8px" }}
                      />
                    ))
                  }
                />
              </Stack>
              <Stack gap={1}>
                <Select
                  required
                  fullWidth
                  displayEmpty
                  variant="outlined"
                  value={selectedWhatsapp}
                  onChange={(e) => {
                    setSelectedWhatsapp(e.target.value)
                  }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left"
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left"
                    },
                    getContentAnchorEl: null,
                  }}
                  renderValue={() => {
                    if (selectedWhatsapp === "") {
                      return "Selecione uma Conexão"
                    }
                    const whatsapp = whatsApps.find(w => w.id === selectedWhatsapp)
                    return whatsapp.name
                  }}
                >

                  {whatsApps?.length > 0 &&
                    whatsApps.map((whatsapp, key) => (
                      <MenuItem dense key={key} value={whatsapp.id}>
                        <ListItemText
                          primary={
                            <>
                              <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
                                {whatsapp.name} &nbsp; <p className={(whatsapp.status) === 'CONNECTED' ? classes.online : classes.offline} >({whatsapp.status})</p>
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))
                  }
                </Select>
              </Stack>
              <Stack gap={1}>
                <Typography>Qual frase dispara o fluxo?</Typography>
                <TextField
                  label={""}
                  name="text"
                  variant="outlined"
                  error={dataItemError.phrase}
                  defaultValue={dataItem.phrase}
                  margin="dense"
                  onChange={e => {
                    setDataItem(old => {
                      let newValue = old;
                      newValue.phrase = e.target.value;
                      return newValue;
                    });
                  }}
                  className={classes.textField}
                  style={{ width: "100%" }}
                />
              </Stack>
              <Stack direction={'row'} gap={2}>
                <Stack justifyContent={'center'}>
                  <Typography>Status</Typography>
                </Stack>
                <Checkbox checked={active} onChange={() => setActive(old => !old)} />
              </Stack>
            </Stack>
            <Stack
              direction={"row"}
              spacing={2}
              alignSelf={"end"}
              marginTop={"16px"}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  onClose();
                  clearErrors();
                }}
              >
                Cancelar
              </Button>
              {FlowCampaignId ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applicationSaveAndEdit()}
                >
                  Salvar campanha
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applicationSaveAndEdit()}
                >
                  Criar campanha
                </Button>
              )}
            </Stack>
          </Stack>
        )}
        {loading && (
          <Stack
            justifyContent={"center"}
            alignItems={"center"}
            minHeight={"10vh"}
            sx={{ padding: "52px" }}
          >
            <CircularProgress />
          </Stack>
        )}
      </Dialog>
    </div>
  );
};

export default CampaignModalPhrase;
