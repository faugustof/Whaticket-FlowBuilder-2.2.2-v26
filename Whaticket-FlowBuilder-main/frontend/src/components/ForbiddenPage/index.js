import React from 'react';
import { Container, Typography, Button, Box } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: 'center',
    marginTop: theme.spacing(8),    
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  button: {
    marginTop: theme.spacing(2),
    color: '#fff !important',
    boxShadow: 'none',
    borderRadius: 20
  },
  boxContainer: {
    background: theme.palette.tabHeaderBackground, 
    borderRadius: 20,
    display: 'flex',
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    margin: 'auto',
  }
}));

const ForbiddenPage = () => {
  const classes = useStyles();

  return (
    <Container className={classes.container}>
      <Box className={classes.boxContainer}>
        <Box>
          <Typography variant="h1" className={classes.title} color="error">
            403
          </Typography>
          <Typography variant="h5" color="textSecondary">
            Oops! Acesso Negado!
          </Typography>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            href="/tickets"
          >
            Voltar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForbiddenPage;
