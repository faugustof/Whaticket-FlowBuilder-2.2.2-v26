import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
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

const FlowBuilderTicketModal = ({
    open,
    onSave,
    data,
    onUpdate,
    close
}) => {
    const classes = useStyles();
    const isMounted = useRef(true);
    const [activeModal, setActiveModal] = useState(false)
    const [queues, setQueues] = useState([])
    const [selectedQueue, setQueueSelected] = useState()

    useEffect(() => {
        if (open === 'edit') {
            (async () => {
                try {
                    const { data: old } = await api.get("/queue");
                    setQueues(old)
                    const queue = old.find((item) => item.id === data.data.id)
                    console.log('queue', queue)
                    if (queue) {
                        setQueueSelected(queue.id)
                    }
                    setActiveModal(true)
                } catch (error) {
                    console.log(error)
                }
            })();

        } else if (open === 'create') {
            (async () => {
                try {
                    const { data } = await api.get("/queue");
                    setQueues(data)
                    setActiveModal(true)
                } catch (error) {
                    console.log(error)
                }
            })()
        }
        return () => {
            isMounted.current = false;
        };
    }, [open]);


    const handleClose = () => {
        close(null)
        setActiveModal(false)
    };

    const handleSaveContact = () => {
        if (!selectedQueue) {
            return toast.error('Adicione uma fila')
        }
        if (open === 'edit') {
            const queue = queues.find(item => item.id === selectedQueue)
            onUpdate({
                ...data,
                data: queue
            });
        } else if (open === 'create') {
            const queue = queues.find(item => item.id === selectedQueue)
            onSave({
                data: queue
            })
        }
        handleClose()

    };

    return (
        <div className={classes.root}>
            <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
                <DialogTitle id="form-dialog-title">
                    {open === 'create' ? `Adicionar um intervalo ao fluxo` : `Editar intervalo`}
                </DialogTitle>
                <Stack>
                    <DialogContent dividers>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            //   onChange={handleChange}
                            value={selectedQueue}
                            style={{ width: "95%" }}
                            onChange={(e) => { setQueueSelected(e.target.value) }}
                            MenuProps={{
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "left",
                                },
                                transformOrigin: {
                                    vertical: "top",
                                    horizontal: "left",
                                },
                                getContentAnchorEl: null,
                            }}
                            renderValue={() => {
                                if (selectedQueue === "") {
                                    return "Selecione uma Conexão"
                                }
                                const queue = queues.find(w => w.id === selectedQueue)
                                return queue.name
                            }}
                        >

                            {queues.length > 0 && (
                                queues.map((queue, index) => (
                                    <MenuItem dense key={index} value={queue.id}>{queue.name}</MenuItem>
                                ))
                            )}
                        </Select>
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
                            onClick={handleSaveContact}
                        >
                            {open === 'create' ? `Adicionar` : 'Editar'}
                        </Button>
                    </DialogActions>
                </Stack>
            </Dialog>
        </div>
    );
};

export default FlowBuilderTicketModal;