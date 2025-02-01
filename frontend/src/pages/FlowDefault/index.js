import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";

import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  WebhookOutlined
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Typography
} from "@mui/material";
import FlowBuilderModal from "../../components/FlowBuilderModal";
import {
  colorBackgroundTable,
  colorLineTable,
  colorLineTableHover,
  colorPrimary,
  colorTitleTable,
  colorTopTable
} from "../../styles/styles";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach(contact => {
      const contactIndex = state.findIndex(c => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex(c => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    backgroundColor: "#ffff",
    borderRadius: 12,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles
  }
}));

const FlowDefault = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [configExist, setConfigExist] = useState(false)

  const [flowsData, setFlowsData] = useState([]);
  const [flowsDataObj, setFlowsDataObj] = useState([]);

  const [flowSelectedWelcome, setFlowSelectedWelcome] = useState(null);

  const [flowSelectedPhrase, setFlowSelectedPhrase] = useState(null);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);

 const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  const getFlows = async () => {
    return await api.get("/flowbuilder").then(res => {
      setFlowsData(res.data.flows.map(flow => flow.name));
      setFlowsDataObj(res.data.flows);
      return res.data.flows
    });
  };

  const getFlowsDefault = async (flowData) => {
    await api.get("/flowdefault").then(res => {
      if (res.data.flow?.companyId) {
        setConfigExist(true)
      }
      if (res.data.flow?.flowIdWelcome) {
        const flowName = flowData.filter(item => item.id === res.data.flow.flowIdWelcome)
        if (flowName.length > 0) {
          setFlowSelectedWelcome(flowName[0].name);
        } else {
          setFlowSelectedWelcome()
        }

      }
      if (res.data.flow?.flowIdNotPhrase) {
        const flowName = flowData.filter(item => item.id === res.data.flow.flowIdNotPhrase)
        if (flowName.length > 0) {
          setFlowSelectedPhrase(flowName[0].name);
        } else {
          setFlowSelectedPhrase();
        }

      }
      setLoading(false)
    });
  };

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");

    const onContact = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    }

    socket.on(`company-${companyId}-contact`, onContact);

    getFlows().then(res => {
      getFlowsDefault(res)
    })
    
    return () => {
      socket.disconnect();
    };
  }, []);



  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseOrOpenTicket = ticket => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const handleDeleteWebhook = async webhookId => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then(res => {
        setDeletingContact(null);
        setReloadData(old => !old);
      });
      toast.success("Fluxo excluído com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveDefault = async () => {
    console.log(configExist)

    let idWelcome = flowsDataObj.filter(item => item.name === flowSelectedWelcome)
    let idPhrase = flowsDataObj.filter(item => item.name === flowSelectedPhrase)
    if (idWelcome.length === 0) {
      idWelcome = null
    } else {
      idWelcome = idWelcome[0].id
    }
    if (idPhrase.length === 0) {
      idPhrase = null
    } else {
      idPhrase = idPhrase[0].id
    }

    if (configExist) {
      try {
        await api.put(`/flowdefault`, { flowIdWelcome: idWelcome, flowIdPhrase: idPhrase }).then(res => {
          setDeletingContact(null);
          setReloadData(old => !old);
        });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        await api.post(`/flowdefault`, { flowIdWelcome: idWelcome, flowIdPhrase: idPhrase }).then(res => {
          setDeletingContact(null);
          setReloadData(old => !old);
        });
        toast.success("Fluxos padrões atualizados");
      } catch (err) {
        toastError(err);
      }
    }

  };

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={ticket => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData(old => !old)}
      ></FlowBuilderModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name
            }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={e =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => { }
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <Title>Fluxo padrão</Title>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
      >
        <Stack sx={{ padding: '12px', position: 'relative' }}>
          <Stack sx={{ position: 'absolute', right: 0 }}>
            <Button onClick={() => handleSaveDefault()} variant="contained" sx={{
              backgroundColor: colorPrimary(), '&:hover': {
                backgroundColor: `${colorPrimary()}90`
              }
            }}>Salvar</Button>
          </Stack>
          <Stack gap={'12px'}>
            <Typography fontSize={18} fontWeight={700}>Fluxo de boas vindas</Typography>
            <Typography fontSize={12}>
              Este fluxo é disparado apenas para novos contatos, pessoas que voce
              não possui em sua lista de contatos e que mandaram uma mensagem
            </Typography>
            {!loading && (<Autocomplete
              disablePortal
              id="combo-box-demo"
              value={flowSelectedWelcome}
              options={flowsData}
              onChange={(event, newValue) => {
                setFlowSelectedWelcome(newValue);
              }}
              sx={{ width: "100%" }}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
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
            />)}
            {loading && (<Stack alignSelf={'center'}>
              <CircularProgress sx={{ color: colorPrimary() }} />
            </Stack>)}
          </Stack>

          <Stack gap={'12px'} marginTop={4}>
            <Typography fontSize={18} fontWeight={700}>Fluxo de resposta padrão</Typography>
            <Typography fontSize={12}>
              Resposta Padrão é enviada com qualquer caractere diferente de uma palavra chave. ATENÇÃO! Será disparada se o atendimento ja estiver fechado e passado 6 horas do seu fechamento.
            </Typography>
            {!loading && (<Autocomplete
              disablePortal
              id="combo-box-demo"
              value={flowSelectedPhrase}
              options={flowsData}
              onChange={(event, newValue) => {
                setFlowSelectedPhrase(newValue);
              }}
              sx={{ width: "100%" }}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
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
            />)}
            {loading && (<Stack alignSelf={'center'}>
              <CircularProgress sx={{ color: colorPrimary() }} />
            </Stack>)}
          </Stack>

        </Stack>
      </Paper>
    </MainContainer>
  );
};

export default FlowDefault;
