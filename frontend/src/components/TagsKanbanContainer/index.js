import { Chip, Paper, Select, MenuItem, Grid, InputLabel, FormControl } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { Field, Form } from "formik";
const useStyles = makeStyles((theme) => ({
    menuListItem: {
        paddingTop: 0,
        paddingBottom: 0,
        border: "none",
    },
    menuItem: {
        maxHeight: 30,
    },

    chips: {
        display: "flex",
        flexWrap: "wrap",
    },
    chip: {
        margin: 2,
    },
}));
export function TagsKanbanContainer({ ticket }) {
    const classes = useStyles();

    const [tags, setTags] = useState([]);
    const [selected, setSelected] = useState(""); // Alterado de null para ""

    useEffect(() => {
        let isMounted = true;
        loadTags(isMounted).then(() => {
            if (ticket.tags && ticket.tags.length > 0) {
                setSelected(ticket.tags[0].id); // Alterado para pegar o ID da primeira tag, se existir
            }
        });

        return () => {
            isMounted = false;
        };
    }, [ticket.tags]);

    const loadTags = async (isMounted) => {
        try {
            const { data } = await api.get(`/tags/list`, { params: { kanban: 1 } });
            if (isMounted) {
                setTags(data);
            }
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (e) => {
        const value = e.target.value;
        if (ticket.tags.length > 0) {
            await api.delete(`/ticket-tags/${ticket.id}`);
            // toast.success('Ticket Tag Removido!');
        }
        if (value !== null) {
            await api.put(`/ticket-tags/${ticket.id}/${value}`);
            // toast.success('Ticket Tag Adicionado com Sucesso!');
        }
        setSelected(value);
        // Adicione sua lógica de manipulação de tags aqui
    }

    const renderSelectedValue = () => {
        const selectedTag = tags.find(tag => tag.id === selected);
        if (!selectedTag) return null;

        return (
            <Chip
                style={{
                    backgroundColor: selectedTag.color,
                    color: "#FFF",
                    marginRight: 1,
                    padding: 1,
                    fontWeight: 'bold',
                    paddingLeft: 5,
                    paddingRight: 5,
                    borderRadius: 3,
                    fontSize: "0.8em",
                    whiteSpace: "nowrap"
                }}
                label={selectedTag.name}
                size="small"
            />
        );
    };

    return (
        <>
            <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel id="tag-kanban-id">{i18n.t("Etapa Kanban")}</InputLabel>
                <Select
                    labelWidth={60}
                    value={selected}
                    labelId="tag-kanban-id"
                    label={i18n.t("Etapa Kanban")}
                    onChange={onChange}
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
                    renderValue={renderSelectedValue}
                >
                    <MenuItem value={null}>&nbsp;</MenuItem>
                    {tags.map(tag => (
                        <MenuItem key={tag.id} value={tag.id}>
                            {tag.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    )
}
