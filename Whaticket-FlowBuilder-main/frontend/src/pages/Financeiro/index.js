import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import moment from "moment";
import ForbiddenPage from "../../components/ForbiddenPage";

// Novo componente "Invoice"
const Invoice = ({ invoice, onPayClick }) => {
  const handlePayClick = () => {
    // Aqui você pode abrir o link da fatura com base no "invoice.detail"
    // Certifique-se de que "invoice.detail" contenha o URL correto da fatura.
    // Exemplo:
    window.open(invoice.linkInvoice, "_blank");
  };

  return (
    <TableRow key={invoice.id}>
      <TableCell align="center">{invoice.detail}</TableCell>
      <TableCell align="center">{invoice.users}</TableCell>
      <TableCell align="center">{invoice.connections}</TableCell>
      <TableCell align="center">
        {moment(invoice.dueDate).format("DD/MM/YYYY")}
      </TableCell> {/* Adicione esta coluna para a data de vencimento */}
      <TableCell align="center">
        {invoice.value ? invoice.value.toLocaleString("pt-br", {
          style: "currency",
          currency: "BRL",
        }) : 'N/A'}
      </TableCell>
      <TableCell align="center">
        {invoice.status !== "Pago" ? (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={handlePayClick}
          >
            PAGAR
          </Button>
        ) : (
          <Button size="small" variant="outlined">
            PAGO
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Invoices = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices", {
            params: { searchParam, pageNumber },
          });

          dispatch({ type: "LOAD_INVOICES", payload: data.invoices });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      ></SubscriptionModal>
      {user.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <MainHeader>
            <Title>Faturas ({invoices.length})</Title>
          </MainHeader>
          <Paper
            className={classes.mainPaper}
            variant="outlined"
            onScroll={handleScroll}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Detalhes</TableCell>
                  <TableCell align="center">Usuários</TableCell>
                  <TableCell align="center">Conexões</TableCell>
                  <TableCell align="center">Vencimento</TableCell> {/* Adicione esta coluna */}
                  <TableCell align="center">Valor</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <>
                  {invoices.map((invoice) => (
                    <Invoice
                      key={invoice.id}
                      invoice={invoice}
                    />
                  ))}
                  {loading && <TableRowSkeleton columns={6} />}
                </>
              </TableBody>
            </Table>
          </Paper>
        </>}
    </MainContainer>
  );
};

export default Invoices;