import { Box, CircularProgress, Fab, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Check, Save, Message } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { getUsers } from '../../../actions/user';
import { useValue } from '../../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const url = process.env.REACT_APP_SERVER_URL + '/user';

const UsersActions = ({ params, rowId, setRowId }) => {
  const {
    dispatch,
    state: { currentUser, users },
  } = useValue();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);

    const { role, active, _id } = params.row;
    try {
      const result = await fetch(`${url}/updateStatus/${_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ role, active }),
      });
      if (result.ok) {
        setSuccess(true);
        setRowId(null);
        getUsers(dispatch, currentUser)
      } else {
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: 'Vérifiez votre mot de passe',
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'UPDATE_ALERT',
        payload: {
          open: true,
          severity: 'error',
          message: 'Erreur lors de la mise à jour du statut',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rowId === params.id && success) setSuccess(false);
  }, [rowId, params.id, success]);

  const handleMessageClick = () => {
    navigate(`/message/${currentUser.id}/${params.row._id}`); 
  };

  return (
    <Box
      sx={{
        m: 1,
        position: 'relative',
      }}
    >
      {success ? (
        <Fab
          color="primary"
          sx={{
            width: 40,
            height: 40,
            bgcolor: green[500],
            '&:hover': { bgcolor: green[700] },
          }}
        >
          <Check />
        </Fab>
      ) : (
        <Fab
          color="primary"
          sx={{
            width: 40,
            height: 40,
          }}
          disabled={params.id !== rowId || loading}
          onClick={handleSubmit}
        >
          <Save />
        </Fab>
      )}
      {loading && (
        <CircularProgress
          size={52}
          sx={{
            color: green[500],
            position: 'absolute',
            top: -6,
            left: -6,
            zIndex: 1,
          }}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleMessageClick}
        startIcon={<Message />}
        sx={{ ml: 1 }}
      >
        Message
      </Button>
    </Box>
  );
};

export default UsersActions;
