import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { read, utils } from "xlsx";
import {
  Button,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import api from "../../services/api";
import upload from "../../assets/upload.gif";
import { useHistory } from "react-router-dom";
import toastError from "../../errors/toastError";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { toast } from "react-toastify";

function WorksheetToDatagrid(ws) {
  /* create an array of arrays */
  const rows = utils.sheet_to_json(ws, { header: 1, defval: "" });

  /* create column array */
  const range = utils.decode_range(ws["!ref"] || "A1");
  const columns = Array.from({ length: range.e.c + 1 }, (_, i) => ({
    key: String(i), // RDG will access row["0"], row["1"], etc
    name: utils.encode_col(i), // the column labels will be A, B, etc
    //editor: textEditor // enable cell editing
  }));

  return { rows, columns }; // these can be fed to setRows / setColumns
}


const useStyles = makeStyles((theme) => ({
  xlsTable: {
    width: "100%",
  },
  tableContainer: {
    flex: 1,
    padding: 1,
    overflowX: "auto",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  actions: {
    padding: 2,
    border: "1px solid #CCC",
    boxShadow: "1px 1px 5px #CCC",
    marginTop: 2,
    display: "flex",
    justifyContent: "center",
  },
  importOptions: {
    padding: 2,
    border: "1px solid #CCC",
    boxShadow: "1px 1px 5px #CCC",
    marginTop: 2,
    marginBottom: 2,
  },
  error: {
    color: "red",
    marginTop: 1,
  },
  buttonImport: {
    marginRight: 1,
  },
  select: {
    minWidth: 200,
  },
  backButtonContainer: {
    textAlign: "center",
    marginTop: 20,
  },
}));

const ContactImport = () => {
  const size = useWindowDimensions();

  const [rows, setRows] = useState(null);
  const [columns, setColumns] = useState(null);
  const classes = useStyles();
  const history = useHistory();
  const [contactFieldsAvailable, setContactFieldsAvailable] = useState([]);
  const [columnValue, setColumnValue] = useState({});
  const [selectedFields, setSelectedFields] = useState({}); // Para rastrear seleções únicas

  const [openingFile, setOpeningFile] = useState(false);
  const [selection, setSelection] = useState({});
  const [invalidFile, setInvalidFile] = useState(false);
  const [error, setError] = useState(null);
  const [countCreated, setCountCreated] = useState(0);
  const [countIgnored, setCountIgnored] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imported, setImported] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [validateContact, setValidateContact] = useState(false);
  const contactFields = [
    { id: "name", label: "Nome", required: true },
    { id: "number", label: "Número", required: true },
    { id: "email", label: "E-mail", required: false },
    { id: "tags", label: "Tags", required: false },
  ];

  useEffect(() => {
    setContactFieldsAvailable(contactFields);
  }, []);

  const processImport = async () => {
    setUploading(true);

    console.log(selection)

    if (!selection.number) {
      toastError("Não foi selecionado o campo de número do contato");
      setUploading(false);
      return;
    }

    if (!selection.name) {
      toastError("Não foi selecionado o campo de nome do contato");
      setUploading(false);
      return;
    }

    if (Object.keys(selectedRows).length === 0) {
      toastError("Nenhum contato selecionado");
      setUploading(false);
      return;
    }

    if (rows?.length > 1) {
      for (let index = 1; index < rows.length; index++) {
        if (selectedRows[index]) { // Importar apenas as linhas selecionadas
          const item = rows[index];
          const contactData = {};

          for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex];
            const selectedField = columnValue[column.key];

            if (selectedField) {
              contactData[selectedField] = item[columnIndex];
            }
          }
          // Verificar se os campos obrigatórios estão presentes
          const missingRequiredFields = contactFields.some(field => field.required && !contactData[field.id]);

          if (missingRequiredFields) {
            setCountIgnored(prevCount => prevCount + 1);
            continue;
          }

          try {
            const data = await api.post('/contactsImport', {
              ...contactData,
              validateContact: validateContact ? "true" : "false",
            });

            if (data.status === 200) {
              setCountCreated(prevCount => prevCount + 1);
            } else {
              setCountIgnored(prevCount => prevCount + 1);
            }
          } catch (error) {
            setCountIgnored(prevCount => prevCount + 1);
          }
        }
      }
      setValidateContact(false);
      setSelectedRows({});
      setImported(true);
      setUploading(false);
      
      if (countIgnored === 0) {
        toast.success("Importação realizada com sucesso");
      } else {
        toast.alert("Importação realizada com sucesso, mas houveram alguns erros");
      }
    }
  };

  const onChangeFile = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setOpeningFile(true);
    setInvalidFile(false);
    setImported(false);
    setUploading(false);
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = e.target.result;
        const wb = read(data);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const { rows, columns } = WorksheetToDatagrid(ws);
        setRows(rows);
        setColumns(columns);
        setOpeningFile(false);
      } catch (e) {
        console.error(e);
        setInvalidFile(true);
        setOpeningFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    const columnKey = event.target.name;
  
    // Remover antiga seleção
    if (columnValue[columnKey]) {
      const oldValue = columnValue[columnKey];
      setSelectedFields((prevSelectedFields) => {
        const newSelectedFields = { ...prevSelectedFields };
        delete newSelectedFields[oldValue];
        return newSelectedFields;
      });
    }
  
    // Se o novo valor for vazio, limpar a seleção
    if (newValue === "") {
      setColumnValue((prevColumnValue) => {
        const newColumnValue = { ...prevColumnValue };
        delete newColumnValue[columnKey];
        return newColumnValue;
      });
      setSelection((prevSelection) => {
        const newSelection = { ...prevSelection };
        Object.keys(newSelection).forEach((key) => {
          if (newSelection[key] === columnKey) {
            delete newSelection[key];
          }
        });
        return newSelection;
      });
      return;
    }
  
    // Verificar se o novo valor já foi selecionado
    if (selectedFields[newValue]) {
      toastError(`O campo ${newValue} já foi selecionado.`);
      return;
    }
  
    // Atualizar seleção
    setSelection((selection) => ({ ...selection, [newValue]: columnKey }));
    setSelectedFields((prevSelectedFields) => ({ ...prevSelectedFields, [newValue]: columnKey }));
    setColumnValue((columnValue) => ({ ...columnValue, [columnKey]: newValue }));
  };
  

  const renderSelectbox = (column) => {
    return (
      <Select value={columnValue[column.key]} name={column.key} onChange={handleSelectChange}>
        <MenuItem value="">&nbsp;</MenuItem>
        {contactFieldsAvailable.map((contactField) => (
          <MenuItem value={contactField.id}>{contactField.label}</MenuItem>
        ))}
      </Select>
    );
  };

  const renderXls = () => {
    return (
      <TableContainer className={classes.tableContainer} style={{ height: size.height * 0.75 }}>
        <Table stickyHeader>
          <TableHead key={columns.length}>
            <TableRow>
              <TableCell>
                <input
                  type="checkbox"
                  checked={Object.keys(selectedRows).length === rows.length - 1} // Se todas as linhas, exceto a primeira, estiverem marcadas
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    const newSelectedRows = {};
                    if (isChecked) {
                      // Marcar todas as linhas, exceto a primeira
                      for (let i = 1; i < rows.length; i++) {
                        newSelectedRows[i] = true;
                      }
                    }
                    setSelectedRows(newSelectedRows);
                  }}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.name}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              {columns.map((column) => (
                <TableCell key={column.key}>{renderSelectbox(column)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {rowIndex !== 0 && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={!!selectedRows[rowIndex]}
                      onChange={() => {
                        setSelectedRows((prevSelectedRows) => ({
                          ...prevSelectedRows,
                          [rowIndex]: !prevSelectedRows[rowIndex],
                        }));
                      }}
                    />
                  </TableCell>
                )}
                {rowIndex !== 0 && (
                  row.map((column, columnIndex) => (
                    <TableCell key={columnIndex}>{column}</TableCell>
                  ))
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };


  const handleCloseImport = async () => {
    try {
      history.push("/contacts");
    } catch (err) {
      toastError(err);
    }
  };

  const renderContent = () => {
    return (
      <div>
        <div className={classes.importOptions}>
          <FormGroup row style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
            <FormControlLabel
              control={
                <Switch checked={validateContact} onChange={(event) => setValidateContact(event.target.checked)} color="primary" />
              }
              label="Validar contatos no WhatsApp"
            />
          </FormGroup>
        </div>
        {renderXls()}
        <div className={classes.actions}>
          {uploading && <div>Importando... Aguarde</div>}
          <Button
            variant="contained"
            color="primary"
            disabled={uploading}
            className={classes.buttonImport}
            onClick={() => processImport()}
          >
            Importar contatos
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={uploading}
            onClick={() => {
              setRows(null);
              setColumns(null);
            }}
          >
            Cancelar
          </Button>
          {error && <div className={classes.error}>{error}</div>}
        </div>
      </div>
    );
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onChangeFile,
    maxFiles: 1,
  });

  return (
    <div style={{ alignContent: "center" }}>
      {imported && (
        <div>
          <ul>
            <li>{countCreated} contatos criados</li>
            <li>{countIgnored} contatos ignorados (número inválido ou não marcados para atualizar)</li>
          </ul>
        </div>
      )}
      {openingFile && <div>Processando arquivo...</div>}
      {invalidFile && <div>Arquivo inválido!</div>}
      {!imported && rows && columns ? renderContent() : (
        <>
          <div
            {...getRootProps()}
            className="uploaderDrop"
            style={{
              borderRadius: 20,
              maxWidth: 500,
              margin: "20px auto",
              border: "3px dotted #ddd",
              padding: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <img src={upload} height={200} alt="Upload" />
            <h5>Clique ou arraste um arquivo</h5>
            <p style={{ color: "#e74c3c", fontWeight: "bold", textAlign: "center" }}>
              * Importante: Arquivos somente com extensões são aceitas: xls, xslx, csv, txt
            </p>
          </div>

          <input {...getInputProps()} />

          <div className={classes.backButtonContainer}>
            <Button variant="contained" color="secondary" disabled={uploading} onClick={handleCloseImport}>
              Voltar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContactImport;
