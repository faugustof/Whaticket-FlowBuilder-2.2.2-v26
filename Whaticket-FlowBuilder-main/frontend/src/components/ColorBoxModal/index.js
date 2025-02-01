import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { ColorBox } from "material-ui-color";


const useStyles = makeStyles((theme) => ({
    btnWrapper: {
        position: "relative",
    },
}));

const ColorBoxModal = ({ onChange, currentColor, handleClose, open }) => {

    const classes = useStyles();
    const [selectedColor, setSelectedColor] = useState(currentColor);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);

    const handleOk = () => {
        onChange(selectedColor);
        handleClose();
    };

    return (

        <Dialog open={open} onClose={handleClose}>

            <DialogTitle>Escolha uma cor</DialogTitle>
            <DialogContent>
                <ColorBox
                    disableAlpha={true}
                    hslGradient={false}
                    style={{ margin: '20px auto 0' }}
                    value={selectedColor}
                    onChange={setSelectedColor} />
            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={handleOk} >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default ColorBoxModal;