import React, { useState, useContext } from "react";

import MenuItem from "@material-ui/core/MenuItem";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";

import { TicketsContext } from "../../context/Tickets/TicketsContext";
// import { v4 as uuidv4 } from "uuid";

import toastError from "../../errors/toastError";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForwardModal from "../ForwardMessageModal";
import ShowTicketOpen from "../ShowTicketOpenModal";
import AcceptTicketWithoutQueue from "../AcceptTicketWithoutQueueModal";

const MessageOptionsMenu = ({
  message,
  menuOpen,
  handleClose,
  anchorEl,
  isGroup,
  queueId,
  whatsappId
}) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const editingContext = useContext(EditMessageContext);
  const setEditingMessage = editingContext ? editingContext.setEditingMessage : null;
  const { setTabOpen } = useContext(TicketsContext);
  const history = useHistory();

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");
  const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);

  const [ticketOpen, setTicketOpen] = useState(null);

  const { showSelectMessageCheckbox,
    setShowSelectMessageCheckbox,
    selectedMessages,
    forwardMessageModalOpen,
    setForwardMessageModalOpen } = useContext(ForwardMessageContext);

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;

    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user?.id,
        status: "open",
        queueId: queueId,
        whatsappId: whatsappId
      });

      setTicketOpen(ticket);
      if (ticket.queueId === null) {
        setAcceptTicketWithouSelectQueueOpen(true);
      } else {
        setTabOpen("open");
        history.push(`/tickets/${ticket.uuid}`);
      }
    } catch (err) {
      const ticket = JSON.parse(err.response.data.error);

      if (ticket.userId !== user?.id) {
        setOpenAlert(true);
        setUserTicketOpen(ticket.user.name);
        setQueueTicketOpen(ticket.queue.name);
      } else {
        setOpenAlert(false);
        setUserTicketOpen("");
        setQueueTicketOpen("");

        // handleSelectTicket(ticket);
        setTabOpen(ticket.status);
        history.push(`/tickets/${ticket.uuid}`);
      }
    }
    //setLoading(false);
    handleClose();
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
  };

  const handleSetShowSelectCheckbox = () => {
    setShowSelectMessageCheckbox(!showSelectMessageCheckbox);
    handleClose();
  };

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleEditMessage = async () => {
    setEditingMessage(message);
    handleClose();
  }
  // const handleForwardMessage = (msg) => {
  //   setForwardModalOpen(true);
  //   setForwardMessage(msg);
  //   handleClose();
  // };
  // const handleCloseForwardModal = () => {

  //   //setSelectedSchedule(null);
  //   setForwardModalOpen(false);
  //   handleClose();
  // };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const isWithinFifteenMinutes = () => {
    const fifteenMinutesInMilliseconds = 15 * 60 * 1000; // 15 minutos em milissegundos
    const currentTime = new Date();
    const messageTime = new Date(message.createdAt);

    // Verifica se a diferença entre o tempo atual e o tempo da mensagem é menor que 15 minutos
    return currentTime - messageTime <= fifteenMinutesInMilliseconds;
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  return (
    <>
      <AcceptTicketWithoutQueue
        modalOpen={acceptTicketWithouSelectQueueOpen}
        onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
        ticket={ticketOpen}
        ticketId={ticketOpen?.id}
      />
      <ShowTicketOpen
        isOpen={openAlert}
        handleClose={handleCloseAlert}
        user={userTicketOpen}
        queue={queueTicketOpen}
      />
      <ConfirmationModal
        title={i18n.t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>

      <ForwardModal
        modalOpen={forwardMessageModalOpen}
        messages={selectedMessages}
        onClose={(e) => {
          setForwardMessageModalOpen(false);
          setShowSelectMessageCheckbox(false);
        }}
      />
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {message.fromMe && (
          <MenuItem key="delete" onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>
        )}
        {message.fromMe && isWithinFifteenMinutes() && (
          <MenuItem key="edit" onClick={handleEditMessage}>
            {i18n.t("messageOptionsMenu.edit")}
          </MenuItem>
        )}
        <MenuItem onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
        <MenuItem onClick={handleSetShowSelectCheckbox}>
          {i18n.t("messageOptionsMenu.forward")}
        </MenuItem>
        {!message.fromMe && isGroup && (
          <MenuItem onClick={() => handleSaveTicket(message?.contact?.id)}>
            {i18n.t("messageOptionsMenu.talkTo")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;