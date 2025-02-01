import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback
} from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography
} from "@mui/material";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { CircularProgress } from "@material-ui/core";
import messageNode from "./nodes/messageNode.js";

import "reactflow/dist/style.css";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  onElementsRemove,
  useReactFlow
} from "react-flow-renderer";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import startNode from "./nodes/startNode";
import conditionNode from "./nodes/conditionNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  Image,
  ImportExport,
  LibraryBooks,
  Message,
  MicNone,
  RocketLaunch,
  Videocam
} from "@mui/icons-material";
import RemoveEdge from "./nodes/removeEdge";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import audioNode from "./nodes/audioNode";
import { useNodeStorage } from "../../stores/useNodeStorage";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import singleBlockNode from "./nodes/singleBlockNode";
import { colorPrimary } from "../../styles/styles";
import ticketNode from "./nodes/ticketNode";
import { ConfirmationNumber } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    position: "relative",
    backgroundColor: "#F8F9FA",
    overflowY: "scroll",
    ...theme.scrollbarStyles
  },
  speeddial: {
    backgroundColor: "red"
  }
}));

function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

const nodeTypes = {
  message: messageNode,
  start: startNode,
  condition: conditionNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode
};

const edgeTypes = {
  buttonedge: RemoveEdge
};

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start"
  }
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const storageItems = useNodeStorage();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddCondition, setModalAddCondition] = useState(null);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null)

  const connectionLineStyle = { stroke: "#2b2b2b", strokeWidth: "6px" };

  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;
    if (type === "start") {
      return setNodes(old => {
        return [
          ...old.filter(item => item.id !== "1"),
          {
            id: "1",
            position: { x: posX, y: posY },
            data: { label: "Inicio do fluxo" },
            type: "start"
          }
        ];
      });
    }
    if (type === "text") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: data.text },
            type: "message"
          }
        ];
      });
    }
    if (type === "interval") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
            type: "interval"
          }
        ];
      });
    }
    if (type === "condition") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              key: data.key,
              condition: data.condition,
              value: data.value
            },
            type: "condition"
          }
        ];
      });
    }
    if (type === "menu") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: {
              message: data.message,
              arrayOption: data.arrayOption
            },
            type: "menu"
          }
        ];
      });
    }
    if (type === "img") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "img"
          }
        ];
      });
    }
    if (type === "audio") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url, record: data.record },
            type: "audio"
          }
        ];
      });
    }
    if (type === "randomizer") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { percent: data.percent },
            type: "randomizer"
          }
        ];
      });
    }
    if (type === "video") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { url: data.url },
            type: "video"
          }
        ];
      });
    }
    if (type === "singleBlock") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "singleBlock"
          }
        ];
      });
    }

    if (type === "ticket") {
      return setNodes(old => {
        return [
          ...old,
          {
            id: geraStringAleatoria(30),
            position: { x: posX, y: posY },
            data: { ...data },
            type: "ticket"
          }
        ];
      });
    }


  };

  const textAdd = data => {
    addNode("text", data);
  };

  const intervalAdd = data => {
    addNode("interval", data);
  };

  const conditionAdd = data => {
    addNode("condition", data);
  };

  const menuAdd = data => {
    addNode("menu", data);
  };

  const imgAdd = data => {
    addNode("img", data);
  };

  const audioAdd = data => {
    addNode("audio", data);
  };

  const randomizerAdd = data => {
    addNode("randomizer", data);
  };

  const videoAdd = data => {
    addNode("video", data);
  };

  const singleBlockAdd = data => {
    addNode("singleBlock", data);
  };

  const ticketAdd = data => {
    addNode("ticket", data)
  }

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get(`/flowbuilder/flow/${id}`);
          if (data.flow.flow !== null) {
            setNodes(data.flow.flow.nodes);
            setEdges(data.flow.flow.connections);
          }
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id]);

  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes(old => old.filter(item => item.id !== storageItems.node));
      setEdges(old => {
        const newData = old.filter(item => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          item => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        item => item.id === storageItems.node
      )[0];
      const maioresX = nodes.map(node => node.position.x);
      const maiorX = Math.max(...maioresX);
      const finalY = nodes[nodes.length - 1].position.y;
      const nodeNew = {
        ...nodeDuplicate,
        id: geraStringAleatoria(30),
        position: {
          x: maiorX + 240,
          y: finalY
        },
        selected: false,
        style: { backgroundColor: "#555555", padding: 0, borderRadius: 8 }
      };
      setNodes(old => [...old, nodeNew]);
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
    }
  }, [storageItems.action]);

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const saveFlow = async () => {
    await api
      .post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges
      })
      .then(res => {
        toast.success("Fluxo salvo com sucesso");
      });
  };

  const doubleClick = (event, node) => {
    console.log("NODE", node);
    setDataNode(node);
    if (node.type === "message") {
      setModalAddText("edit");
    }
    if (node.type === "interval") {
      setModalAddInterval("edit");
    }
    if (node.type === "condition") {
      setModalAddCondition("edit");
    }
    if (node.type === "menu") {
      setModalAddMenu("edit");
    }
    if (node.type === "img") {
      setModalAddImg("edit");
    }
    if (node.type === "audio") {
      setModalAddAudio("edit");
    }
    if (node.type === "randomizer") {
      setModalAddRandomizer("edit");
    }
    if (node.type === "singleBlock") {
      setModalAddSingleBlock("edit");
    }
    if (node.type === "ticket") {
      setModalAddTicket("edit")
    }
  };

  const clickNode = (event, node) => {
    setNodes(old =>
      old.map(item => {
        if (item.id === node.id) {
          return {
            ...item,
            style: { backgroundColor: "#0000FF", padding: 1, borderRadius: 8 }
          };
        }
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 }
        };
      })
    );
  };
  const clickEdge = (event, node) => {
    setNodes(old =>
      old.map(item => {
        return {
          ...item,
          style: { backgroundColor: "#13111C", padding: 0, borderRadius: 8 }
        };
      })
    );
  };

  const updateNode = dataAlter => {
    console.log('DATA ALTER', dataAlter)
    setNodes(old =>
      old.map(itemNode => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
  };

  const actions = [
    {
      icon: (
        <RocketLaunch
          sx={{
            color: "#3ABA38"
          }}
        />
      ),
      name: "Inicio",
      type: "start"
    },
    {
      icon: (
        <LibraryBooks
          sx={{
            color: "#EC5858"
          }}
        />
      ),
      name: "Conteúdo",
      type: "content"
    },
    {
      icon: (
        <DynamicFeed
          sx={{
            color: "#683AC8"
          }}
        />
      ),
      name: "Menu",
      type: "menu"
    },
    {
      icon: (
        <CallSplit
          sx={{
            color: "#1FBADC"
          }}
        />
      ),
      name: "Randomizador",
      type: "random"
    },
    {
      icon: (
        <AccessTime
          sx={{
            color: "#F7953B"
          }}
        />
      ),
      name: "Intervalo",
      type: "interval"
    },
    {
      icon: (
        <ConfirmationNumber
          sx={{
            color: "#F7953B"
          }}
        />
      ),
      name: "Ticket",
      type: "ticket"
    }
  ];

  const clickActions = type => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create")
      default:
    }
  };

  return (
    <Stack sx={{ height: "100vh" }}>
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderConditionModal
        open={modalAddCondition}
        onSave={conditionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddCondition}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />
      <MainHeader>
        <Title>Desenhe seu fluxo</Title>
      </MainHeader>
      {!loading && (
        <Paper
          className={classes.mainPaper}
          variant="outlined"
          onScroll={handleScroll}
        >
          <Stack>
            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                ".MuiSpeedDial-fab": {
                  backgroundColor: colorPrimary(),
                  '&:hover': {
                    backgroundColor: colorPrimary()
                  }
                }
              }}
              icon={<SpeedDialIcon />}
              direction={"down"}
            >
              {actions.map(action => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  tooltipPlacement={"right"}
                  onClick={() => clickActions(action.type)}
                />
              ))}
            </SpeedDial>
          </Stack>
          <Stack
            sx={{
              position: "absolute",
              justifyContent: "center",
              flexDirection: "row",
              width: "100%"
            }}
          >
            <Typography
              style={{ color: "#010101", textShadow: "#010101 1px 0 10px" }}
            >
              Não se esqueça de salvar seu fluxo!
            </Typography>
          </Stack>
          <Stack direction={"row"} justifyContent={"end"}>
            <Button
              sx={{ textTransform: "none" }}
              variant="contained"
              color="primary"
              onClick={() => saveFlow()}
            >
              Salvar
            </Button>
          </Stack>

          <Stack
            direction={"row"}
            style={{
              width: "100%",
              height: "90%",
              position: "relative",
              display: "flex"
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              connectionLineStyle={connectionLineStyle}
              style={{
                //backgroundImage: `url(${imgBackground})`,
                //backgroundSize: "cover"
                backgroundColor: "#F8F9FA"
              }}
              edgeTypes={edgeTypes}
              variant={"cross"}
              defaultEdgeOptions={{
                style: { color: "#ff0000", strokeWidth: "6px" },
                animated: false
              }}
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={-1} />
            </ReactFlow>

            <Stack
              style={{
                backgroundColor: "#FAFAFA",
                height: "20px",
                width: "58px",
                position: "absolute",
                bottom: 0,
                right: 0,
                zIndex: 1111
              }}
            />
            {/* <Stack
                style={{
                  backgroundColor: "#1B1B1B",
                  height: "70%",
                  width: "150px",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  zIndex: 1111,
                  borderRadius: 3,
                  padding: 8
                }}
                spacing={1}
              >
                <Typography style={{ color: "#ffffff", textAlign: "center" }}>
                  Adicionar
                </Typography>
                <Button
                  onClick={() => addNode("start")}
                  variant="contained"
                  style={{
                    backgroundColor: "#3ABA38",
                    color: "#ffffff",
                    padding: 8,
                    "&:hover": {
                      backgroundColor: "#3e3b7f"
                    },
                    textTransform: "none"
                  }}
                >
                  <RocketLaunch
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Inicio
                </Button>
                <Button
                  onClick={() => setModalAddText("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Message
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Texto
                </Button>
                <Button
                  onClick={() => setModalAddInterval("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#F7953B",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <AccessTime
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Intervalo
                </Button>
                <Button
                  onClick={() => setModalAddCondition("create")}
                  variant="contained"
                  disabled
                  style={{
                    backgroundColor: "#524d4d",
                    color: "#cccaed",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <ImportExport
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Condição
                </Button>
                <Button
                  onClick={() => setModalAddMenu("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#683AC8",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <DynamicFeed
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Menu
                </Button>
                <Button
                  onClick={() => setModalAddAudio("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <MicNone
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Audio
                </Button>
                <Button
                  onClick={() => setModalAddVideo("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Videocam
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Video
                </Button>
                <Button
                  onClick={() => setModalAddImg("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#6865A5",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <Image
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Imagem
                </Button>
                <Button
                  onClick={() => setModalAddRandomizer("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#1FBADC",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <CallSplit
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Randomizador
                </Button>
                <Button
                  onClick={() => setModalAddSingleBlock("create")}
                  variant="contained"
                  style={{
                    backgroundColor: "#EC5858",
                    color: "#ffffff",
                    padding: 8,
                    textTransform: "none"
                  }}
                >
                  <LibraryBooks
                    sx={{
                      width: "16px",
                      height: "16px",
                      marginRight: "4px"
                    }}
                  />
                  Conteúdo
                </Button>
              </Stack> */}
          </Stack>
        </Paper>
      )}
      {loading && (
        <Stack justifyContent={"center"} alignItems={"center"} height={"70vh"}>
          <CircularProgress />
        </Stack>
      )}
    </Stack>
  );
};