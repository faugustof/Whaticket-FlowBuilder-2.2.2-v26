import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { Can } from "../Can";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Menu } from "@material-ui/core";
import { DeviceHubOutlined, History, MoreVert, PictureAsPdf, Replay, SwapHorizOutlined } from "@material-ui/icons";
import { v4 as uuidv4 } from "uuid";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
// import TicketOptionsMenu from "../TicketOptionsMenu";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import Tooltip from '@material-ui/core/Tooltip';
import ConfirmationModal from "../ConfirmationModal";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';

import Button from '@material-ui/core/Button';
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import AcceptTicketWithouSelectQueue from "../AcceptTicketWithoutQueueModal";

//icones
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import UndoIcon from '@material-ui/icons/Undo';

import ScheduleModal from "../ScheduleModal";
import MenuItem from "@material-ui/core/MenuItem";
import { Switch } from "@material-ui/core";
import ShowTicketOpen from "../ShowTicketOpenModal";
import { toast } from "react-toastify";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import ShowTicketLogModal from "../ShowTicketLogModal";
import TicketMessagesDialog from "../TicketMessagesDialog";
import { useTheme } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
    actionButtons: {
        marginRight: 6,
        maxWidth: "100%",
        flex: "none",
        alignSelf: "center",
        marginLeft: "auto",
        // flexBasis: "50%",
        display: "flex",
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    bottomButtonVisibilityIcon: {
        padding: 1,
        color: theme.mode === "light" ? '#0872b9' : '#FFF',
    },
    botoes: {
        display: "flex",
        padding: "15px",
        justifyContent: "flex-end",
        maxWidth: "100%",
        // alignItems: "center"

    }
}));

const SessionSchema = Yup.object().shape({
    ratingId: Yup.string().required("Avaliação obrigatória"),
});

const TicketActionButtonsCustom = ({ ticket
    // , showSelectMessageCheckbox,
    // selectedMessages,
    // forwardMessageModalOpen,
    // setForwardMessageModalOpen
}) => {
    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const [isMounted, setIsMounted] = useState(true);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const { setCurrentTicket, setTabOpen } = useContext(TicketsContext);
    const [open, setOpen] = React.useState(false);
    const formRef = React.useRef(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactId, setContactId] = useState(null);
    const [acceptTicketWithouSelectQueueOpen, setAcceptTicketWithouSelectQueueOpen] = useState(false);
    const [showTicketLogOpen, setShowTicketLogOpen] = useState(false);
    const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
    const [disableBot, setDisableBot] = useState(ticket.contact.disableBot);

    const [showSchedules, setShowSchedules] = useState(false);
    const [enableIntegration, setEnableIntegration] = useState(ticket.useIntegration);

    const [openAlert, setOpenAlert] = useState(false);
    const [userTicketOpen, setUserTicketOpen] = useState("");
    const [queueTicketOpen, setQueueTicketOpen] = useState("");
    const [logTicket, setLogTicket] = useState([]);

    const { get: getSetting } = useCompanySettings()
    const { getPlanCompany } = usePlans();


    const [anchorEl, setAnchorEl] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        fetchData();

        // Cleanup function to set isMounted to false when the component unmounts
        return () => {
            setIsMounted(false);
        };
    }, []);


    const fetchData = async () => {
        const companyId = user.companyId;
        const planConfigs = await getPlanCompany(undefined, companyId);
        setShowSchedules(planConfigs.plan.useSchedules);
        setOpenTicketMessageDialog(false);
        setDisableBot(ticket.contact.disableBot)

        setShowTicketLogOpen(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    const handleClickOpen = async (e) => {
        const setting = await getSetting({
            "column": "requiredTag"
        });

        if (setting?.requiredTag === "enabled") {
            //verificar se tem uma tag   
            try {
                const contactTags = await api.get(`/contactTags/${ticket.contact.id}`);
                if (!contactTags.data.tags) {
                    toast.warning(i18n.t("messagesList.header.buttons.requiredTag"))
                } else {
                    setOpen(true);
                    // handleUpdateTicketStatus(e, "closed", user?.id);
                }
            } catch (err) {
                toastError(err);
            }
        } else {

            setOpen(true);
            // handleUpdateTicketStatus(e, "closed", user?.id);
        }
    };

    const handleClose = () => {
        formRef.current.resetForm();
        setOpen(false);
    };

    const handleCloseAlert = () => {
        setOpenAlert(false);
        setLoading(false);
    };
    const handleOpenAcceptTicketWithouSelectQueue = async () => {

        setAcceptTicketWithouSelectQueueOpen(true);

    };

    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuOpen(false);
    };

    const handleOpenTransferModal = (e) => {
        setTransferTicketModalOpen(true);
        if (typeof handleClose == "function") handleClose();
    };

    const handleOpenConfirmationModal = (e) => {
        setConfirmationOpen(true);
        if (typeof handleClose == "function") handleClose();
    };


    const handleCloseTicketWithoutFarewellMsg = async () => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "closed",
                userId: user?.id || null,
                sendFarewellMessage: false,
                amountUsedBotQueues: 0
            });

            setLoading(false);
            history.push("/tickets");
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleExportPDF = async () => {
        setOpenTicketMessageDialog(true);
        handleCloseMenu();
    }

    const handleEnableIntegration = async () => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                useIntegration: !enableIntegration
            });
            setEnableIntegration(!enableIntegration)

            setLoading(false);
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleShowLogTicket = async () => {
        setShowTicketLogOpen(true);
    };

    const handleContactToggleDisableBot = async () => {

        const { id } = ticket.contact;


        try {
            const { data } = await api.put(`/contacts/toggleDisableBot/${id}`);
            ticket.contact.disableBot = data.disableBot;
            setDisableBot(data.disableBot)

        } catch (err) {
            toastError(err);
        }
    };

    const handleCloseTransferTicketModal = () => {
        setTransferTicketModalOpen(false);
    };

    const handleDeleteTicket = async () => {
        try {
            await api.delete(`/tickets/${ticket.id}`);
            history.push("/tickets")
        } catch (err) {
            toastError(err);
        }
    };

    const handleSendMessage = async (id) => {
        let setting;

        try {
            setting = await getSetting({
                "column": "greetingAcceptedMessage"
            })
        } catch (err) {
            toastError(err);
        }
        const msg = `${setting.greetingAcceptedMessage}`; //`{{ms}} *{{name}}*, ${i18n.t("mainDrawer.appBar.user.myName")} *${user?.name}* ${i18n.t("mainDrawer.appBar.user.continuity")}.`;
        const message = {
            read: 1,
            fromMe: true,
            mediaUrl: "",
            body: `${msg.trim()}`,
        };
        try {
            await api.post(`/messages/${id}`, message);
        } catch (err) {
            toastError(err);
        }
    };


    const handleUpdateTicketStatus = async (e, status, userId) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: status,
                userId: userId || null,
            });

            let setting;

            try {
                setting = await getSetting({
                    "column": "sendGreetingAccepted"
                })
            } catch (err) {
                toastError(err);
            }

            if (setting?.sendGreetingAccepted === "enabled" && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled") && ticket.status === "pending") {
                handleSendMessage(ticket.id);
            }


            // if (isMounted.current) {
            setLoading(false);
            // }
            if (status === "open" || status === "group") {
                setCurrentTicket({ ...ticket, code: "#" + status });
                // handleSelectTicket(ticket);
                setTimeout(() => {
                    history.push('/tickets');
                }, 0);

                setTimeout(() => {
                    history.push(`/tickets/${ticket.uuid}`);
                    setTabOpen(status)
                }, 10);


            } else {
                setCurrentTicket({ id: null, code: null })
                history.push("/tickets");

            }
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    const handleAcepptTicket = async (id) => {
        setLoading(true);
        try {
            const otherTicket = await api.put(`/tickets/${id}`, {
                status: ticket.isGroup ? "group" : "open",
                userId: user?.id,
            });
            if (otherTicket.data.id !== ticket.id) {
                if (otherTicket.data.userId !== user?.id) {
                    setOpenAlert(true)
                    setUserTicketOpen(otherTicket.data.user.name)
                    setQueueTicketOpen(otherTicket.data.queue.name)
                    setTabOpen(otherTicket.isGroup ? "group" : "open")
                } else {
                    setLoading(false);
                    // handleSelectTicket(otherTicket.data);
                    setTabOpen(otherTicket.isGroup ? "group" : "open")

                    history.push(`/tickets/${otherTicket.data.uuid}`);
                }
            } else {
                // if (isMounted.current) {
                setLoading(false);
                // }

                // handleSelectTicket(ticket);
                history.push('/tickets');
                setTimeout(() => {
                    history.push(`/tickets/${ticket.uuid}`);
                    setTabOpen(ticket.isGroup ? "group" : "open")
                }, 1000)
            }
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
    };

    return (
        <>
            {openAlert && (
                <ShowTicketOpen
                    isOpen={openAlert}
                    handleClose={handleCloseAlert}
                    user={userTicketOpen}
                    queue={queueTicketOpen}
                />
            )}
            {acceptTicketWithouSelectQueueOpen && (
                <AcceptTicketWithouSelectQueue
                    modalOpen={acceptTicketWithouSelectQueueOpen}
                    onClose={(e) => setAcceptTicketWithouSelectQueueOpen(false)}
                    ticketId={ticket.id}
                    ticket={ticket}
                />
            )}
            {showTicketLogOpen && (
                <ShowTicketLogModal
                    isOpen={showTicketLogOpen}
                    handleClose={(e) => setShowTicketLogOpen(false)}
                    ticketId={ticket.id}
                />
            )}
            {openTicketMessageDialog && (
                <TicketMessagesDialog
                    open={openTicketMessageDialog}
                    handleClose={() => setOpenTicketMessageDialog(false)}
                    ticketId={ticket.id}
                />
            )}
            <div className={classes.actionButtons}>
                {ticket.status === "closed" && (ticket.queueId === null || ticket.queueId === undefined) && (
                    <ButtonWithSpinner
                        loading={loading}
                        startIcon={<Replay />}
                        size="small"
                        onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
                    >
                        {i18n.t("messagesList.header.buttons.reopen")}
                    </ButtonWithSpinner>
                )}
                {(ticket.status === "closed" && ticket.queueId !== null) && (
                    <ButtonWithSpinner
                        startIcon={<Replay />}
                        loading={loading}
                        onClick={e => handleAcepptTicket(ticket.id)}
                    >
                        {i18n.t("messagesList.header.buttons.reopen")}
                    </ButtonWithSpinner>
                )}
                {/* <IconButton
                    className={classes.bottomButtonVisibilityIcon}
                    onClick={handleShowLogTicket}
                >
                    <Tooltip title={i18n.t("messagesList.header.buttons.logTicket")}>
                        <History />

                    </Tooltip>
                </IconButton> */}
                {(ticket.status === "open" || ticket.status === "group") && (
                    <>
                        {/* {!showSelectMessageCheckbox ? ( */}
                        <>
                            {/* <IconButton
                                className={classes.bottomButtonVisibilityIcon}
                                onClick={handleEnableIntegration}
                            >
                                <Tooltip title={i18n.t("messagesList.header.buttons.enableIntegration")}>
                                    {enableIntegration === true ? <DeviceHubOutlined style={{ color: "green" }} /> : <DeviceHubOutlined />}

                                </Tooltip>
                            </IconButton> */}

                            <IconButton className={classes.bottomButtonVisibilityIcon}>
                                <Tooltip title={i18n.t("messagesList.header.buttons.resolve")}>
                                    <HighlightOffIcon
                                        // color="primary"
                                        onClick={handleClickOpen}
                                    />
                                </Tooltip>
                            </IconButton>

                            <IconButton className={classes.bottomButtonVisibilityIcon}>
                                <Tooltip title={i18n.t("tickets.buttons.returnQueue")}>
                                    <UndoIcon
                                        // color="primary"
                                        onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
                                    />
                                </Tooltip>
                            </IconButton>

                            <IconButton className={classes.bottomButtonVisibilityIcon}>
                                <Tooltip title="Transferir Ticket">
                                    <SwapHorizOutlined
                                        // color="primary"
                                        onClick={handleOpenTransferModal}
                                    />
                                </Tooltip>
                            </IconButton>
                        </>

                        {/* {showSchedules && (
                            <>
                                <IconButton className={classes.bottomButtonVisibilityIcon}>
                                    <Tooltip title={i18n.t("tickets.buttons.scredule")}>
                                        <EventIcon
                                            // color="primary"
                                            onClick={handleOpenScheduleModal}
                                        />
                                    </Tooltip>
                                </IconButton>
                            </>
                        )} */}

                        <MenuItem className={classes.bottomButtonVisibilityIcon}>
                            <Tooltip title={i18n.t("contactModal.form.chatBotContact")}>
                                <Switch
                                    size="small"
                                    // color="primary"
                                    checked={disableBot}
                                    onChange={() => handleContactToggleDisableBot()}
                                />
                            </Tooltip>
                        </MenuItem>



                        {confirmationOpen && (
                            <ConfirmationModal
                                title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} #${ticket.id}?`}
                                open={confirmationOpen}
                                onClose={setConfirmationOpen}
                                onConfirm={handleDeleteTicket}
                            >
                                {i18n.t("ticketOptionsMenu.confirmationModal.message")}
                            </ConfirmationModal>
                        )}
                        {transferTicketModalOpen && (
                            <TransferTicketModalCustom
                                modalOpen={transferTicketModalOpen}
                                onClose={handleCloseTransferTicketModal}
                                ticketid={ticket.id}
                                ticket={ticket}
                            />
                        )}
                        {/* {scheduleModalOpen && (
                            <ScheduleModal
                                open={scheduleModalOpen}
                                onClose={handleCloseScheduleModal}
                                aria-labelledby="form-dialog-title"
                                contactId={contactId}
                            />
                        )} */}

                    </>
                )}
                {ticket.status === "pending" && (ticket.queueId === null || ticket.queueId === undefined) && (
                    <ButtonWithSpinner
                        loading={loading}
                        size="small"
                        variant="contained"
                        onClick={e => handleOpenAcceptTicketWithouSelectQueue()}
                    >
                        {i18n.t("messagesList.header.buttons.accept")}
                    </ButtonWithSpinner>
                )}
                {ticket.status === "pending" && ticket.queueId !== null && (
                    <ButtonWithSpinner
                        loading={loading}
                        size="small"
                        variant="contained"
                        // color="primary"
                        onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
                    >
                        {i18n.t("messagesList.header.buttons.accept")}
                    </ButtonWithSpinner>
                )}
                <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                    style={{ paddingHorizontal: 3, paddingTop: 10 }}
                >
                    <MoreVert style={{ fontSize: 16, padding: 0 }} />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    getContentAnchorEl={null}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    open={menuOpen}
                    onClose={handleCloseMenu}
                >
                    <MenuItem onClick={handleOpenConfirmationModal}>
                        <Can
                            role={user.profile}
                            perform="ticket-options:deleteTicket"
                            yes={() => (
                                i18n.t("tickets.buttons.deleteTicket")
                            )}
                        />
                    </MenuItem>
                    <MenuItem onClick={handleEnableIntegration}>
                        {enableIntegration === true ? i18n.t("messagesList.header.buttons.disableIntegration") : i18n.t("messagesList.header.buttons.enableIntegration")}
                    </MenuItem>
                    <MenuItem onClick={handleShowLogTicket}>
                        {i18n.t("messagesList.header.buttons.logTicket")}
                    </MenuItem>
                    <MenuItem onClick={handleExportPDF}>
                        {i18n.t("ticketsList.buttons.exportAsPDF")}
                    </MenuItem>
                </Menu>
            </div>
            <>
                <Formik
                    enableReinitialize={true}
                    validationSchema={SessionSchema}
                    innerRef={formRef}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            actions.setSubmitting(false);
                            actions.resetForm();
                        }, 400);
                    }}
                >
                    {({ values, touched, errors, isSubmitting, setFieldValue, resetForm }) => (
                        <Dialog
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <Form>
                                <DialogActions className={classes.botoes}>
                                    <Button
                                        onClick={e => handleCloseTicketWithoutFarewellMsg()}
                                        style={{ background: theme.palette.primary.main, color: "white" }}
                                    >
                                        {i18n.t("messagesList.header.dialogRatingWithoutFarewellMsg")}
                                    </Button>

                                    <Button
                                        onClick={e => handleUpdateTicketStatus(e, "closed", user?.id, ticket?.queue?.id)}
                                        style={{ background: theme.palette.primary.main, color: "white" }}
                                    >
                                        {i18n.t("messagesList.header.dialogRatingCancel")}
                                    </Button>
                                </DialogActions>
                            </Form>
                        </Dialog>
                    )}
                </Formik>
            </>
        </>
    );
};

export default TicketActionButtonsCustom;
