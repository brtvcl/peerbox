import React, { useState, useEffect } from "react";
import Peer from "peerjs";
import { peerId, fileId } from "./utils/nanoid";
import { randomInt } from "./utils/randomInt";
import eventSender from "./utils/eventSender";
import fileSender from "./utils/fileSender";
import fileCatcher from "./utils/fileCatcher";
import usePrevious from "./utils/usePrevious";
import diffUsers from "./utils/diffUsers";

//import components
import FileListItem from "./components/FileListItem";
import UserListItem from "./components/UserListItem";
import AddFileButton from "./components/AddFileButton";
import ToastContainer from "./components/ToastContainer";
import Modal from "./components/Modal";
import ConnectionOverlay from "./components/ConnectionOverlay";
import ShareButton from "./components/ShareButton";
import Icon from "./components/Icon";

//import images
import monkeyFace from "./assets/img/monkey-face.png";
import arrow1 from "/src/assets/img/a1.png";
import arrow2 from "./assets/img/a2.png";
/*
import monkeyFace from "../public/img/monkey-face.png";
import arrow1 from "../public/img/a1.png";
import arrow2 from "../public/img/a2.png";
*/
// Globally unique prefix for peers. Required for peer ids to not collide with other peers in public peerjs cloud
const peerIdPrefix = "rlKVIXgwhIaAyLTdmVbzq_";

// Available mascots
let mascots = ["🐵", "🐶", "🐺", "🐱", "🐮", "🐭", "🐰", "🐻", "🐼", "🐸"];

const App = () => {
  // Generate peer id with prefix
  const [localPeerId, setLocalPeerId] = useState(peerIdPrefix + peerId());
  const localPeerIdNoPrefix = localPeerId.slice(-6);

  // Get remote id from path name excluding slash part
  const remoteBoxId = Array.from(window.location.pathname)
    .map((char, i) => (i === 0 ? "" : char))
    .join("");

  // Determine if local user is host or a client
  const isHost = remoteBoxId === "";

  const [localUser, setLocalUser] = useState({
    peer: new Peer(localPeerId),
    mascot: mascots[randomInt(0, 9)],
  }); // State for local user. Connects to peerjs server
  const [localFiles, setLocalFiles] = useState([]); // Array for local files
  const [sharedFiles, setSharedFiles] = useState([]); // Array for shared files
  const [allUsers, setAllUsers] = useState([]); // Array for active users
  const prevUsers = usePrevious(allUsers);
  const [connections, setConnections] = useState([]); // Array for active connections
  const [toasts, setToasts] = useState([]);
  const [isConnected, setIsConnected] = useState(null);
  const [modalData, setModalData] = useState({
    visible: false,
    title: "",
    body: "",
    cancelText: "",
    successText: "",
    onCancel: () => null,
    onSuccess: () => null,
  });
  const [showTutorial, setShowTutorial] = useState(isHost);
  const [downloads, setDownloads] = useState({});

  function showModal(
    title,
    body,
    cancelText,
    successText,
    onCancel,
    onSuccess,
    visible
  ) {
    setModalData({
      visible: visible,
      title: title,
      body: body,
      cancelText: cancelText,
      successText: successText,
      onCancel: onCancel,
      onSuccess: onSuccess,
    });
  }

  function pushToast(message) {
    setToasts((toasts) => [...toasts, message]);
  }

  function shareHandler() {
    setShowTutorial(false);

    let shareLink = window.location.href + localPeerIdNoPrefix;

    function copyLink() {
      navigator.clipboard.writeText(shareLink).then(() => {
        // Alert the user that link is copied
        pushToast("Link copied!");
      });
    }

    let body = (
      <div className="flex flex-col justify-center items-center w-full p-4">
        <p>Share this link with others to join your box.</p>
        <div className="flex w-full mt-4">
          <input className="w-full p-2 border rounded-lg" value={shareLink} />
          <span
            onClick={copyLink}
            className="bg-blue-50 text-blue-500 p-2 hover:bg-blue-100 cursor-pointer ml-2 rounded-lg"
          >
            <Icon name="copy" />
          </span>
        </div>
      </div>
    );
    showModal(
      "Share",
      body,
      "",
      "OK",
      null,
      () => {
        // set modal visible to false
        showModal("", "", "", "", null, null, false);
      },
      true
    );
  }

  function fileInputChangeHandler(e) {
    // Get files from input element and convert FileList to Array
    const fileArray = Array.from(e.target.files);

    // Give files a unique id
    const newLocalFiles = fileArray.map((f) => ({ id: fileId(), file: f }));

    // Spread new added files into localfiles state without removing the current ones
    setLocalFiles((f) => [...f, ...newLocalFiles]);

    // Create shared files
    const sharedFiles = newLocalFiles.map((localFile) => ({
      id: localFile.id,
      owner: { id: localPeerIdNoPrefix, mascot: localUser.mascot },
      name: localFile.file.name,
      size: localFile.file.size,
      type: localFile.file.type,
    }));

    // spread new added files into shared files state
    setSharedFiles((f) => [...f, ...sharedFiles]);

    sharedFiles.forEach((f) => {
      const addFileEvent = {
        type: "addFile",
        payload: f,
      };
      //Send event with sender util
      eventSender(
        isHost,
        remoteBoxId,
        connections,
        addFileEvent,
        localUser.peer.id
      );
    });
  }

  function downloadFileHandler(fileId) {
    // Find file from shared files by id
    const foundFile = sharedFiles.find((file) => file.id == fileId);

    if (!foundFile) {
      return;
    }
    // Find connection by file owner id
    const foundConnection = connections.find(
      (conn) => conn.peer.slice(-6) == foundFile.owner.id
    );
    // Create event object
    const getFileEvent = {
      type: "getFile",
      payload: foundFile.id,
    };
    // If connection not found establish one and request the file from owner
    // If connection is found use that and request file from owner
    if (!foundConnection) {
      let conn = localUser.peer.connect(peerIdPrefix + foundFile.owner.id, {
        reliable: true,
        serialization: "json",
      });
      conn.on("open", () => {
        setConnections((c) => [...c, conn]);
        eventSender(
          isHost,
          foundFile.owner.id,
          [conn],
          getFileEvent,
          localPeerId
        );
      });
    } else {
      eventSender(
        isHost,
        foundFile.owner.id,
        [foundConnection],
        getFileEvent,
        localPeerId
      );
    }
  }

  function removeFileHandler(id) {
    let file = sharedFiles.find((f) => f.id == id);
    showModal(
      "Delete File",
      <>
        Are you sure you want to delete file <br />
        <span className="font-bold"> {file.name} </span> ?
      </>,
      "Cancel",
      "Delete",
      (cancel) => {
        // callback for user cancelled the file delete action

        // set modal visible to false
        showModal("", "", "", "", null, null, false);
      },
      (success) => {
        // callback for user approved the file delete action

        const delFileEvent = {
          type: "delFile",
          payload: id,
        };

        // send event to delete file from other users
        eventSender(
          isHost,
          remoteBoxId,
          connections,
          delFileEvent,
          localUser.peer.id
        );

        removeSharedFile(id);

        // set modal visible to false
        showModal("", "", "", "", null, null, false);
      },
      true
    );
  }

  function removeSharedFile(fileId) {
    setSharedFiles((sharedFiles) => sharedFiles.filter((f) => f.id !== fileId));
  }

  function kickUserHandler(userId) {
    if (isHost && userId !== localPeerIdNoPrefix) {
      let user = allUsers.find((u) => u.id == userId);
      showModal(
        "Kick User",
        <>Are you sure you want to kick {user.mascot} ?</>,
        "Cancel",
        "Kick",
        (cancel) => {
          // callback for Admin cancelled the user kick action

          // set modal visible to false
          showModal("", "", "", "", null, null, false);
        },
        (success) => {
          // callback for Admin approving the user kick action
          setAllUsers((allUsers) => {
            // Remove user from allUsers
            let filteredUsers = allUsers.filter((u) => u.id !== userId);

            let setUsersEvent = {
              type: "setUsers",
              payload: filteredUsers,
            };

            // Emit kicked user to all other users
            eventSender(
              isHost,
              remoteBoxId,
              connections,
              setUsersEvent,
              localUser.peer.id
            );

            setSharedFiles((sharedFiles) => {
              // Emit all files from kicked user for deletion to all other users
              let filesToRemove = sharedFiles.filter(
                (file) => file.owner.id == userId
              );

              filesToRemove.forEach((file) => {
                const delFileEvent = {
                  type: "delFile",
                  payload: file.id,
                };

                eventSender(
                  isHost,
                  remoteBoxId,
                  connections,
                  delFileEvent,
                  localPeerId
                );
              });

              return sharedFiles.filter((file) => file.owner.id !== userId);
            });

            return filteredUsers;
          });

          // Set modal visible to false
          showModal("", "", "", "", null, null, false);
        },
        true
      );
    }
  }

  useEffect(() => {
    let timeout;

    if (isHost) {
      // Set timeout for 5 seconds to connect
      timeout = setTimeout(() => {
        setIsConnected(false);
      }, 5000);
    }

    localUser.peer.on("open", (id) => {
      //Add local user to allusers array
      setAllUsers((u) => [
        ...u,
        {
          id: localUser.peer.id.slice(-6),
          mascot: localUser.mascot,
        },
      ]);

      // If host is connected to peerjs set connected true
      if (isHost) {
        clearTimeout(timeout);
        setIsConnected(true);
      }

      //If not host connect to remote box id
      if (!isHost) {
        //Connect  to remote user
        let conn = localUser.peer.connect(peerIdPrefix + remoteBoxId, {
          reliable: true,
          serialization: "json",
        });

        // Set timeout for 5 seconds to connect
        timeout = setTimeout(() => {
          // Set connection state to fail
          setIsConnected(false);
        }, 5000);

        //Connect event
        conn.on("open", () => {
          //add new connection to active connections array
          setConnections((c) => [...c, conn]);
          setIsConnected(true);

          // clear timeout for connection timeout
          clearTimeout(timeout);
        });
      }

      //When remote user connects
      localUser.peer.on("connection", (conn) => {
        //add new connection to active connections array
        setConnections((c) => [...c, conn]);

        //If host gets connection update user list
        if (isHost) {
          //Id of new user that joined
          const newJoinedId = conn.peer.slice(-6);

          let selectedMascotIndex = randomInt(0, 9);
          let selectedMascot = mascots[selectedMascotIndex];

          //update user list
          setAllUsers((allUsers) => {
            // if there is more than 10 people close the connection and dont accept the new user
            if (allUsers.length == 10) {
              conn.close();
              return allUsers;
            }

            // select mascot for new user
            while (
              allUsers.find((user) => user.mascot == selectedMascot) !=
              undefined
            ) {
              selectedMascotIndex++;
              if (selectedMascotIndex == 10) {
                selectedMascotIndex = 0;
              }
              selectedMascot = mascots[selectedMascotIndex];
            }

            return [...allUsers, { id: newJoinedId, mascot: selectedMascot }];
          });
        }
      });
    });
  }, [localUser]);

  useEffect(() => {
    connections.forEach((conn) => {
      if (isHost) {
        // If connection is ready to send users send setUsers and addFile events ONCE
        let setUsersEvent = {
          type: "setUsers",
          payload: allUsers,
        };

        if (conn.open) {
          // When user joins send other users the new joined one
          eventSender(
            isHost,
            remoteBoxId,
            [conn],
            setUsersEvent,
            localUser.peer.id
          );
        } else {
          // When user first joins send them current users on box
          conn.on("open", () => {
            // Send current users to new connected user when connection opens
            eventSender(
              isHost,
              remoteBoxId,
              [conn],
              setUsersEvent,
              localUser.peer.id
            );
          });
        }

        conn.once("open", () => {
          sharedFiles.forEach((f) => {
            const addFileEvent = {
              type: "addFile",
              payload: f,
            };

            // Send current files to new connected user when connection opens  only ONCE
            eventSender(
              isHost,
              remoteBoxId,
              [conn],
              addFileEvent,
              localUser.peer.id
            );
          });
        });
      }

      //Listen events from connections
      conn.on("data", (event) => {
        if (event.type == "addFile") {
          // addFile event
          let sharedFile = event.payload;
          // insert new added files into shared files state
          setSharedFiles((f) => [...f, sharedFile]);
          // Broadcast back this event to all the box users
          if (isHost) {
            eventSender(isHost, remoteBoxId, connections, event, conn.peer);
          }
        } else if (event.type == "delFile") {
          // remove shared file from state
          removeSharedFile(event.payload);

          // Broadcast back this event to all the box users
          if (isHost) {
            eventSender(isHost, remoteBoxId, connections, event, conn.peer);
          }
        } else if (event.type == "setUsers") {
          setAllUsers(event.payload);

          // find local user from all users
          let self = event.payload.find(
            (user) => user.id == localPeerIdNoPrefix
          );
          if (self) {
            //If local user  found in array set local users mascot
            event.payload.forEach((user) => {
              if (user.id == localPeerIdNoPrefix) {
                setLocalUser((localUser) => ({
                  ...localUser,
                  mascot: user.mascot,
                }));
              }
            });
          } else {
            setConnections([]);
            showModal(
              "You have been kicked",
              "Admin of this box has kicked you",
              "",
              "OK",
              (cancel) => {
                setModalVisible(false);
              },
              (success) => {
                window.location.href = "/";
                setModalVisible(false);
              },
              true
            );
          }
        } else if (event.type == "getFile") {
          setLocalFiles((localFiles) => {
            // Find local file and start sending chunks
            const localFile = localFiles.find(
              (file) => file.id == event.payload
            );
            fileSender(localFile, 0, conn);

            return localFiles;
          });
        } else if (event.type == "chunk") {
          setSharedFiles((sharedFiles) => {
            let percentage = fileCatcher(event, sharedFiles);
            if (percentage >= 100) {
              percentage = 0;
            }
            setDownloads({
              [event.payload.fileId]: percentage,
            });

            return sharedFiles;
          });
        }
      });
    });

    return () => {
      //Cleanup event listeners;
      connections.forEach((conn) => {
        conn.off("data");
        conn.off("open");
      });
    };
  }, [connections]);

  // effect for showing toasts when users join or leave
  useEffect(() => {
    // Only push toasts if you are host and others joined or someone joined after you
    if ((allUsers.length > 1 && isHost) || (prevUsers || []).length >= 2) {
      const [insertedUsers, deletedUsers] = diffUsers(
        prevUsers || [],
        allUsers
      );

      insertedUsers.forEach((inserted) => {
        pushToast(`${inserted.mascot} joined`);
      });

      deletedUsers.forEach((deleted) => {
        pushToast(`${deleted.mascot} left`);
      });
    }
  }, [allUsers]);

  return (
    <div className="flex justify-center items-center mt-4 flex-col">
      <ToastContainer toasts={toasts} setToasts={setToasts} />
      <Modal
        visible={modalData.visible}
        title={modalData.title}
        body={modalData.body}
        cancelText={modalData.cancelText}
        successText={modalData.successText}
        onCancel={modalData.onCancel}
        onSuccess={modalData.onSuccess}
      />
      <div className="w-11/12 sm:w-[480px] relative">
        <ConnectionOverlay isConnected={isConnected} />
        {isHost ? <ShareButton onShare={shareHandler} /> : <></>}
        <h4 className="font-semibold mt-2 text-slate-400">Users</h4>
        <ul className="flex flex-wrap justify-center">
          {allUsers.map((u) => (
            <UserListItem
              key={u.id}
              onKick={() => kickUserHandler(u.id)}
              isAdmin={
                (isHost && u.id == localPeerIdNoPrefix) || u.id == remoteBoxId
              }
              isLocal={u.id == localPeerIdNoPrefix}
              mascot={u.mascot}
            />
          ))}
        </ul>
        <h4 className="font-semibold mt-2 text-slate-400">Files</h4>
        {showTutorial ? (
          <div className="hidden lg:block">
            <img
              className="absolute -translate-x-full h-48 top-8 -left-8"
              src={arrow1}
              alt=""
            />
            <p className="absolute top-0 -left-64 font-bold text-2xl">
              1. Add files
            </p>
            <img
              className="absolute translate-x-full h-48 -top-8 -right-8"
              src={arrow2}
              alt=""
            />
            <p className="absolute top-40 -right-96 font-bold text-2xl">
              2. Share it!
            </p>
            <img
              className="absolute translate-x-full w-32 top-48 -right-64"
              src={monkeyFace}
              alt=""
            />
          </div>
        ) : (
          <></>
        )}

        <ul className="flex items-center px-4 pt-4 pb-2 rounded-xl border border-stone-200  flex-col mt-4">
          <AddFileButton fileChange={fileInputChangeHandler} />
          {sharedFiles.map((f) => (
            <FileListItem
              key={f.id}
              mascot={f.owner.mascot}
              fileName={f.name}
              isLocal={f.owner.id == localPeerIdNoPrefix}
              onDelete={() => removeFileHandler(f.id)}
              onDownload={() => downloadFileHandler(f.id)}
              downloadPercentage={downloads?.[f.id] || 0}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
