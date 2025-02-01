import React, { useContext, useEffect, useState } from "react";
import {
  makeStyles,
  Modal,
  Backdrop,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius: "8px",
    overflow: "auto",
    maxHeight: "80vh",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

const handleRemoveContactTag = async (contactId, tagId) => {
  await api.delete(`/tags-contacts/${tagId}/${contactId}`);
}

const ContactTagListModal = ({ open, onClose, tag }) => {
  const classes = useStyles();
  const [tagList, setTagList] = useState(tag.contacts);
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    console.log("tagList", tagList)
  }, [tagList])

  useEffect(() => {
    // const socket = socketManager.GetSocket(user.companyId, user.id);

    const onCompanyTags = (data) => {
      if (data.action === "update" || data.action === "create") {
        if (data.tag.id === tag.id && data.tag?.contacts?.length > 0) {
          setTagList(data.tag.contacts);
        }
        if (data.tag.id === tag.id && data.tag?.contacts?.length === 0) {
          setTagList([]);
          onClose();
        }
      }
    };
    socket.on(`company${user.companyId}-tag`, onCompanyTags);

    return () => {
      socket.off(`company${user.companyId}-tag`, onCompanyTags);
    };
  }, []); // Dependência do estado auxiliar updateFlag

  return tagList.length > 0 ? (
    <Modal
      className={classes.modal}
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <h2 id="transition-modal-title">{tag.name} - Contatos</h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Nmero</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tagList?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.id}</TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.number}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveContactTag(contact.id, tag.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Fade>
    </Modal>
  ) : (
    <></>
  )
};

export default ContactTagListModal;
